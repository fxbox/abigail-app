import React, { Component } from 'react';

import './FullScreen.css';

class FullScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isFullScreen: false,
    };

    this.fullScreenEnabled =
      (document.fullscreenEnabled ||
      document.mozFullscreenEnabled || document.mozFullScreenEnabled ||
      document.webkitFullscreenEnabled || document.msFullscreenEnabled);

    this.onFullScreenChange = this.onFullScreenChange.bind(this);
    this.onFullScreen = this.onFullScreen.bind(this);
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

    if (!isFullScreen) {
      return;
    }

    // If we're in fullscreen mode, let's try to lock the orientation.
    if (screen && 'orientation' in screen && 'lock' in screen.orientation) {
      screen.orientation.lock('landscape')
        .catch(() => {
          // Don't panic. We're probably just on desktop.
        });
    }
  }

  onFullScreen() {
    if (this.state.isFullScreen) {
      return;
    }

    const target = document.body;

    if (target.requestFullscreen) {
      target.requestFullscreen();
    } else if (target.msRequestFullscreen) {
      target.msRequestFullscreen();
    } else if (target.mozRequestFullScreen) {
      target.mozRequestFullScreen();
    } else if (target.mozRequestFullscreen) {
      target.mozRequestFullscreen();
    } else if (target.webkitRequestFullscreen) {
      target.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  }

  render() {
    if (!this.fullScreenEnabled || this.state.isFullScreen) {
      return null;
    }

    return (
      <button className="full-screen__button"
              onClick={this.onFullScreen}/>
    );
  }
}

export default FullScreen;
