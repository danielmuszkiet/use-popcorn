const average = (arr) => arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export function WatchedSummary({ watched }) {
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
