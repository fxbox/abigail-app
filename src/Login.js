import React, { Component } from 'react';
import history from 'react-router/lib/hashHistory'

import './Login.css';
import loginImage from './icons/next.svg';

class Login extends Component {
  constructor(props = {}) {
    super(props);

    this.state = {
      login: 'mozilla',
    };

    this.server = props.route.server;
    this.analytics = props.route.analytics;

    this.onChange = this.onChange.bind(this);
    this.onFormSubmit = this.onFormSubmit.bind(this);
  }

  onChange(evt) {
    const login = evt.target.value;
    this.setState({ login });
  }

  onFormSubmit() {
    this.server.login(this.state.login, 'password')
      .then(() => {
        this.analytics.event('user', 'login');
        history.push('reminders');
      });
  }

  render() {
    return (
      <form className="user-login" onSubmit={this.onFormSubmit}>
        <input value={this.state.login}
               placeholder="Family name"
               className="user-login__name-field"
               onChange={this.onChange}/>
        <button className="user-login__login-button">
          <img src={loginImage}
               role="presentation"/>
        </button>
      </form>
    );
  }
}

export default Login;
