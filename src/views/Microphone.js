import React, { Component } from 'react';

import './Microphone.css';
import microphoneImage from '../icons/microphone.svg';

class Microphone extends Component {
  constructor(props) {
    super(props);

    const WEBSPEECHAPI_SUPPORT = 'SpeechRecognition' in window ||
      'webkitSpeechRecognition' in window;

    this.state = {
      webSpeechAPISupport: WEBSPEECHAPI_SUPPORT,
      isListeningToSpeech: false,
    };

    this.speechController = props.speechController;
    this.server = props.server;
    this.analytics = props.analytics;

    this.audioCtx = 'AudioContext' in window ? new AudioContext() : null;
    this.audioBuffer = null;
    this.bufferSource = null;
    this.timeout = null;

    this.startListeningToSpeech = this.startListeningToSpeech.bind(this);
    this.stopListeningToSpeech = this.stopListeningToSpeech.bind(this);
    this.onClickMic = this.onClickMic.bind(this);
  }

  componentDidMount() {
    this.loadAudio();

    this.speechController.on('speechrecognitionstop',
      this.stopListeningToSpeech);
  }

  componentWillUnmount() {
    this.speechController.off('speechrecognitionstop',
      this.stopListeningToSpeech);
  }

  loadAudio() {
    fetch(`${process.env.PUBLIC_URL}/media/tune.wav`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(res.status);
        }

        return res.arrayBuffer();
      })
      .then((arrayBuffer) => {
        if (!this.audioCtx) {
          throw new Error('Web Audio API is not supported.');
        }

        this.audioCtx.decodeAudioData(arrayBuffer, (buffer) => {
          this.audioBuffer = buffer;
        }, (err) => {
          console.error('The audio buffer could not be decoded.', err);
        });
      });
  }

  playBleep() {
    if (!this.audioBuffer || !this.audioCtx) {
      return;
    }

    this.bufferSource = this.audioCtx.createBufferSource();
    this.bufferSource.buffer = this.audioBuffer;
    this.bufferSource.connect(this.audioCtx.destination);
    this.bufferSource.start(0);
  }

  stopBleep() {
    if (!this.bufferSource) {
      return;
    }

    this.bufferSource.stop(0);
    this.bufferSource = null;
  }

  startListeningToSpeech() {
    this.playBleep();
    this.setState({ isListeningToSpeech: true });
  }

  stopListeningToSpeech() {
    this.stopBleep();
    this.setState({ isListeningToSpeech: false });
  }

  onClickMic() {
    if (!this.state.isListeningToSpeech) {
      this.analytics.event('microphone', 'tap', 'start-listening');

      this.playBleep();
      this.setState({ isListeningToSpeech: true });
      this.timeout = setTimeout(() => {
        // When the sound finished playing
        this.stopBleep();
        this.speechController.startSpeechRecognition();
      }, 1000);
      return;
    }

    this.analytics.event('microphone', 'tap', 'stop-listening');

    clearTimeout(this.timeout);
    this.stopBleep();
    this.setState({ isListeningToSpeech: false });
    this.speechController.stopSpeechRecognition();
  }

  render() {
    if (!this.server.isLoggedIn || !this.state.webSpeechAPISupport) {
      return null;
    }

    const className = this.state.isListeningToSpeech ? 'listening' : null;

    return (
      <div className="microphone">
        <div className={className} onClick={this.onClickMic}>
          <div className="microphone__background"></div>
          <img className="microphone__icon"
               src={microphoneImage}
               role="presentation"/>
        </div>
      </div>
    );
  }
}

Microphone.propTypes = {
  speechController: React.PropTypes.object.isRequired,
  server: React.PropTypes.object.isRequired,
  analytics: React.PropTypes.object.isRequired,
};

export default Microphone;
