import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './MovieDetails.css';

const TMDB_API_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const STREAMING_API_KEY = import.meta.env.VITE_STREAMING_API_KEY;

const TMDB_API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${TMDB_API_KEY}`,
  },
};

export default function MovieDetails() {
  const { movieId } = useParams();
  const [movieDetails, setMovieDetails] = useState(null);
  const [streamingOptions, setStreamingOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch movie details from TMDB
        const tmdbResponse = await fetch(`${TMDB_API_BASE_URL}/movie/${movieId}`, TMDB_API_OPTIONS);
        if (!tmdbResponse.ok) throw new Error(`TMDB API Error: ${tmdbResponse.status} - ${tmdbResponse.statusText}`);
        const tmdbData = await tmdbResponse.json();
        setMovieDetails(tmdbData);

        // Fetch streaming availability using Streaming Availability API via RapidAPI
        if (tmdbData.imdb_id) {
          const streamingResponse = await fetch(
            `https://streaming-availability.p.rapidapi.com/v2/search/imdb?imdb_id=tt${tmdbData.imdb_id}&country=us`,
            {
              method: "GET",
              headers: {
                "X-RapidAPI-Key": STREAMING_API_KEY,
                "X-RapidAPI-Host": "streaming-availability.p.rapidapi.com",
              },
            }
          );
          if (!streamingResponse.ok) throw new Error(`Streaming API Error: ${streamingResponse.status} - ${streamingResponse.statusText}`);
          const streamingData = await streamingResponse.json();
          setStreamingOptions(streamingData.result || []);
        } else {
          console.warn('No IMDb ID found for streaming lookup.');
          setStreamingOptions([]); // No streaming data if IMDb ID is missing
        }
      } catch (error) {
        console.error('Error fetching movie details:', error);
        setError(error.message || 'Failed to fetch movie details');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [movieId]);

  if (loading) return <div className="loading">Loading movie details...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!movieDetails) return <div>No movie details found.</div>;

  return (
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
        </div>
      </div>
      
      <div className="movie-story">
        <h2>Synopsis</h2>
        <p>{movieDetails.overview || 'No synopsis available.'}</p>
      </div>

      <div className="streaming-options">
        <h2>Where to Stream</h2>
        {streamingOptions.length > 0 ? (
          <ul>
            {streamingOptions.map((option, index) => (
              <li key={index}>
                {option.service} -{' '}
                {option.streamingInfo?.us?.link ? (
                  <a href={option.streamingInfo.us.link} target="_blank" rel="noopener noreferrer">
                    Watch Now
                  </a>
                ) : 'Not available for direct link'}
                {option.streamingInfo?.us?.quality && ` (Quality: ${option.streamingInfo.us.quality})`}
              </li>
            ))}
          </ul>
        ) : (
          <p>No streaming options available at this time.</p>
        )}
      </div>
    </div>
  );
}