"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { ListingBundle } from '../../../lib/types';
import PublicReviewsSection from '../../../components/PublicReviewsSection';
import Loader from '../../../components/ui/Loader';

export default function ShareListingPage() {
  const params = useParams();
  const listingId = Array.isArray(params.listingId) ? params.listingId[0] : (params.listingId as string);
  const [bundle, setBundle] = useState<ListingBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Only approved reviews
        const res = await fetch(`/api/reviews/hostaway?listing=${listingId}&approvedOnly=true`);
        const data = await res.json();
        const found = data.listings.find((l: ListingBundle) => l.listingId === listingId);
        if (found) setBundle(found);
        else setError('Listing not found');
        setLoading(false);
      } catch (e) {
        setError('Failed to load listing');
        setLoading(false);
      }
    };
    fetchData();
  }, [listingId]);
  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex items-center gap-2"><Loader /><span className="text-sm text-gray-600">Loading</span></div>
      ) : error || !bundle ? (
        <p className="text-red-500">{error || 'Listing not found'}</p>
      ) : (
        <PublicReviewsSection bundle={bundle} />
      )}
    </div>
  );
}