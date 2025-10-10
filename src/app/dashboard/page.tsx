"use client";

import { useEffect, useState } from 'react';
import FilterBar from '@/components/FilterBar';
import ListingCard from '@/components/ListingCard';
import type { ListingBundle, Review } from '@/lib/types';
import { useCallback } from 'react';
import { FaStar } from 'react-icons/fa';
import Switch from '@/components/ui/Switch';
import { FiTrash2 } from 'react-icons/fi';
import Map from '@/components/Map';
import SpotTrends from '@/components/SpotTrends';
import listingsStatic from '../../../data/listings.json';

interface ApiResponse {
  listings: ListingBundle[];
  totals: { reviewCount: number; listingCount: number };
}

export default function DashboardPage() {
  const [listings, setListings] = useState<ListingBundle[]>([]);
  const [listingData, setListingData] = useState<Record<string, any>>({});
  const [filtered, setFiltered] = useState<ListingBundle[]>([]);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // filter state
  const [search, setSearch] = useState('');
  const [channel, setChannel] = useState('');
  const [type, setType] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('relevance');
  const [categoryFilter, setCategoryFilter] = useState('');
  // fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/reviews/hostaway');
        const data: ApiResponse = await res.json();
        // build supplemental listing data from local JSON
        const mapData: Record<string, any> = {};
        (listingsStatic as any[]).forEach((l) => {
          mapData[l.listingId] = l;
        });
        setListingData(mapData);
        setListings(data.listings);
        setFiltered(data.listings);
        setLoading(false);
      } catch (e: any) {
        setError('Failed to load data');
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  // apply filters whenever filter state or listings change
  useEffect(() => {
    let result = listings;
    // search by listing name or guest names inside reviews
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((l) => {
        if (l.listingName.toLowerCase().includes(q)) return true;
        // check guest names
        return l.reviews.some((rev) => rev.guestName?.toLowerCase().includes(q));
      });
    }
    if (channel) {
      result = result.filter((l) => Object.keys(l.channelStats).includes(channel));
    }
    if (type) {
      result = result.map((l) => ({
        ...l,
        reviews: l.reviews.filter((rev) => rev.type === type),
      }))
        .filter((l) => l.reviews.length > 0);
    }
    if (minRating > 0) {
      result = result.filter((l) => (l.ratingAvg ?? 0) >= minRating);
    }
    setFiltered(result);
  }, [search, channel, type, minRating, listings]);
  // derive unique channels and types for filter options
  const channels = Array.from(
    new Set(
      listings
        .flatMap((l) => Object.keys(l.channelStats))
        .filter((c) => c && c.trim().length > 0)
    )
  );
  const types = Array.from(
    new Set(
      listings
        .flatMap((l) => l.reviews.map((rev) => rev.type))
        .filter((t) => t && t.trim().length > 0)
    )
  );
  // derive latest comments across all listings (sorted by submittedAt desc)
  const latestComments = listings
    .flatMap((l) => l.reviews.map((r) => ({ ...r, listingName: l.listingName } as Review & { listingName: string })))
    .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1))
    .slice(0, 10);

  const toggleApprove = useCallback(async (id: number, approved: boolean) => {
    const res = await fetch(`/api/reviews/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved }),
    });
    if (!res.ok) return false;
    // update local listings state to reflect approval change
    setListings((prev) => prev.map((l) => ({
      ...l,
      reviews: l.reviews.map((r) => (r.id === id ? { ...r, approved } : r)),
    })));
    return true;
  }, []);

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const deleteReview = useCallback(async (id: number) => {
    const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
    if (!res.ok) return false;
    setListings((prev) => prev.map((l) => ({ ...l, reviews: l.reviews.filter((r) => r.id !== id) })));
    return true;
  }, []);

  return (
    <div className="flex flex-col space-y-4">
      <h1 className="text-2xl font-semibold mb-2">Dashboard</h1>
      <div className="text-lg font-medium mt-4 mb-2">Welcome Landlord</div>
      <FilterBar
        search={search}
        channel={channel}
        type={type}
        minRating={minRating}
        sortBy={sortBy}
        category={categoryFilter}
        channels={channels}
        types={types}
        categories={Array.from(new Set(listings.flatMap((l) => Object.keys(l.categoryAverages))))}
        onFilterChange={(name, value) => {
          if (name === 'search') setSearch(value);
          if (name === 'channel') setChannel(value);
          if (name === 'type') setType(value);
          if (name === 'minRating') setMinRating(value);
          if (name === 'sortBy') setSortBy(value);
          if (name === 'category') setCategoryFilter(value);
        }}
      />
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : filtered.length === 0 ? (
        <p>No listings match your filters.</p>
      ) : (
        // Two-column responsive layout: listings on the left, map on the right (map stacks below on small screens)
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
              {filtered.map((l) => (
                <ListingCard key={l.listingId} bundle={l} listingData={listingData[l.listingId]} onSelect={(id)=>setSelectedListingId(id)} />
              ))}
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              {/* <h2 className="text-xl font-semibold mb-3">Location</h2> */}
              <div className="rounded overflow-hidden" style={{ height: '360px' }}>
                <Map
                  locations={filtered.map((l, i) => ({ id: l.listingId, lat: listingData[l.listingId]?.lat ?? 51.5 + (i % 5) * 0.01, lng: listingData[l.listingId]?.lng ?? -0.12 + (i % 7) * 0.01, title: l.listingName }))}
                  height="100%"
                  selectedId={selectedListingId}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Spot trends (issues) carousel */}
      <div className="mt-6">
        <SpotTrends reviews={listings.flatMap((l) => l.reviews.map((r) => ({ ...r, listingName: l.listingName })))} />
      </div>
      {/* Latest comments carousel moved below listings */}
      <section>
        <h2 className="text-lg font-medium mt-4 mb-2">Latest Comments</h2>
        <div className="flex gap-4 overflow-x-auto py-2">
          {latestComments.map((c) => {
            // compute rating for the card (explicit rating or derived from categories)
            const computeRating = (rev: Review) => {
              if (rev.rating != null) return rev.rating;
              const derived = rev.reviewCategory.reduce((acc, cat) => acc + cat.rating / 2, 0) / rev.reviewCategory.length;
              return derived;
            };
            const rating = computeRating(c as Review);
            const filled = Math.round(rating || 0);
            return (
              <div key={c.id} className="min-w-[320px] p-4 bg-white rounded-lg border shadow-sm flex flex-col justify-between">
                <div>
                  {/* Delete confirmation modal */}
                  {confirmDeleteId !== null && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                      <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-2">Delete review</h3>
                        <p className="text-sm text-gray-600 mb-4">Are you sure you want to delete this review? This action cannot be undone.</p>
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 rounded bg-gray-100">Cancel</button>
                          <button
                            onClick={async () => {
                              if (confirmDeleteId === null) return;
                              await deleteReview(confirmDeleteId);
                              setConfirmDeleteId(null);
                            }}
                            className="px-4 py-2 rounded bg-red-600 text-white"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-500">{c.listingName}</div>
                      <div className="font-semibold mt-1">{c.guestName}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setConfirmDeleteId(c.id)} aria-label="Delete review" className="p-2 rounded hover:bg-gray-100">
                        <FiTrash2 className="h-5 w-5 text-gray-600" />
                      </button>
                      <Switch checked={!!c.approved} onChange={async (checked) => { await toggleApprove(c.id, checked); }} />
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-2">{c.publicReview}</p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">{new Date(c.submittedAt).toLocaleDateString()}</div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map((i)=> (
                      <FaStar key={i} className={`h-4 w-4 ${i<=filled ? 'text-yellow-500' : 'text-gray-200'}`} aria-hidden />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}