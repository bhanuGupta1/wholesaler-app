// src/components/feedback/StarRating.jsx
import { useState } from 'react';

const StarRating = ({ initialRating = 0, onChange, readOnly = false }) => {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);
  
  const handleRatingChange = (newRating) => {
    if (readOnly) return;
    
    setRating(newRating);
    if (onChange) {
      onChange(newRating);
    }
  };
  
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        
        return (
          <button
            type="button"
            key={index}
            className={`${readOnly ? 'cursor-default' : 'cursor-pointer'} focus:outline-none`}
            onClick={() => handleRatingChange(ratingValue)}
            onMouseEnter={() => !readOnly && setHover(ratingValue)}
            onMouseLeave={() => !readOnly && setHover(0)}
            aria-label={`Rate ${ratingValue} out of 5 stars`}
            disabled={readOnly}
          >
            <svg 
              className={`w-6 h-6 ${
                ratingValue <= (hover || rating)
                  ? 'text-yellow-500'
                  : 'text-gray-300'
              } transition-colors duration-150`} 
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        );
      })}
      
      {!readOnly && (
        <span className="ml-2 text-sm text-gray-600">
          {rating ? `Your rating: ${rating}/5` : 'Select a rating'}
        </span>
      )}
    </div>
  );
};

export default StarRating;