import React from 'react';
import ReactDOM from 'react-dom';
import Route from 'react-router/lib/Route'
import Router from 'react-router/lib/Router'
import history from 'react-router/lib/hashHistory'

import Home from './Home';
import Login from './Login';
import Logout from './Logout';
import Reminders from './Reminders';
import FullScreen from './FullScreen';

import SpeechController from './lib/speech-controller';
import Settings from './lib/common/settings';
import Analytics from './lib/analytics';
import Server from './lib/server/index';

import './index.css';

const speechController = new SpeechController();
const settings = new Settings();
const analytics = new Analytics({ settings });
const server = new Server({ settings });
const options = {
  speechController, server, settings, analytics,
};

const subscribeToNotifications = () => {
  server.subscribeToNotifications()
    .catch((err) => {
      console.error('Error while subscribing to notifications:', err);
    });
};

server.on('login', () => subscribeToNotifications());
server.on('push-message', (message) => {
  if (settings.isHub) {
    speechController.speak(`${message.title}: ${message.body}`);
  }
});

ReactDOM.render(
  <Router history={history}>
    <Route path="/" component={Home} {...options}/>
    <Route path="login" component={Login} {...options}/>
    <Route path="logout" component={Logout} {...options}/>
    <Route path="reminders" component={Reminders} {...options}/>
  </Router>,
  document.querySelector('.app-view-container')
);

ReactDOM.render(
  <FullScreen/>,
  document.querySelector('.full-screen')
);
