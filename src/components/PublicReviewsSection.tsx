import type { ListingBundle } from '../lib/types';
import { FaStar } from 'react-icons/fa';

/**
 * PublicReviewsSection renders the public view of a property's reviews.  It
 * shows the overall rating average, a distribution chart of star counts
 * and lists each approved review.  This component is used on the
 * `/share/[listingId]` page to show only approved reviews to guests.
 */
export default function PublicReviewsSection({ bundle }: { bundle: ListingBundle }) {
  const approvedReviews = bundle.reviews.filter((r) => r.approved);
  // compute star distribution
  const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  approvedReviews.forEach((rev) => {
    const rating = rev.rating ?? rev.reviewCategory.reduce((acc, c) => acc + c.rating / 2, 0) / rev.reviewCategory.length;
    const round = Math.round(rating);
    counts[round as keyof typeof counts]++;
  });
  const total = approvedReviews.length;
  const ratingAvg = bundle.ratingAvg ?? 0;
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Property Reviews</h2>
      <div className="border border-gray-200 rounded-lg p-4 bg-white flex flex-col md:flex-row md:items-center">
        <div className="md:w-1/3 flex flex-col items-center justify-center">
          <div className="text-5xl font-bold text-brand">{ratingAvg.toFixed(1)}</div>
          <div className="flex mt-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <FaStar key={i} className={`h-5 w-5 ${i <= Math.round(ratingAvg) ? 'text-brand' : 'text-gray-300'}`} aria-hidden />
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-1">{total} reviews</p>
        </div>
        <div className="md:w-2/3 mt-4 md:mt-0 md:pl-8">
          {([5, 4, 3, 2, 1] as const).map((star) => {
            const pct = total > 0 ? Math.round((counts[star] / total) * 100) : 0;
            return (
              <div key={star} className="flex items-center space-x-2 text-sm mb-1">
                <span className="w-6">{star}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-brand" style={{ width: `${pct}%` }}></div>
                </div>
                <span className="w-10 text-right">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="space-y-4">
        {approvedReviews.length === 0 ? (
          <p className="text-gray-600">No approved reviews yet.</p>
        ) : (
          approvedReviews.map((rev) => {
            const rating = rev.rating ?? rev.reviewCategory.reduce((acc, c) => acc + c.rating / 2, 0) / rev.reviewCategory.length;
            return (
              <div key={rev.id} className="border border-gray-200 rounded-md p-4 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">{rev.guestName || 'Guest'}</h4>
                    <span className="text-xs text-gray-500">
                      {new Date(rev.submittedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <span className="flex">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <FaStar key={i} className={`h-4 w-4 ${i <= Math.round(rating) ? 'text-brand' : 'text-gray-300'}`} aria-hidden />
                    ))}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-700">{rev.publicReview}</p>
                <div className="mt-2 flex flex-wrap gap-1 text-xs text-gray-500">
                  {rev.reviewCategory.map((cat) => (
                    <span key={cat.category} className="inline-block px-2 py-0.5 bg-gray-100 rounded-full capitalize">
                      {cat.category}
                    </span>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}