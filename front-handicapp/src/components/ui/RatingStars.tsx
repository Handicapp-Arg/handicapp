'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  totalReviews?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = 'md',
  showNumber = true,
  totalReviews,
  interactive = false,
  onRatingChange,
}: RatingStarsProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const handleClick = (value: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }).map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= Math.round(rating);
          const isPartial = starValue > Math.floor(rating) && starValue <= Math.ceil(rating);

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleClick(starValue)}
              disabled={!interactive}
              className={cn(
                interactive && 'cursor-pointer',
                !interactive && 'cursor-default'
              )}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  isFilled && 'fill-yellow-400 text-yellow-400',
                  !isFilled && 'text-gray-300'
                )}
              />
            </button>
          );
        })}
      </div>
      {showNumber && (
        <div className={cn('flex items-center gap-1', textSizeClasses[size])}>
          <span className="font-semibold text-gray-900">{Number.isFinite(parseFloat(rating as any)) ? parseFloat(rating as any).toFixed(1) : '0.0'}</span>
          {totalReviews !== undefined && (
            <span className="text-gray-500">({totalReviews})</span>
          )}
        </div>
      )}
    </div>
  );
}
