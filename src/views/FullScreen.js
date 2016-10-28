import React, { Component } from 'react';

import './FullScreen.css';
import fullScreenImage from '../icons/full-screen.svg';

class FullScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isFullScreen: false,
    };

    this.fullScreenEnabled =
      (document.fullscreenEnabled ||
      document.mozFullScreenEnabled || document.webkitFullscreenEnabled ||
      document.msFullscreenEnabled);

    this.analytics = props.analytics;

    this.onFullScreenChange = this.onFullScreenChange.bind(this);
    this.onEnterFullScreen = this.onEnterFullScreen.bind(this);
    this.onExitFullScreen = this.onExitFullScreen.bind(this);
  }

  componentDidMount() {
    [
      'fullscreenchange',
      'mozfullscreenchange',
      'webkitfullscreenchange',
      'MSFullscreenChange',
    ].forEach((type) => {
      document.addEventListener(type, this.onFullScreenChange);
    });
  }

  componentWillUnmount() {
    [
      'fullscreenchange',
      'mozfullscreenchange',
      'webkitfullscreenchange',
      'MSFullscreenChange',
    ].forEach((type) => {
      document.removeEventListener(type, this.onFullScreenChange);
    });
  }

  onFullScreenChange() {
    const isFullScreen = !!
      (document.fullscreenElement ||
      document.mozFullScreenElement || document.webkitFullscreenElement ||
      document.msFullscreenElement);

    this.setState({ isFullScreen });
  }

  onEnterFullScreen() {
    if (this.state.isFullScreen) {
      return;
    }

    const target = document.body;

    if (target.requestFullscreen) {
      target.requestFullscreen();
    } else if (target.mozRequestFullScreen) {
      target.mozRequestFullScreen();
    } else if (target.msRequestFullscreen) {
      target.msRequestFullscreen();
    } else if (target.webkitRequestFullscreen) {
      target.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }

    this.analytics.event('ui', 'enter-fullscreen');
  }

  onExitFullScreen() {
    if (!this.state.isFullScreen) {
      return;
    }

    const target = document;

    if (target.exitFullscreen) {
      target.exitFullscreen();
    } else if (target.mozCancelFullScreen) {
      target.mozCancelFullScreen();
    } else if (target.msExitFullscreen) {
      target.msExitFullscreen();
    } else if (target.webkitExitFullscreen) {
      target.webkitExitFullscreen();
    }

    this.analytics.event('ui', 'exit-fullscreen');
  }

  render() {
    if (!this.fullScreenEnabled) {
      return null;
    }

    let label = 'Go full screen';
    let action = this.onEnterFullScreen;
    if (this.state.isFullScreen) {
      label = 'Exit full screen';
      action = this.onExitFullScreen;
    }

    return (
      <li>
        <button onClick={action}>
          <img src={fullScreenImage}
               role="presentation"/>
          {label}
        </button>
      </li>
    );
  }
}

export default FullScreen;
