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

    if (typeof TwitterCldr !== 'undefined') {
      TwitterCldr.set_data(TwitterCldrDataBundle);
      this.listFormatter = new TwitterCldr.ListFormatter();
    } else {
      this.listFormatter = {
        format: (a) => a.join(' and ')
      };
    }

    this.reminder = props.reminder;
    this.onDelete = props.onDelete;
    this.onEdit = props.onEdit;
  }

  getColour(forenames = '') {
    const hash = (string) => {
      let hash = 0, i, chr, len;
      string = string.toLowerCase().trim();
      if (string.length === 0) {
        return 0;
      }
      for (i = 0, len = string.length; i < len; i++) {
        chr = string.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
      }
      return Math.abs(hash);
    };

    return COLOURS[hash(forenames) % COLOURS.length];
  }

  render() {
    const reminder = this.reminder;
    const users = ((reminder && reminder.recipients) || [])
      .map((user) => user.forename);
    const recipients = this.listFormatter.format(users);
    const contentClassName = [
      'reminders__item-content',
      this.getColour(recipients),
    ]
      .join(' ');

    return (
      <li className="reminders__item">
        <div className="reminders__item-time">
          {moment((reminder && reminder.due) || undefined).format('LT')}
        </div>
        <div className={contentClassName}>
          <h3 className="reminders__item-recipient">
            {recipients}
          </h3>
          <p className="reminders__item-text">
            <span>{(reminder && reminder.action) || ''}</span>
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
  reminder: React.PropTypes.object,
  onDelete: React.PropTypes.func,
  onEdit: React.PropTypes.func,
};

export default ReminderItem;
