import { useState, useEffect } from "react";

const KEY = "23728de8";

export function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    async function fetchMovies() {
      try {
        setIsLoading(true);
        setErrorMsg("");

        const res = await fetch(`https://www.omdbapi.com/?apikey=${KEY}&s=${query}`, {
          signal,
        });
        if (!res.ok) throw new Error("Movie fetching went wrong");

        const data = await res.json();

        if (data.Response === "False") throw new Error("Movie Not Found.");

        setMovies(data.Search);
      } catch (error) {
        if (error.name !== "AbortError") setErrorMsg(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    if (query.length < 3) {
      setMovies([]);
      setErrorMsg("");
      return;
    }

    fetchMovies();

    return function () {
      controller.abort();
    };
  }, [query]);

  return { movies, isLoading, errorMsg };
}
