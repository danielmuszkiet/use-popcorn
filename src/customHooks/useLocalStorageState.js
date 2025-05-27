import { useState, useEffect } from "react";

export function useLocalStorageState(initalState, key) {
  const [value, setValue] = useState(function () {
    const storedData = localStorage.getItem(key);
    return JSON.parse(storedData) || initalState;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
