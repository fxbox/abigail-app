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
      dueMoment: null,
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
    const datetime = `${this.dueDateInput.value} ${this.dueTimeInput.value}`;
    const dueMoment = moment(datetime);

    if (dueMoment.isValid()) {
      this.setState({ dueMoment });
    }
  }

  onSave() {
    const reminder = {
      recipients: this.state.recipients,
      action: this.state.action.trim(),
      due: Number(this.state.dueMoment.toDate()),
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
        dueMoment: moment(reminder.due),
      });

      this.analytics.event('reminders', 'start-edit');
    } else {
      this.setState({
        mode: MODE.CREATE,
        display: true,
        recipients: [],
        action: '',
        dueMoment: moment(),
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
                     defaultValue={moment(this.state.dueMoment).format('YYYY-MM-DD')}
                     type="date"
                     placeholder="YYYY-MM-DD"
                     onChange={this.onChangeDue}
                     ref={(t) => this.dueDateInput = t}/>
              <input className="dialog-content__input dialog-content__half"
                     defaultValue={moment(this.state.dueMoment).format('HH:mm')}
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
