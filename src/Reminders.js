import React, { Component } from 'react';
import moment from 'moment';

import Toaster from './views/Toaster';
import Microphone from './views/Microphone';
import RemindersList from './views/reminders/RemindersList';

class Reminders extends Component {
  constructor(props) {
    super(props);

    this.state = {
      reminders: [],
    };

    this.speechController = props.route.speechController;
    this.server = props.route.server;
    this.analytics = props.route.analytics;

    this.refreshInterval = null;
    this.toaster = null;
    this.microphone = null;
    this.debugEvent = this.debugEvent.bind(this);
    this.onWakeWord = this.onWakeWord.bind(this);
    this.onReminder = this.onReminder.bind(this);
    this.onParsingFailure = this.onParsingFailure.bind(this);
    this.onWebPushMessage = this.onWebPushMessage.bind(this);
    this.refreshReminders = this.refreshReminders.bind(this);
    this.addReminder = this.addReminder.bind(this);

    moment.locale(navigator.languages || navigator.language || 'en-US');
  }

  componentDidMount() {
    this.refreshReminders()
      .then(() => {
        console.log('Reminders loaded');
      });

    // Refresh the page every 10 seconds if idle.
    this.refreshInterval = setInterval(() => {
      this.refreshReminders()
        .then(() => {
          console.log('Reminders loaded');
        });
    }, 10 * 1000);

    this.speechController.on('wakelistenstart', this.debugEvent);
    this.speechController.on('wakelistenstop', this.debugEvent);
    this.speechController.on('wakeheard', this.debugEvent);
    this.speechController.on('speechrecognitionstart', this.debugEvent);
    this.speechController.on('speechrecognitionstop', this.debugEvent);
    this.speechController.on('reminder', this.debugEvent);

    this.speechController.on('wakeheard', this.onWakeWord);
    this.speechController.on('reminder', this.onReminder);
    this.speechController.on('parsing-failed', this.onParsingFailure);
    this.server.on('push-message', this.onWebPushMessage);
  }

  componentWillUnmount() {
    clearInterval(this.refreshInterval);

    this.speechController.off('wakelistenstart', this.debugEvent);
    this.speechController.off('wakelistenstop', this.debugEvent);
    this.speechController.off('wakeheard', this.debugEvent);
    this.speechController.off('speechrecognitionstart', this.debugEvent);
    this.speechController.off('speechrecognitionstop', this.debugEvent);
    this.speechController.off('reminder', this.debugEvent);

    this.speechController.off('wakeheard', this.onWakeWord);
    this.speechController.off('reminder', this.onReminder);
    this.speechController.off('parsing-failed', this.onParsingFailure);
    this.server.off('push-message', this.onWebPushMessage);
  }

  debugEvent(evt) {
    if (evt.result !== undefined) {
      console.log(evt.type, evt.result);
      return;
    }

    console.log(evt.type);
  }

  refreshReminders() {
    // @todo Add a loader.
    return this.server.reminders.getAll()
      .then((reminders) => {
        this.setState({ reminders });
      });
  }

  addReminder(reminder) {
    const reminders = this.state.reminders;
    reminders.push(reminder);

    this.setState({ reminders });
  }

  onWakeWord() {
    this.analytics.event('wakeword', 'recognised');

    this.microphone.startListeningToSpeech();
  }

  onReminder(evt) {
    const { intent, recipients, action, due, confirmation } = evt.result;

    if (intent !== 'reminder') {
      console.info('Only intent of type `reminder` are supported now.');
      const message = 'I can only understand new reminders. ' +
        'Try saying "Remind me to go the hairdresser tomorrow at 5pm".';
      this.toaster.info(message);
      this.speechController.speak(message)
        .then(() => {
          this.toaster.hide();
          this.speechController.startListeningForWakeword();
        });
      return;
    }

    this.microphone.stopListeningToSpeech();

    // @todo Nice to have: optimistic update.
    // https://github.com/fxbox/calendar/issues/32
    this.server.reminders
      .set({
        recipients,
        action,
        due,
      })
      .then((reminder) => {
        this.analytics.event('reminders', 'create');

        this.addReminder(reminder);

        this.toaster.success(confirmation);
        this.speechController.speak(confirmation)
          .then(() => {
            console.log('Utterance terminated.');
            this.toaster.hide();
            this.speechController.startListeningForWakeword();
          });
      })
      .catch((res) => {
        console.warn('Saving the reminder failed.', res);

        this.analytics.event('reminders', 'error', 'create-failed');

        const message = 'This reminder could not be saved. ' +
          'Please try again later.';
        this.toaster.warning(message);
        this.speechController.speak(message)
          .then(() => {
            this.toaster.hide();
            this.speechController.startListeningForWakeword();
          });
      });
  }

  onParsingFailure() {
    this.microphone.stopListeningToSpeech();

    this.analytics.event('reminders', 'parsing-failed');

    const message = 'I did not understand that. Can you repeat?';
    this.toaster.warning(message);
    this.speechController.speak(message)
      .then(() => {
        console.log('Utterance terminated.');
        this.toaster.hide();
        this.speechController.startListeningForWakeword();
      });
  }

  onWebPushMessage(message) {
    const id = message.fullMessage.id;

    // We don't want to delete them, merely remove it from our local state.
    // At reload, we shouldn't get it because their status changed server-side
    // too.
    const reminders = this.state.reminders
      .filter((reminder) => reminder.id !== id);
    this.setState({ reminders });
  }

  // @todo Add a different view when there's no reminders:
  // https://github.com/fxbox/calendar/issues/16
  render() {
    return (
      <section className="reminders">
        <Toaster ref={(t) => this.toaster = t}/>
        <div className="microphone">
          <Microphone ref={(t) => this.microphone = t}
                      speechController={this.speechController}
                      server={this.server}
                      analytics={this.analytics}/>
        </div>
        <RemindersList reminders={this.state.reminders}
                       server={this.server}
                       analytics={this.analytics}
                       refreshReminders={this.refreshReminders}/>
      </section>
    );
  }
}

export default Reminders;
