import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';

/**
 * Hook générique pour persister un state React dans localStorage.
 * Remplace les patterns try/catch/JSON.parse dupliqués dans les contextes.
 *
 * @param key - Clé localStorage
 * @param defaultValue - Valeur par défaut si rien n'est stocké
 * @returns [value, setValue] - Tuple identique à useState
 */
export function useLocalStorage<T>(key: string, defaultValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.error(`Failed to load "${key}" from localStorage`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to save "${key}" to localStorage`, error);
    }
  }, [key, value]);

  return [value, setValue];
}
