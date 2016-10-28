import React from 'react';
import ReactDOM from 'react-dom';
import FullScreen from './FullScreen';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<FullScreen/>, div);
});
