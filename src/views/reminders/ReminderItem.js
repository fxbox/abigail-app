/* global TwitterCldr, TwitterCldrDataBundle */

import React, { Component } from 'react';
import moment from 'moment';

const COLOURS = [
  'red',
  'salmon',
  'goldenrod',
  'orange',
  'green',
  'cyan',
  'blue',
  'violet',
  'slategrey',
  'grey',
];

class ReminderItem extends Component {
  constructor(props) {
    super(props);

    TwitterCldr.set_data(TwitterCldrDataBundle);
    this.listFormatter = new TwitterCldr.ListFormatter();
    this.reminder = props.reminder;
    this.onDelete = props.onDelete;
    this.onEdit = props.onEdit;
  }

  getColour(name = '') {
    const hash = (string) => {
      let hash = 0, i, chr, len;
      if (string.length === 0) {
        return 0;
      }
      for (i = 0, len = string.length; i < len; i++) {
        chr = string.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
      }
      return hash;
    };

    return COLOURS[hash(name) % COLOURS.length];
  }

  render() {
    const reminder = this.reminder;
    const recipients = this.listFormatter.format(reminder.recipients);
    const contentClassName = [
      'reminders__item-content',
      this.getColour(recipients),
    ]
      .join(' ');

    return (
      <li className="reminders__item">
        <div className="reminders__item-time">
          <div>{moment(reminder.due).format('LT')}</div>
        </div>
        <div className={contentClassName}>
          <h3 className="reminders__item-recipient">
            {recipients}
          </h3>
          <p className="reminders__item-text">
            {reminder.action}
            <button className="reminders__button reminders__edit"
                    onClick={this.onEdit}>
              Edit
            </button>
            <button className="reminders__button reminders__delete"
                    onClick={this.onDelete}>
              Delete
            </button>
          </p>
        </div>
      </li>
    );
  }
}

ReminderItem.propTypes = {
  reminder: React.PropTypes.object.isRequired,
  onDelete: React.PropTypes.func.isRequired,
  onEdit: React.PropTypes.func.isRequired,
};

export default ReminderItem;
