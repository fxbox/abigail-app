import React from 'react';
import ReactDOM from 'react-dom';
import EditDialog from './EditDialog';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<EditDialog/>, div);
});
