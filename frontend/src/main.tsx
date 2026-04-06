import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log('Main.tsx: App starting...');

window.onerror = (msg, _url, _line, _col, error) => {
  console.error('GLOBAL ERROR:', msg, error);
  document.body.innerHTML = `<div style="padding: 20px; color: red;"><h1>Runtime Error</h1><pre>${msg}</pre></div>`;
  return false;
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('ROOT ELEMENT NOT FOUND');
} else {
  console.log('Root element found, rendering...');
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
