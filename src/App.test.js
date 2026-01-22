import React from 'react';
import App from './App';

// Skip DOM-based tests when running in environments without jsdom (e.g., bun test)
const hasDOM = typeof document !== 'undefined';

(hasDOM ? it : it.skip)('renders without crashing', () => {
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
