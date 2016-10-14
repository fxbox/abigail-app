import Component from 'react/lib/ReactComponent';
import history from 'react-router/lib/hashHistory'

class Home extends Component {
  constructor(props = {}) {
    super(props);

    this.server = props.route && props.route.server;
  }

  componentWillMount() {
    if (!window.sessionStorage) {
      // The following code won't work under Node.js.
      return;
    }

    if (this.server && this.server.isLoggedIn) {
      this.subscribeToNotifications();
      history.push('reminders');
    } else {
      history.push('login');
    }
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
