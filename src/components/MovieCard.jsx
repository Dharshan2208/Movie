export default function MovieCard({ movie, onShowDetails }) {
  const TMDB_API_BASE_URL = "https://api.themoviedb.org/3";
  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

  const TMDB_API_OPTIONS = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${TMDB_API_KEY}`,
    },
  };

  const handleCardClick = () => {
    console.log('MovieCard clicked, ID:', movie.id); // Debug
    onShowDetails(movie.id);
  };

  const { title, vote_average, poster_path, release_date, original_language, id } = movie;

  return (
    <div 
      className="movie-card" 
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      <img
        src={
          poster_path
            ? `https://image.tmdb.org/t/p/w500/${poster_path}`
            : "no-movie.png"
        }
        alt={title}
        loading="lazy"
      />
      <div className="mt-4">
        <h3>{title}</h3>
        <div className="content">
          <div className="rating">
            <img src="star.svg" alt="Star Icon" />
            <p>{vote_average ? vote_average.toFixed(1) : "N/A"}</p>
          </div>
          <span>•</span>
          <p className="lang">{original_language?.toUpperCase()}</p>
          <span>•</span>
          <p className="year">{release_date ? release_date.split('-')[0] : "N/A"}</p>
        </div>
      </div>
    </div>
  );
}