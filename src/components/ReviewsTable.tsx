import { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import type { Review } from '../lib/types';
import Switch from './ui/Switch';

interface ReviewsTableProps {
  reviews: Review[];
  onToggle: (id: number, approved: boolean) => Promise<void>;
}

/**
 * ReviewsTable renders a simple list of reviews for a property.  Each row
 * displays the submission date, guest name, rating (stars), channel and
 * review text.  A toggle switch allows managers to approve or hide a
 * review, calling back to the parent component to perform the API call.
 */
export default function ReviewsTable({ reviews, onToggle }: ReviewsTableProps) {
  const [loadingId, setLoadingId] = useState<number | null>(null);
  // Helper to render stars
  const renderStars = (rating: number | null) => {
    const r = Math.round(rating || 0);
    return (
      <span className="flex space-x-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <FaStar key={i} className={`h-4 w-4 ${i <= r ? 'text-brand' : 'text-gray-300'}`} aria-hidden />
        ))}
      </span>
    );
  };
  return (
    <div className="space-y-4">
      {reviews.map((rev) => {
        // derive rating if null
        const rating = rev.rating ?? rev.reviewCategory.reduce((acc, c) => acc + c.rating / 2, 0) / rev.reviewCategory.length;
        return (
          <div key={rev.id} className="border border-gray-200 rounded-md p-4 bg-white flex justify-between items-start">
            <div className="flex-1 pr-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-gray-900">{rev.guestName || 'Guest'}</h4>
                  <span className="text-xs text-gray-500">
                    {new Date(rev.submittedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                {renderStars(rating)}
              </div>
              <p className="mt-2 text-sm text-gray-700 line-clamp-3">{rev.publicReview}</p>
              <div className="mt-1 flex flex-wrap gap-1 text-xs text-gray-500">
                {rev.reviewCategory.map((cat) => (
                  <span
                    key={cat.category}
                    className="inline-block px-2 py-0.5 bg-gray-100 rounded-full capitalize"
                  >
                    {cat.category}
                  </span>
                ))}
              </div>
              <div className="mt-1 text-xs text-gray-500 capitalize">Channel: {rev.channel}</div>
            </div>
            <div className="flex items-center">
              <Switch
                checked={rev.approved ?? false}
                disabled={loadingId === rev.id}
                onChange={async (checked) => {
                  setLoadingId(rev.id);
                  await onToggle(rev.id, checked);
                  setLoadingId(null);
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}