import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Buffer } from 'buffer'
import './index.css'
import App from './App.tsx'

// Make Buffer available globally for simple-peer
window.Buffer = Buffer

// Suppress DevTools extension errors in production
if (import.meta.env.PROD) {
  const originalError = console.error;
  console.error = (...args) => {
    const message = args[0]?.toString() || '';
    // Filter out known DevTools extension errors
    if (
      message.includes('disconnected port object') ||
      message.includes('Extension context invalidated') ||
      message.includes('proxy.js') ||
      message.includes('backendManager.js') ||
      message.includes('bridge.js')
    ) {
      return; // Suppress these specific errors
    }
    originalError.apply(console, args);
  };
}

// Global error handler for unhandled rejections
window.addEventListener('unhandledrejection', (event) => {
  const message = event.reason?.message || event.reason?.toString() || '';
  if (
    message.includes('disconnected port object') ||
    message.includes('Extension context invalidated')
  ) {
    event.preventDefault(); // Prevent logging of DevTools errors
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
