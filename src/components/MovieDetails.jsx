import { useState, useEffect } from 'react';
import '/src/styles/index.css';

const TMDB_API_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const TMDB_API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${TMDB_API_KEY}`,
  },
};

export default function MovieDetails({ movieId, onClose }) {
  const [movieDetails, setMovieDetails] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch movie details
        const detailsResponse = await fetch(`${TMDB_API_BASE_URL}/movie/${movieId}`, TMDB_API_OPTIONS);
        if (!detailsResponse.ok) throw new Error('Failed to fetch movie details');
        const detailsData = await detailsResponse.json();
        setMovieDetails(detailsData);

        // Fetch trailer
        const videosResponse = await fetch(`${TMDB_API_BASE_URL}/movie/${movieId}/videos`, TMDB_API_OPTIONS);
        if (!videosResponse.ok) throw new Error('Failed to fetch videos');
        const videosData = await videosResponse.json();
        const trailer = videosData.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
        setTrailerKey(trailer?.key || null);
      } catch (error) {
        console.error('Error fetching movie details:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [movieId]);

  if (!movieId) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {loading ? (
          <div className="loading">Loading movie details...</div>
        ) : error ? (
          <div className="error">Error: {error}</div>
        ) : !movieDetails ? (
          <div>No movie details found.</div>
        ) : (
          <>
            <button className="close-btn" onClick={onClose}>×</button>
            <div className="movie-details">
              <div className="movie-header">
                <img
                  src={
                    movieDetails.poster_path
                      ? `https://image.tmdb.org/t/p/w500/${movieDetails.poster_path}`
                      : "https://via.placeholder.com/500x750?text=No+Image"
                  }
                  alt={movieDetails.title}
                  className="poster"
                  onError={(e) => { e.target.src = "https://via.placeholder.com/500x750?text=No+Image"; }}
                />
                <div className="movie-info">
                  <h1>{movieDetails.title} ({movieDetails.release_date?.split('-')[0] || 'N/A'})</h1>
                  <p>Rating: {movieDetails.vote_average?.toFixed(1) || 'N/A'} / 10</p>
                  <p>Language: {movieDetails.original_language?.toUpperCase() || 'N/A'}</p>
                  <p>Runtime: {movieDetails.runtime} minutes</p>
                  <p>Genres: {movieDetails.genres?.map(genre => genre.name).join(', ') || 'N/A'}</p>
                  {trailerKey && (
                    <button 
                      className="play-trailer-btn"
                      onClick={() => setShowTrailer(!showTrailer)}
                    >
                      {showTrailer ? 'Hide Trailer' : 'Play Trailer'}
                    </button>
                  )}
                </div>
              </div>
              
              {showTrailer && trailerKey && (
                <div className="trailer-container">
                  <iframe
                    width="100%"
                    height="400"
                    src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                    title="Movie Trailer"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}

              <div className="movie-story">
                <h2>Synopsis</h2>
                <p>{movieDetails.overview || 'No synopsis available.'}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}