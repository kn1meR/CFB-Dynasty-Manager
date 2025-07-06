import { useState, useEffect } from 'react';

export function useElectronStore<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    const loadValue = async () => {
      if (typeof window !== 'undefined' && window.electronAPI) {
        try {
          const value = await window.electronAPI.getData(key);
          setStoredValue(value !== undefined ? value : initialValue);
        } catch (error) {
          console.error(`Error reading from electron store: ${error}`);
          setStoredValue(initialValue);
        }
      } else {
        setStoredValue(initialValue);
      }
    };

    loadValue();
  }, [key, initialValue]);

  const setValue = async (value: T) => {
    try {
      setStoredValue(value);
      if (typeof window !== 'undefined' && window.electronAPI) {
        await window.electronAPI.saveData(key, value);
      }
    } catch (error) {
      console.error(`Error writing to electron store: ${error}`);
    }
  };

  return [storedValue, setValue];
}