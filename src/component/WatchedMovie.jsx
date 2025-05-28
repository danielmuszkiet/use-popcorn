export function WatchedMovie({ movie, onDelete }) {
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
