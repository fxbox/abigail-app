import React from 'react';
import ReactDOM from 'react-dom';
import RemindersList from './RemindersList';

it('renders without crashing', () => {
  const div = document.createElement('div');
  const mockProps = {
    server: {},
    analytics: {},
    refreshReminders: () => {
    },
  };
  ReactDOM.render(<RemindersList {...mockProps}/>, div);
});
