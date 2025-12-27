import React from 'react';
import App from './App';

it('renders without crashing', () => {
  const div = document.createElement('div');
  try {
    const { createRoot } = require('react-dom/client');
    const root = createRoot(div);
    root.render(<App />);
    root.unmount();
  } catch (_err) {
    const ReactDOM = require('react-dom');
    ReactDOM.render(<App />, div);
    ReactDOM.unmountComponentAtNode(div);
  }
});
