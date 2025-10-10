import { NextRequest } from 'next/server';
import { getNormalizedListings } from '../../../../lib/reviews';
import type { ListingBundle } from '../../../../lib/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const filters: any = {};
  const listing = searchParams.get('listing');
  const type = searchParams.get('type');
  const channel = searchParams.get('channel');
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const minRating = searchParams.get('minRating');
  const sort = searchParams.get('sort');
  const approvedOnly = searchParams.get('approvedOnly');

  if (listing) filters.listing = listing;
  if (type) filters.type = type;
  if (channel) filters.channel = channel;
  if (from) filters.from = from;
  if (to) filters.to = to;
  if (minRating) filters.minRating = parseFloat(minRating as string);
  if (sort) filters.sort = sort;
  if (approvedOnly === 'true') filters.approvedOnly = true;

  const data = await getNormalizedListings(filters);

  // If the request asked for a listing but the name-based filter returned
  // no matches, the client may have sent a slug (listingId) like
  // `bayside-retreat`. Attempt a fallback: load all listings and match
  // by the computed `listingId` (slug) so `/property/<slug>` works.
  if (filters.listing && data.listings.length === 0) {
    const all = await getNormalizedListings();
  const matched = all.listings.filter((l: ListingBundle) => l.listingId === filters.listing);
    if (matched.length > 0) {
      return new Response(JSON.stringify({ listings: matched, totals: { reviewCount: matched.reduce((s, l) => s + l.reviews.length, 0), listingCount: matched.length }, filters }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
