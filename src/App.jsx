import { useState, useEffect, useRef } from "react";
import StarRating from "./component/StarRating";

const average = (arr) => arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "23728de8";

function App() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedID, setSelectedID] = useState(null);
  const [watched, setWatched] = useState(function () {
    const storedData = localStorage.getItem("watched");
    return JSON.parse(storedData);
  });

  const [query, setQuery] = useState("inception");

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

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    async function fetchMovies() {
      try {
        setIsLoading(true);
        setSelectedID(null);
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

  useEffect(() => {
    localStorage.setItem("watched", JSON.stringify(watched));
  }, [watched]);

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

function Loader() {
  return <p className="msg">Loading...</p>;
}

function SearchMessage() {
  return <span className="msg">Search for a movie</span>;
}

function ErrorMessage({ errorMsg }) {
  return (
    <p className="msg">
      <span>⛔️</span> {errorMsg}
    </p>
  );
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function SearchBar({ query, setQuery }) {
  const inputEl = useRef(null);

  useEffect(() => {
    function callback(e) {
      if (e.code === "Enter" && inputEl.current !== document.activeElement) {
        inputEl.current.focus();
        setQuery("");
      }
    }

    document.addEventListener("keydown", callback);
    return () => document.removeEventListener("keydown", callback);
  }, [setQuery]);

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

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img
        src={
          movie.Poster != "N/A"
            ? movie.Poster
            : "https://placehold.co/400x450/transparent/F00?&text=NO\\nIMAGE&"
        }
        alt={`${movie.Title} poster`}
      />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetails({ selectedID, onCloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  const isWatched = watched.reduce((acc, movie) => {
    return acc || movie.imdbID === selectedID;
  }, false);

  const watchedUserRating = watched.find((m) => m.imdbID === selectedID)?.userRating;

  // Destruct and rename relevant movie details from the fetched movie object
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  useEffect(() => {
    async function getMovieDetails() {
      setIsLoading(true);
      const res = await fetch(`https://www.omdbapi.com/?apikey=${KEY}&i=${selectedID}`);
      const data = await res.json();
      setMovie(data);
      setIsLoading(false);
    }

    getMovieDetails();
  }, [selectedID]);

  useEffect(() => {
    function escapeReturn(e) {
      if (e.code === "Escape") {
        onCloseMovie();
      }
    }
    document.addEventListener("keydown", escapeReturn);

    return function () {
      document.removeEventListener("keydown", escapeReturn);
    };
  }, [onCloseMovie]);

  useEffect(() => {
    if (!title) return;
    document.title = `Movie | ${title}`;

    return function () {
      document.title = "Use Popcorn";
    };
  }, [title]);

  const handleAdd = () => {
    const imdbRatingTemp = isNaN(Number(imdbRating)) ? 0 : Number(imdbRating);

    const newWatchedMovie = {
      imdbID: selectedID,
      title,
      year,
      poster,
      imdbRating: imdbRatingTemp,
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
    };

    onAddWatched(newWatchedMovie);
    onCloseMovie();
  };

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M19 12a1 1 0 0 1-1 1H8.414l1.293 1.293a1 1 0 0 1-1.414 1.414l-3-3a1 1 0 0 1 0-1.414l3-3a1 1 0 0 1 1.414 1.414L8.414 11H18a1 1 0 0 1 1 1z"
                  style={{ fill: "#000" }}
                  data-name="Left"
                />
              </svg>
            </button>
            <img src={poster} alt={`Poster of ${title}`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐️</span>
                {imdbRating} IMDb Rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating maxRating={10} size={25} onSetRating={setUserRating} />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>
                  You already rated this movie: {watchedUserRating} <span>⭐️</span>
                </p>
              )}
            </div>

            <p>
              <em>{plot}</em>
            </p>
            <p>Staring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(
    watched.map((movie) => (!isNaN(movie.imdbRating) ? movie.imdbRating : 0))
  );
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => (!isNaN(movie.runtime) ? movie.runtime : 0)));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMovieList({ watched, onDelete }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} onDelete={onDelete} key={movie.imdbID} />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, onDelete }) {
  return (
    <li>
      <img
        src={
          movie.poster != "N/A"
            ? movie.poster
            : "https://placehold.co/400x450/transparent/F00?&text=NO\\nIMAGE&"
        }
        alt={`${movie.title} poster`}
      />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{!isNaN(movie.runtime) ? movie.runtime + " min" : "--"}</span>
        </p>
        <button className="btn-delete" onClick={() => onDelete(movie.imdbID)}>
          X
        </button>
      </div>
    </li>
  );
}

export default App;
