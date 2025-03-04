// src/components/RecommendationsList.jsx
export default function RecommendationsList({ recommendations }) {
  return (
    <div className="recommendations">
      <h2>Top 5 Recommendations</h2>
      {recommendations.length === 0 ? (
        <p>No recommendations yet. Enter your movies and submit to get started!</p>
      ) : (
        <ul className="recommendations-list">
          {recommendations.map((movie, index) => (
            <li key={index} className="recommendation-item">
              <span className="recommendation-number">{index + 1}</span>
              <span className="recommendation-title">{movie}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}