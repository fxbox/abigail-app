import React, { Component } from 'react';
import history from 'react-router/lib/hashHistory'

import Toaster from './views/Toaster';

import './Login.css';
import loginImage from './icons/next.svg';

class Login extends Component {
  constructor(props = {}) {
    super(props);

    this.state = {
      login: '', // A phone number
      password: '',
    };

    this.server = props.route.server;
    this.analytics = props.route.analytics;

    this.loginField = null;
    this.toaster = null;
    this.toasterTimeout = null;

    this.onChange = this.onChange.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);
    this.onFormSubmit = this.onFormSubmit.bind(this);
  }

  onChange(evt) {
    const login = this.cleanPhoneNumber(evt.target.value);
    this.setState({ login });
  }

  onChangePassword(evt) {
    const password = evt.target.value;
    this.setState({ password });
  }

  cleanPhoneNumber(string = '') {
    return string
      .replace(/\+1/g, '') // Remove the country code.
      .replace(/\D+/g, '') // Remove non numeric characters.
      .substring(0, 10);
  }

  onFormSubmit(evt) {
    evt.preventDefault(); // Avoid redirection to /?.

    this.server.login(this.state.login, this.state.password)
      .then(() => {
        this.analytics.event('user', 'login');
        this.server.subscribeToNotifications();
        history.push('reminders');
      })
      .catch((err) => {
        if (err.statusCode === 401) {
          this.toaster.danger(`The phone number and the password don't match.`);

          clearTimeout(this.toasterTimeout);
          this.toasterTimeout = setTimeout(() => {
            this.toaster.hide();
          }, 5000);
        }
      });
  }

  render() {
    return (
      <form className="user-login" onSubmit={this.onFormSubmit}>
        <Toaster ref={(t) => this.toaster = t}/>
        <h1 className="user-login__header">Project Abigail</h1>
        <input type="number"
               value={this.state.login}
               pattern="[0-9]{10}"
               placeholder="Phone number"
               className="user-login__name-field"
               ref={(t) => this.loginField = t}
               onChange={this.onChange}/>
        <input type="password"
               value={this.state.password}
               className="user-login__password-field"
               onChange={this.onChangePassword}/>
        <button className="user-login__login-button">
          <img src={loginImage}
               role="presentation"/>
        </button>
      </form>
    );
  }
}

export default Login;
