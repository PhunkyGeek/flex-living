"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaBed, FaBath, FaUserFriends, FaStar } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { ListingBundle, Review } from '@/lib/types';

interface ListingCardProps {
  bundle: ListingBundle;
  listingData?: {
    price?: number;
    bedrooms?: number;
    bathrooms?: number;
    guests?: number;
    imgurl?: string;
    lat?: number;
    lng?: number;
  };
  onSelect?: (id: string) => void;
}

/**
 * ListingCard displays summary information about a single property.  It
 * shows the average rating, the number of reviews, a small trend chart
 * of ratings over time and highlights the top three categories with
 * progress bars.  A button links to the detail page for that listing.
 */
export default function ListingCard({ bundle, listingData, onSelect }: ListingCardProps) {
  const router = useRouter();
  const { listingId, listingName, ratingAvg, categoryAverages, channelStats, reviews, trend } = bundle;
  // show only approved reviews in the count and star aggregation
  const approvedReviews = reviews.filter((r) => !!r.approved);
  // compute average rating for approved reviews (same logic as server-side): prefer explicit rating, otherwise derive from reviewCategory (10->5 scale)
  const computeAvg = (revs: Review[]) => {
    if (!revs || revs.length === 0) return null;
    let sum = 0;
    let count = 0;
    for (const rev of revs) {
      let rating = rev.rating;
      if (rating == null) {
        // derive from category scores (10-point scale -> 5)
        const derived = rev.reviewCategory.reduce((acc, c) => acc + c.rating / 2, 0) / rev.reviewCategory.length;
        rating = derived;
      }
      sum += rating;
      count++;
    }
    return count > 0 ? parseFloat((sum / count).toFixed(2)) : null;
  };
  const approvedAvg = computeAvg(approvedReviews);
  const filledStars = Math.round(approvedAvg || 0);
  const topCategories = Object.keys(categoryAverages)
    .sort((a, b) => categoryAverages[b] - categoryAverages[a])
    .slice(0, 3);
  // prefer image URL from listingData when available, otherwise fetch via proxy and cache in sessionStorage
  const [imgUrl, setImgUrl] = useState<string | null>(listingData?.imgurl ?? null);

  useEffect(() => {
    if (listingData?.imgurl) {
      // if the listing already provides an image, use it and skip the proxy
      setImgUrl(listingData.imgurl);
      return;
    }
    const key = `img:${listingId}`;
    const cached = sessionStorage.getItem(key);
    if (cached) {
      setImgUrl(cached);
      return;
    }
    let cancelled = false;
    fetch(`/api/images?query=${encodeURIComponent(listingName)}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d?.url) {
          sessionStorage.setItem(key, d.url);
          setImgUrl(d.url);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [listingId, listingName, listingData?.imgurl]);

  // derive some display fields (use listingData if provided else mocked)
  const totalReviews = reviews.length;
  const bedrooms = listingData?.bedrooms ?? ((reviews.length % 3) + 1);
  const bathrooms = listingData?.bathrooms ?? (((reviews.length + 1) % 2) + 1);
  const guests = listingData?.guests ?? Math.min(6, bedrooms * 2);
  const price = listingData?.price ?? Math.max(75, Math.round((ratingAvg ?? 3.5) * 60) + (listingId.length % 30));

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1 overflow-hidden">
      <div className="relative">
        <img src={imgUrl || '/assets/flexliving1.jpeg'} alt={listingName} className="w-full h-44 sm:h-56 md:h-64 lg:h-56 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-md px-3 py-2 text-sm font-semibold shadow-sm flex flex-col items-center" style={{ minWidth: 72 }}>
          <div className="text-lg font-bold" style={{ color: '#284E4C' }}>£{price}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">per night</div>
        </div>
      </div>
      <div
        className="p-4 cursor-pointer"
        onClick={() => {
          onSelect?.(listingId);
          // navigate to the property's full page
          router.push(`/property/${listingId}`);
        }}
        role="button"
        tabIndex={0}
      >
        <h3 className="text-lg font-semibold mb-1 line-clamp-2">{listingName}</h3>
        <div className="text-sm text-gray-500 mb-3">London</div>
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-2"><FaBed className="h-4 w-4 text-gray-500" aria-hidden />{bedrooms} Bedrooms</div>
          <div className="flex items-center gap-2"><FaBath className="h-4 w-4 text-gray-500" aria-hidden />{bathrooms} Bathroom</div>
          <div className="flex items-center gap-2"><FaUserFriends className="h-4 w-4 text-gray-500" aria-hidden />Up to {guests} guests</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {[1,2,3,4,5].map(i => (
              <FaStar key={i} className={`h-4 w-4 ${i <= Math.round(approvedAvg || ratingAvg || 0) ? 'text-yellow-400' : 'text-gray-200'}`} aria-hidden />
            ))}
            <span className="text-sm text-gray-600">{totalReviews} reviews</span>
          </div>
          <Link href={`/property/${listingId}`} className="text-sm text-brand hover:underline">View Details</Link>
        </div>
      </div>
    </div>
  );
}