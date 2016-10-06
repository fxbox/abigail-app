import React from 'react';
import ReactDOM from 'react-dom';
import Toaster from './Toaster';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Toaster/>, div);
});
