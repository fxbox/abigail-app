import React, { Component } from 'react';
import moment from 'moment';

import './EditDialog.css';

const MODE = {
  CREATE: 0,
  EDIT: 1,
};

class EditDialog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mode: MODE.CREATE,
      display: false,
      id: null,
      recipients: [],
      action: '',
      due: Date.now(),
    };

    this.server = props.server;
    this.analytics = props.analytics;
    this.refreshReminders = props.refreshReminders;

    this.dueDateInput = null;
    this.dueTimeInput = null;

    this.onKeyPress = this.onKeyPress.bind(this);
    this.onChangeUsers = this.onChangeUsers.bind(this);
    this.onChangeAction = this.onChangeAction.bind(this);
    this.onChangeDue = this.onChangeDue.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onClose = this.onClose.bind(this);
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyPress);
  }

  /**
   * Circumvent a bug in Chrome for Android (tested in v.52 and v.53) where the
   * date and time inputs value are not populated via the `value` attribute and
   * must be set using the `value` property.
   */
  componentDidUpdate() {
    if (!this.dueDateInput || !this.dueTimeInput) {
      return;
    }

    const due = this.state.due;
    const date = moment(due).format('YYYY-MM-DD');
    const time = moment(due).format('HH:mm');

    this.dueDateInput.value = date;
    this.dueTimeInput.value = time;
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyPress);
  }

  onKeyPress(evt) {
    const display = this.state.display;

    if (!display) {
      return;
    }

    const key = evt.key;
    if (key === 'Escape') {
      this.hide();
    }
  }

  onChangeUsers(evt) {
    const recipients = [evt.target.value];
    this.setState({ recipients });
  }

  onChangeAction(evt) {
    const action = evt.target.value;

    if (action) {
      this.setState({ action });
    }
  }

  onChangeDue() {
    const date = this.dueDateInput.value.split('-');
    const time = this.dueTimeInput.value.split(':');

    try {
      const dueMoment = moment()
        .year(date[0]).month(date[1] - 1).date(date[2])
        .hour(time[0]).minute(time[1]);

      const due = Number(dueMoment.toDate());
      this.setState({ due });
    } catch (err) {
      console.error('Could not parse the input due date and time.');
    }
  }

  onSave() {
    const reminder = {
      recipients: this.state.recipients,
      action: this.state.action.trim(),
      due: this.state.due,
    };

    if (this.state.mode === MODE.EDIT) {
      reminder.id = this.state.id;
      this.server.reminders.update(reminder)
        .then(() => {
          this.analytics.event('reminders', 'edit');

          this.refreshReminders();
          this.hide();
        })
        .catch((err) => {
          console.error(err);

          this.analytics.event('reminders', 'error', 'edit-failed');

          this.hide();
          alert('The reminder could not be updated. Try again later.');
        });
    } else if (this.state.mode === MODE.CREATE) {
      this.server.reminders.set(reminder)
        .then(() => {
          this.analytics.event('reminders', 'create');

          this.refreshReminders();
          this.hide();
        })
        .catch((err) => {
          console.error(err);

          this.analytics.event('reminders', 'error', 'create-failed');

          this.hide();
          alert('The reminder could not be create. Try again later.');
        });
    }
  }

  onClose() {
    this.hide();
  }

  show(reminder = null) {
    if (reminder !== null) {
      this.setState({
        mode: MODE.EDIT,
        display: true,
        id: reminder.id,
        recipients: reminder.recipients,
        action: reminder.action,
        due: reminder.due,
      });

      this.analytics.event('reminders', 'start-edit');
    } else {
      this.setState({
        mode: MODE.CREATE,
        display: true,
        recipients: [],
        action: '',
        due: Date.now(),
      });

      this.analytics.event('reminders', 'start-create');
    }
  }

  hide() {
    this.setState({ display: false });
  }

  render() {
    if (!this.state.display) {
      return null;
    }

    let usersNode = null;
    if (this.state.mode === MODE.EDIT) {
      const users = this.state.recipients.map((user) => user.forename);
      usersNode = (
        <input className="dialog-content__input"
               value={users}
               disabled/>);
    } else {
      const users = this.server.reminders.getUsers();
      usersNode = (
        <select className="dialog-content__select"
                onChange={this.onChangeUsers}>
          {users.map((user) => (
            <option key={user} value={user}>{user}</option>
          ))}
        </select>);
    }

    return (
      <div>
        <div className="dialog-overlay"
             onClick={this.onClose}></div>

        <div className="dialog">
          <div className="dialog-title">
            <h3>Edit reminder</h3>
            <span className="dialog-title__close"
                  onClick={this.onClose}>Close</span>
          </div>

          <div className="dialog-content">
            <div className="dialog-content__section">
              <h4>Recipients</h4>
              {usersNode}
            </div>
            <div className="dialog-content__section">
              <h4>Action</h4>
              <textarea className="dialog-content__input"
                        value={this.state.action}
                        onChange={this.onChangeAction}/>
            </div>
            <div className="dialog-content__section">
              <h4>Due time</h4>
              <input className="dialog-content__input dialog-content__half"
                     type="date"
                     placeholder="YYYY-MM-DD"
                     onChange={this.onChangeDue}
                     ref={(t) => this.dueDateInput = t}/>
              <input className="dialog-content__input dialog-content__half"
                     type="time"
                     placeholder="HH:mm"
                     onChange={this.onChangeDue}
                     ref={(t) => this.dueTimeInput = t}/>
            </div>
          </div>

          <div className="dialog-buttons">
            <button className="dialog-buttons__save"
                    onClick={this.onSave}>Save
            </button>
            <button className="dialog-buttons__cancel"
                    onClick={this.onClose}>Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }
}

EditDialog.propTypes = {
  server: React.PropTypes.object.isRequired,
  analytics: React.PropTypes.object.isRequired,
  refreshReminders: React.PropTypes.func.isRequired,
};

export default EditDialog;
