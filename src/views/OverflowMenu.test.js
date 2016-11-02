import React from 'react';
import ReactDOM from 'react-dom';
import OverflowMenu from './OverflowMenu';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<OverflowMenu/>, div);
});
