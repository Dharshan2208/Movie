// src/components/InputSelector.jsx
import { useState } from 'react';

export default function InputSelector({ onSelect }) {
  const options = [2, 3, 4, 5];
  const [selected, setSelected] = useState(null);

  const handleSelection = (count) => {
    setSelected(count);
    onSelect(count);
  };

  return (
    <div className="input-selector">
      <h2>How many movies would you like to mix?</h2>
      <div className="option-buttons">
        {options.map((count) => (
          <button
            key={count}
            className={`option-button ${selected === count ? 'selected' : ''}`}
            onClick={() => handleSelection(count)}
          >
            {count}
          </button>
        ))}
      </div>
    </div>
  );
}