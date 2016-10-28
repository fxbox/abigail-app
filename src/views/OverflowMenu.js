import React, { Component } from 'react';
import history from 'react-router/lib/hashHistory'
import FullScreen from './FullScreen';

import './OverflowMenu.css';
import menuImage from '../icons/menu.svg';
import logOutImage from '../icons/log-out.svg';

class OverflowMenu extends Component {
  constructor(props) {
    super(props);

    this.state = {
      display: false,
    };

    this.server = props.server;
    this.analytics = props.analytics;

    this.onToggleMenu = this.onToggleMenu.bind(this);
    this.onLogOut = this.onLogOut.bind(this);
  }

  onToggleMenu() {
    let display = !this.state.display;
    this.setState({ display });

    this.analytics.event('ui', display ? 'open-menu' : 'close-menu');
  }

  onLogOut() {
    if (typeof sessionStorage === 'undefined') {
      // The following code won't work under Node.js.
      return;
    }

    if (this.server && this.server.logout) {
      this.server.logout()
        .then(() => {
          // Once logged out, we redirect to the login page.
          history.push('/');
        });
    }
  }

  render() {
    let className = 'menu-items';
    if (this.state.display) {
      className += ' visible';
    }

    return (
      <div className="OverflowMenu">
        <img src={menuImage}
             role="presentation"
             onClick={this.onToggleMenu}/>
        <div className={className}>
          <ul>
            <FullScreen analytics={this.analytics}/>
            <li>
              <button onClick={this.onLogOut}>
                <img src={logOutImage}
                     role="presentation"/>
                Log out
              </button>
            </li>
            <li>
              <button className="log-out"
                      onClick={this.onToggleMenu}>
                Close menu
              </button>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

export default OverflowMenu;
