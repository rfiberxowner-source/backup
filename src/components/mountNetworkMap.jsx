import React from 'react';
import { createRoot } from 'react-dom/client';
import NetworkMap from './NetworkMap.jsx';

window.mountNetworkMap = (elementId) => {
  const container = document.getElementById(elementId);
  if (container) {
    const root = createRoot(container);
    root.render(<NetworkMap />);
    return root;
  }
};
