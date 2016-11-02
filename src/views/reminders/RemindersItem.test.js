import React from 'react';
import ReactDOM from 'react-dom';
import ReminderItem from './ReminderItem';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<ReminderItem/>, div);
});
