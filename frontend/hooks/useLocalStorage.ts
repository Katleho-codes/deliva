"use client";

// hooks/useLocalStorage.ts
import { useState, useEffect, Dispatch, SetStateAction } from 'react';

type Value<T> = T | undefined;

function useLocalStorage<T>(key: string, defaultValue: T): [Value<T>, Dispatch<SetStateAction<Value<T>>>] {
  const [value, setValue] = useState<Value<T>>(defaultValue);

  // Effect to retrieve data from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const item = window.localStorage.getItem(key);
        setValue(item ? JSON.parse(item) : defaultValue);
      } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
        setValue(defaultValue);
      }
    }
  }, [key, defaultValue]);

  // Effect to update localStorage whenever the state changes
  useEffect(() => {
    if (typeof window !== 'undefined' && value !== undefined) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`Error writing localStorage key "${key}":`, error);
      }
    }
  }, [key, value]);

  return [value, setValue];
}

export default useLocalStorage;
