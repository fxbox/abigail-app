import { Component } from 'react';
import history from 'react-router/lib/hashHistory'

class Home extends Component {
  constructor(props = {}) {
    super(props);

    this.server = props.route.server;

    setTimeout(() => {
      if (this.server.isLoggedIn) {
        this.subscribeToNotifications();
        history.push('reminders');
      } else {
        history.push('login');
      }
    });
  }

  subscribeToNotifications() {
    this.server.subscribeToNotifications()
      .catch((err) => {
        console.error('Error while subscribing to notifications:', err);
      });
  }

  render() {
    return null;
  }
}

export default Home;
