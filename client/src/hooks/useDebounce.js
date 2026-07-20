import { useState, useEffect } from 'react';

/**
 * Debounces a rapidly-changing value (e.g. search input) so that
 * dependent effects (like API calls) only fire after the user pauses typing.
 */
const useDebounce = (value, delay = 400) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
