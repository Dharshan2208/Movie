// src/components/RecommendationsList.jsx
import MovieCard from './MovieCard';

export default function RecommendationsList({ recommendations }) {
  if (recommendations.length === 0) {
    return null; // Don't render anything if there are no recommendations
  }

  return (
    <div className="recommendations">
      <h2>Top 5 Recommendations</h2>
      <ul className="recommendations-list">
        {recommendations.map((movie, index) => (
          <li key={index} className="recommendation-item">
            <MovieCard movie={movie} />
          </li>
        ))}
      </ul>
    </div>
  );
}