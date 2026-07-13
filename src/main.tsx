import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Prevent any library (like MapLibre or browser events) from causing circular structure stringification errors in the platform
const safeSerializer = () => {
  const seen = new WeakSet();
  return (key: string, value: any) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    return value;
  };
};

const safeArgs = (args: any[]) => {
  return args.map(arg => {
    if (typeof arg === 'object' && arg !== null) {
      try {
        JSON.stringify(arg);
        return arg;
      } catch (e) {
        try {
          return JSON.parse(JSON.stringify(arg, safeSerializer()));
        } catch (err) {
          return '[Unsafe/Circular Object]';
        }
      }
    }
    return arg;
  });
};

const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;

console.log = (...args: any[]) => originalLog(...safeArgs(args));
console.warn = (...args: any[]) => originalWarn(...safeArgs(args));
console.error = (...args: any[]) => originalError(...safeArgs(args));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

