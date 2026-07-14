import React from 'react';
import { Star, StarHalf } from 'lucide-react';

const StarRating = ({ rating, count, size = 16 }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      {/* Full Stars */}
      {[...Array(fullStars)].map((_, i) => (
        <Star
          key={`full-${i}`}
          size={size}
          className="text-amber-500 fill-amber-500"
        />
      ))}
      
      {/* Half Star */}
      {hasHalfStar && (
        <StarHalf
          size={size}
          className="text-amber-500 fill-amber-500"
        />
      )}
      
      {/* Empty Stars */}
      {[...Array(emptyStars)].map((_, i) => (
        <Star
          key={`empty-${i}`}
          size={size}
          className="text-gray-300 dark:text-dark-700"
        />
      ))}

      {/* Optional review count display */}
      {count !== undefined && (
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium ml-1">
          ({count})
        </span>
      )}
    </div>
  );
};

export default StarRating;
