// Global polyfill for Electron renderer process
if (typeof global === 'undefined') {
  (window as any).global = globalThis;
}

// Additional polyfills if needed
if (typeof process === 'undefined') {
  (window as any).process = { env: {} };
}

export {};