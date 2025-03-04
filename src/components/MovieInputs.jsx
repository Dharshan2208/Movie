// src/components/MovieInputs.jsx
export default function MovieInputs({ count, movies, onChange }) {
  return (
    <div className="movie-inputs">
      <h2>Enter your movies:</h2>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="input-group">
          <label htmlFor={`movie-${index}`}>Movie {index + 1}:</label>
          <input
            id={`movie-${index}`}
            type="text"
            value={movies[index] || ''}
            onChange={(e) => onChange(index, e.target.value)}
            placeholder={`Enter movie ${index + 1} title...`}
          />
        </div>
      ))}
    </div>
  );
}