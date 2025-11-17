import { useState, useEffect, Dispatch, SetStateAction } from 'react';

/**
 * A custom React hook that persists state to localStorage.
 *
 * @param key The key to use for storing the value in localStorage.
 * @param defaultValue The default value to use if no value is found in localStorage.
 * @returns A stateful value, and a function to update it, similar to `useState`.
 */
function usePersistentState<T>(key: string, defaultValue: T): [T, Dispatch<SetStateAction<T>>] {
    const [state, setState] = useState<T>(() => {
        try {
            const storedValue = window.localStorage.getItem(key);
            // If a value is found in localStorage, parse and return it.
            if (storedValue) {
                return JSON.parse(storedValue);
            }
        } catch (error) {
            // Log any errors during localStorage access.
            console.error(`Error reading localStorage key "${key}":`, error);
        }
        // Otherwise, return the provided default value.
        return defaultValue;
    });

    useEffect(() => {
        try {
            // Save the current state to localStorage whenever it changes.
            window.localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            // Log any errors during localStorage access.
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, state]);

    return [state, setState];
}

export default usePersistentState;
