import { Component } from 'react';
import history from 'react-router/lib/hashHistory'

class Logout extends Component {
  constructor(props = {}) {
    super(props);

    this.server = props.route.server;

    setTimeout(() => {
      this.server.logout()
        .then(() => {
          // Once logged out, we redirect to the login page.
          history.push('/');
        });
    });
  }

  render() {
    return null;
  }
}

export default Logout;
