import React, { Component } from 'react';

import './NewReminder.css';
import plusImage from '../icons/plus.svg';

class NewReminder extends Component {
  constructor(props) {
    super(props);

    this.analytics = props.analytics;
    this.editDialog = props.editDialog;

    this.createReminderHandler = this.createReminderHandler.bind(this);
  }

  componentWillReceiveProps(props) {
    this.editDialog = props.editDialog;
  }

  createReminderHandler() {
    this.editDialog.show();
  }

  render() {
    return (
      <div className="new-reminder">
        <img src={plusImage}
             role="presentation"
             onClick={this.createReminderHandler}/>
      </div>
    );
  }
}

export default NewReminder;
