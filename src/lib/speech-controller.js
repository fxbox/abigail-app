import IntentParser from 'intent-parser';
import EventDispatcher from './common/event-dispatcher';
import SpeechRecogniser from './speech/recogniser';
import SpeechSynthesis from './speech/synthesis';

const p = Object.freeze({
  // Properties
  speechRecogniser: Symbol('speechRecogniser'),
  speechSynthesis: Symbol('speechSynthesis'),
  idle: Symbol('idle'),

  // Methods
  listenForUtterance: Symbol('listenForUtterance'),
  handleSpeechRecognitionEnd: Symbol('handleSpeechRecognitionEnd'),
  intentParser: Symbol('intentParser'),
});

const EVENT_INTERFACE = [
  // Emit when the speech recognition engine starts listening
  // (And _could_ be sending speech over the network)
  'speechrecognitionstart',

  // Emit when the speech recognition engine returns a recognised phrase
  'speechrecognitionstop',

  // Emit when an intent is successfully parsed and we have a reminder object.
  'reminder',

  // Emit when a reminder could not be parsed from a text.
  'parsing-failed',
];

export default class SpeechController extends EventDispatcher {
  constructor() {
    super(EVENT_INTERFACE);

    this[p.idle] = true;

    this[p.speechRecogniser] = new SpeechRecogniser();
    this[p.speechSynthesis] = new SpeechSynthesis();
    this[p.intentParser] = new IntentParser();

    Object.seal(this);
  }

  get idle() {
    return this[p.idle];
  }

  startSpeechRecognition() {
    this[p.idle] = false;

    return this[p.listenForUtterance]()
      .then(this[p.handleSpeechRecognitionEnd].bind(this))
      .catch((err) => {
        console.log('startSpeechRecognition err', err);
        this.emit(EVENT_INTERFACE[1], { type: EVENT_INTERFACE[1] });
        this.stopSpeechRecognition();
      });
  }

  stopSpeechRecognition() {
    return this[p.speechRecogniser].abort();
  }

  /**
   * Speak a text aloud.
   *
   * @param {string} text
   * @return {Promise} A promise that resolves when the utterance is finished.
   */
  speak(text = '') {
    return this[p.speechSynthesis].speak(text);
  }

  [p.listenForUtterance]() {
    this.emit(EVENT_INTERFACE[0], { type: EVENT_INTERFACE[0] });
    return this[p.speechRecogniser].listenForUtterance();
  }

  [p.handleSpeechRecognitionEnd](result) {
    this.emit(EVENT_INTERFACE[1], { type: EVENT_INTERFACE[1], result });

    // Parse intent
    this[p.intentParser].parse(result.utterance)
      .then((reminder) => {
        this.emit(EVENT_INTERFACE[2], {
          type: EVENT_INTERFACE[2],
          result: reminder,
        });
      })
      .catch((err) => {
        this.emit(EVENT_INTERFACE[3], {
          type: EVENT_INTERFACE[3],
          result: result.utterance,
        });

        console.error('Error while parsing the sentence:', err);
        console.error('Sentence was:', result.utterance);
      });
  }
}
