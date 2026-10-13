import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Prevent any library or React 19 dev logging from crashing the commit phase via DataCloneError on performance.measure
if (typeof window !== 'undefined' && window.performance && typeof window.performance.measure === 'function') {
  const origMeasure = window.performance.measure.bind(window.performance);
  window.performance.measure = function (name: string, startOrOptions?: any, end?: any): any {
    try {
      return origMeasure(name, startOrOptions, end);
    } catch {
      try {
        if (typeof startOrOptions === 'object' && startOrOptions !== null) {
          const { detail, ...optionsWithoutDetail } = startOrOptions;
          return origMeasure(name, optionsWithoutDetail, end);
        }
      } catch {
        // Silently catch so React commit phase never crashes
      }
    }
  };

  if (typeof window.performance.clearMeasures === 'function') {
    setInterval(() => {
      try {
        window.performance.clearMeasures();
        window.performance.clearMarks();
      } catch {
        // ignore
      }
    }, 10000);
  }
}

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

