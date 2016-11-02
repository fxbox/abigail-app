import React from 'react';
import ReactDOM from 'react-dom';
import Reminders from './Reminders';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Reminders/>, div);
});
