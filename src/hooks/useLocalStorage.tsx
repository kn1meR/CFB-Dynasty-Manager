"use client";

import { useState, useEffect, useCallback } from 'react';

// Enhanced storage hook that works with both Electron and web
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    
    try {
      // Try to get from localStorage first (for immediate sync)
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const [isElectron, setIsElectron] = useState(false);

  // Check if we're in Electron
  useEffect(() => {
    setIsElectron(typeof window !== 'undefined' && !!window.electronAPI);
  }, []);

  // Load initial value from Electron store if available
  useEffect(() => {
    if (isElectron && window.electronAPI) {
      window.electronAPI.getData(key)
        .then((value) => {
          // If Electron store returns undefined, stick with localStorage value
          if (value !== undefined && value !== null) {
            setStoredValue(value);
          }
        })
        .catch((error) => {
          console.log('Electron store not available, using localStorage:', error);
        });
    }
  }, [key, isElectron]);

  const setValue = useCallback(async (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Update local state
      setStoredValue(valueToStore);
      
      // Save to localStorage (for immediate sync and web fallback)
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
      
      // Save to Electron store if available (but don't worry if it fails)
      if (isElectron && window.electronAPI) {
        window.electronAPI.saveData(key, valueToStore).catch((error) => {
          console.log('Electron store not available, localStorage is being used:', error);
        });
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }, [key, storedValue, isElectron]);

  return [storedValue, setValue];
}

export default useLocalStorage;