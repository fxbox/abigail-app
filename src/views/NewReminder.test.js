import React from 'react';
import ReactDOM from 'react-dom';
import NewReminder from './NewReminder';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<NewReminder/>, div);
});
