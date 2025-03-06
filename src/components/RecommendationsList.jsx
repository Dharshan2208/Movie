
import MovieCard from './MovieCard';

export default function RecommendationsList({ recommendations, onShowDetails }) {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="recommendations">
      <h2>Top 5 Recommendations</h2>
      <ul className="recommendations-list">
        {recommendations.map((movie, index) => (
          <li key={index} className="recommendation-item">
            <MovieCard 
              movie={movie} 
              onShowDetails={onShowDetails}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
