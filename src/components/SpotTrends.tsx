import type { Review } from '../lib/types';
import { FaExclamationTriangle, FaStar } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import Loader from '../components/ui/Loader';

export default function SpotTrends({ reviews }: { reviews: Review[] }) {
  const [aiIssues, setAiIssues] = useState<Review[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // local heuristic as immediate fallback
  const keywords = ['dirty', 'smell', 'broken', 'damage', 'late', 'rude', 'noise', 'cancel'];
  const localIssues = reviews
    .filter((r) => {
      const rating = r.rating ?? (r.reviewCategory && r.reviewCategory.length ? r.reviewCategory.reduce((acc: any, c: any) => acc + (c.rating || 0) / 2, 0) / r.reviewCategory.length : null);
      const text = (r.publicReview || '').toLowerCase();
      const hasKeyword = keywords.some((k) => text.includes(k));
      return (rating != null && rating <= 2) || hasKeyword;
    })
    .slice(0, 10);

  useEffect(() => {
    let mounted = true;
    const fetchAi = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/ai/bad-reviews');
        const json = await res.json();
        if (!mounted) return;
        if (json && Array.isArray(json.issues)) {
          setAiIssues(json.issues.slice(0, 10));
        } else {
          setAiIssues(null);
          if (json?.warning) setError(json.warning);
        }
      } catch (e: any) {
        if (!mounted) return;
        setAiIssues(null);
        setError(e?.message || 'Failed to fetch AI results');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAi();
    return () => {
      mounted = false;
    };
  }, [reviews]);

  const issues = aiIssues ?? localIssues;
  if (!issues || issues.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium mb-2">Spot Trends — Issues</h2>
        {loading && (
          <div className="flex items-center gap-2"><Loader /><span className="text-sm text-gray-500">Scanning reviews</span></div>
        )}
      </div>
      {error && <div className="text-sm text-yellow-600 mb-2">AI warning: {error}</div>}
      <div className="flex gap-4 overflow-x-auto py-2">
        {issues.map((r) => (
          <div key={r.id} className="min-w-[320px] p-4 bg-white rounded-lg border shadow-sm">
            <div className="flex items-start gap-3">
              <div className="text-red-500 mt-1"><FaExclamationTriangle className="h-6 w-6" /></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">{r.listingName || 'Listing'}</div>
                    <div className="font-semibold">{r.guestName || 'Guest'}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => (
                      <FaStar key={i} className={`h-4 w-4 ${i <= Math.round((r.rating ?? 0)) ? 'text-yellow-500' : 'text-gray-200'}`} aria-hidden />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-700 mt-2 line-clamp-3">{r.publicReview}</p>
                { (r as any).aiReason && <div className="mt-2 text-xs text-indigo-600">AI: {(r as any).aiReason}</div> }
                <div className="mt-2 text-xs text-gray-500">{new Date(r.submittedAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
