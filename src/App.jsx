import { useState } from "react";

import { useMovies } from "./customHooks/useMovies";
import { useLocalStorageState } from "./customHooks/useLocalStorageState";
import { SearchBar } from "./component/SearchBar";
import { WatchedMovieList } from "./component/WatchedMovieList";
import { MovieList } from "./component/MovieList";
import { WatchedSummary } from "./component/WatchedSummary";
import { Loader } from "./component/Loader";
import { SearchMessage } from "./component/SearchMessage";
import { Box } from "./component/Box";
import { NumResults } from "./component/NumResults";
import { ErrorMessage } from "./component/ErrorMessage";
import { NavBar } from "./component/NavBar";
import { MovieDetails } from "./component/MovieDetails";

function App() {
  const [selectedID, setSelectedID] = useState(null);
  const [query, setQuery] = useState("inception");

  const { movies, isLoading, errorMsg } = useMovies(query);
  const [watched, setWatched] = useLocalStorageState([], "watched");

  const handleSelectMovie = (id) => {
    setSelectedID((prev) => (prev === id ? null : id));
  };

  const handleCloseMovie = () => {
    setSelectedID(null);
  };

  const handleAddWatch = (movie) => {
    setWatched((prev) => [...prev, movie]);
  };

  const handleDeleteWatched = (id) => {
    setWatched((prev) => prev.filter((m) => m.imdbID !== id));
  };

  return (
    <>
      <NavBar>
        <SearchBar query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>

      <Main>
        <Box>
          {movies.length === 0 && !errorMsg && <SearchMessage />}
          {isLoading && <Loader />}
          {!isLoading && !errorMsg && (
            <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
          )}
          {errorMsg && <ErrorMessage errorMsg={errorMsg} />}
        </Box>
        <Box>
          {selectedID ? (
            <MovieDetails
              selectedID={selectedID}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatch}
              watched={watched}
              key={selectedID}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList watched={watched} onDelete={handleDeleteWatched} />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

export default App;
