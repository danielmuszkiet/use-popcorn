import { useRef } from "react";
import { useKey } from "../customHooks/useKey";

export function SearchBar({ query, setQuery }) {
  const inputEl = useRef(null);
  useKey("Enter", function () {
    if (inputEl.current !== document.activeElement) {
      inputEl.current.focus();
      setQuery("");
    }
  });

  return (
    <input
      ref={inputEl}
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
