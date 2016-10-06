import React from 'react';
import ReactDOM from 'react-dom';
import Microphone from './Microphone';

it('renders without crashing', () => {
  const div = document.createElement('div');
  const mockProps = {
    speechController: {
      on: () => {
      },
      off: () => {
      },
    },
    server: {},
    analytics: {},
  };
  ReactDOM.render(<Microphone {...mockProps}/>, div);
});
