// src/App.jsx
import { BrowserRouter as Router } from 'react-router-dom';  // Remove Routes, Route if not needed
import MovieCard from './components/MovieCard';
import Search from './components/Search';
import InputSelector from './components/InputSelector';
import MovieInputs from './components/MovieInputs';
import RecommendationsList from './components/RecommendationsList';
import Spinner from './components/Spinner';
import MovieDetails from './components/MovieDetails';
import { useState, useEffect } from 'react';
import { useDebounce } from 'react-use';
import './styles/index.css';
import { updateSearchCount } from './appwrite';

const API_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${TMDB_API_KEY}`,
  },
};

function App() {
  const [inputCount, setInputCount] = useState(0);
  const [movies, setMovies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [searchError, setSearchError] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [selectedMovieId, setSelectedMovieId] = useState(null);

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 1000, [searchTerm]);

  const handleInputCountChange = (count) => {
    console.log('Input count changed to:', count);  // Debug
    setInputCount(count);
    setMovies(Array(count).fill(''));
    setRecommendations([]);
    setRecError(null);
  };

  const handleMovieChange = (index, value) => {
    const updatedMovies = [...movies];
    updatedMovies[index] = value;
    setMovies(updatedMovies);
  };

  const handleSubmit = async () => {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      setRecError('API key not found');
      return;
    }

    if (movies.some(movie => !movie.trim())) {
      setRecError('Please fill in all movie fields');
      return;
    }
    
    setRecLoading(true);
    setRecError(null);
    
    try {
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-thinking-exp:generateContent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": import.meta.env.VITE_GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `
              Based on these movies: ${movies.join(', ')}, suggest 5 movies that:
                  Combine ≥3 genres from input titles using IMDB's taxonomy
                  Match narrative elements from metadata
                  Prioritize films with multi-genre DNA
                  Include at least 2 non-English language films
                  Exclude 18+ content and documentaries
                  Return exactly 5 movie titles in this format, one per line:
                  Title (Original Language Title)
                  No numbers, bullets, or punctuation. Only movie names with original language titles in parentheses, one per line.
              `
            }]
          }]
        })
      });
      
      if (!response.ok) throw new Error('Failed to get recommendations');
      
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const movieTitles = text.split('\n')
        .filter(movie => movie.trim())
        .map(title => title.trim())
        .slice(0, 5);

      const detailedMovies = await Promise.all(
        movieTitles.map(async (title) => {
          const searchResponse = await fetch(
            `${API_BASE_URL}/search/movie?query=${encodeURIComponent(title.split(' (')[0])}`,
            API_OPTIONS
          );
          if (!searchResponse.ok) throw new Error(`Failed to fetch data for ${title}`);
          
          const searchData = await searchResponse.json();
          return searchData.results[0] || { title };
        })
      );

      setRecommendations(detailedMovies);
    } catch (error) {
      setRecError(error.message || 'Failed to get recommendations');
    } finally {
      setRecLoading(false);
    }
  };

  const fetchMovies = async (query = "") => {
    setSearchLoading(true);
    setSearchError("");

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) throw new Error("Failed to fetch movies");
      
      const data = await response.json();
      setMovieList(data.results || []);
      if (query && data.results[0]) {
        updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      setSearchError("Error fetching movies");
    } finally {
      setSearchLoading(false);
    }
  };

  const loadTrendingMovies = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/trending/movie/week`, API_OPTIONS);
      const data = await response.json();
      setTrendingMovies(data.results.slice(0, 5));
    } catch (error) {
      console.error('Error fetching trending movies:', error);
    }
  };

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
    loadTrendingMovies();
  }, [debouncedSearchTerm]);

  const handleShowDetails = (movieId) => {
    console.log('Showing details for movie ID:', movieId);  // Debug
    setSelectedMovieId(movieId);
  };

  const handleCloseModal = () => {
    setSelectedMovieId(null);
  };

  return (
    <Router>
      <main className="wrapper">
        <header>
          <h1>Find <span>Movies</span> You'll Enjoy</h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>
        
        <section className="movie-mixer">
          <h2>Movie Mixer</h2>
          <InputSelector onSelect={handleInputCountChange} />
          
          {inputCount > 0 && (
            <>
              <MovieInputs 
                count={inputCount} 
                movies={movies} 
                onChange={handleMovieChange} 
              />
              <button
                onClick={handleSubmit}
                disabled={recLoading || movies.some(movie => !movie.trim())}
                className="submit-button"
              >
                {recLoading ? 'Getting recommendations...' : 'Get Recommendations'}
              </button>
              {recError && <div className="error-message">{recError}</div>}
              <RecommendationsList 
                recommendations={recommendations} 
                onShowDetails={handleShowDetails}  // Pass the handler
              />
            </>
          )}
        </section>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>
            <ul className="hide-scrollbar">
              {trendingMovies.map((movie) => (
                <li key={movie.id}>
                  <MovieCard movie={movie} onShowDetails={handleShowDetails} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2>{searchTerm ? 'Search Results' : 'Popular Movies'}</h2>
          {searchLoading ? (
            <div className="spinner"><Spinner /></div>
          ) : searchError ? (
            <p className="error-message">{searchError}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <li key={movie.id}>
                  <MovieCard movie={movie} onShowDetails={handleShowDetails} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <MovieDetails movieId={selectedMovieId} onClose={handleCloseModal} />
      </main>
    </Router>
  );
}

export default App;