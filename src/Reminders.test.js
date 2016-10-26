import React from 'react';
import ReactDOM from 'react-dom';
import Reminders from './Reminders';

it('renders without crashing', () => {
  const div = document.createElement('div');
  const mockProps = {
    speechController: {
      on: () => {
      },
      off: () => {
      },
    },
    server: {
      on: () => {
      },
      off: () => {
      },
      reminders: {
        getUsers: () => [],
        getAll: () => {
          return Promise.resolve();
        },
      },
    },
    analytics: {},
  };
  ReactDOM.render(<Reminders route={mockProps}/>, div);
});
