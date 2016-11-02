import React, { Component } from 'react';
import groupBy from 'lodash/groupBy';
import moment from 'moment';

import ReminderItem from './ReminderItem';

class RemindersList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      reminders: props.reminders,
    };

    this.server = props.server;
    this.analytics = props.analytics;
    this.refreshReminders = props.refreshReminders;
    this.editDialog = props.editDialog;
  }

  componentWillReceiveProps(props) {
    this.setState({ reminders: props.reminders });
    this.editDialog = props.editDialog;
  }

  onEdit(id) {
    const reminder = this.state.reminders
      .find((reminder) => reminder.id === id);
    this.editDialog.show(reminder);
  }

  onDelete(id) {
    // @todo Nice to have: optimistic update.
    this.server.reminders.delete(id)
      .then(() => {
        this.analytics.event('reminders', 'delete');

        const reminders = this.state.reminders
          .filter((reminder) => reminder.id !== id);
        this.setState({ reminders });
      })
      .catch(() => {
        this.analytics.event('reminders', 'error', 'delete-failed');

        console.error(`The reminder ${id} could not be deleted.`);
      });
  }

  render() {
    let reminders = this.state.reminders;

    if (!reminders) {
      return null;
    }

    // Sort all the reminders chronologically.
    reminders = reminders.sort((a, b) => {
      return a.due - b.due;
    });

    // Group the reminders by month.
    reminders = groupBy(reminders, (reminder) => {
      return moment(reminder.due).format('YYYY/MM');
    });

    // For each month, group the reminders by day.
    Object.keys(reminders).forEach((month) => {
      reminders[month] = groupBy(reminders[month], (reminder) => {
        return moment(reminder.due).format('YYYY/MM/DD');
      });
    });

    const remindersNode = Object.keys(reminders).map((key) => {
      const month = moment(key, 'YYYY/MM').format('MMMM');
      const reminderMonth = reminders[key];

      return (
        <div key={key}>
          <h2 className="reminders__month">{month}</h2>
          {Object.keys(reminderMonth).map((key) => {
            const date = moment(key, 'YYYY/MM/DD');
            const remindersDay = reminderMonth[key];

            return (
              <div key={key} className="reminders__day">
                <div className="reminders__day-date">
                  <div className="reminders__day-mday">
                    {date.format('DD')}
                  </div>
                  <div className="reminders__day-wday">
                    {date.format('ddd')}
                  </div>
                </div>
                <ol className="reminders__list">
                  {remindersDay.map((reminder) => {
                    return (<ReminderItem
                      key={reminder.id}
                      reminder={reminder}
                      onDelete={this.onDelete.bind(this, reminder.id)}
                      onEdit={this.onEdit.bind(this, reminder.id)}
                    />);
                  })}
                </ol>
              </div>
            );
          })}
        </div>
      );
    });

    return (
      <div>
        {remindersNode}
      </div>
    );
  }
}

RemindersList.propTypes = {
  server: React.PropTypes.object,
  analytics: React.PropTypes.object,
  reminders: React.PropTypes.array,
  refreshReminders: React.PropTypes.func,
  editDialog: React.PropTypes.object,
};

export default RemindersList;
