import fs from 'fs/promises';
import path from 'path';
import { Review, ListingBundle } from './types';

/**
 * Read the raw reviews from disk.  This helper uses the `data/reviews.json`
 * file located at the project root.  In a production scenario this could
 * instead call an external API such as Hostaway.  The function caches
 * results between calls to avoid re-reading the file on every request.
 */
let cachedReviews: Review[] | null = null;
export async function getReviews(): Promise<Review[]> {
  if (cachedReviews) return cachedReviews;
  const filePath = path.join(process.cwd(), 'data', 'reviews.json');
  const raw = await fs.readFile(filePath, 'utf-8');
  const parsed: Review[] = JSON.parse(raw);
  cachedReviews = parsed;
  return parsed;
}

export interface ReviewFilters {
  listing?: string;
  type?: string;
  channel?: string;
  from?: string;
  to?: string;
  minRating?: number;
  sort?: string;
  approvedOnly?: boolean;
}

/**
 * Normalize reviews into ListingBundle objects.  Reviews are grouped by
 * listing name.  Average ratings and category averages are computed on
 * the fly.  You can provide optional filters for listing, review type,
 * channel, date range, minimum rating and approval state.
 */
export async function getNormalizedListings(filters: ReviewFilters = {}): Promise<{
  listings: ListingBundle[];
  totals: { reviewCount: number; listingCount: number };
  filters: ReviewFilters;
}> {
  const reviews = await getReviews();
  // filter reviews according to query
  let filtered = reviews.slice();
  if (filters.listing) {
    const query = filters.listing.toLowerCase();
    filtered = filtered.filter((r) => r.listingName.toLowerCase().includes(query));
  }
  if (filters.type) {
    filtered = filtered.filter((r) => r.type === filters.type);
  }
  if (filters.channel) {
    filtered = filtered.filter((r) => r.channel === filters.channel);
  }
  if (filters.approvedOnly) {
    filtered = filtered.filter((r) => r.approved);
  }
  if (filters.from) {
    const fromDate = new Date(filters.from);
    filtered = filtered.filter((r) => new Date(r.submittedAt) >= fromDate);
  }
  if (filters.to) {
    const toDate = new Date(filters.to);
    filtered = filtered.filter((r) => new Date(r.submittedAt) <= toDate);
  }
  if (filters.minRating) {
    filtered = filtered.filter((r) => {
      if (r.rating !== null) return r.rating >= (filters.minRating ?? 0);
      // if rating is null, derive from category average (out of 10 -> 5)
      const derived = r.reviewCategory.reduce((sum, c) => sum + c.rating / 2, 0) / r.reviewCategory.length;
      return derived >= (filters.minRating ?? 0);
    });
  }
  // group by listing name
  const groups = new Map<string, Review[]>();
  for (const r of filtered) {
    const key = r.listingName;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }
  const listings: ListingBundle[] = [];
  for (const [listingName, list] of groups.entries()) {
    // compute ratingAvg
    let sumRatings = 0;
    let count = 0;
    const categorySums: Record<string, { total: number; count: number }> = {};
    const channelStats: Record<string, number> = {};
    const trendMap: Map<string, { total: number; count: number }> = new Map();
    for (const rev of list) {
      // compute rating (use explicit rating if available else derive from categories /2)
      let rating = rev.rating;
      if (rating == null) {
        const derived = rev.reviewCategory.reduce((acc, cat) => acc + cat.rating / 2, 0) / rev.reviewCategory.length;
        rating = derived;
      }
      sumRatings += rating;
      count++;
      // accumulate categories
      rev.reviewCategory.forEach((cat) => {
        if (!categorySums[cat.category]) {
          categorySums[cat.category] = { total: 0, count: 0 };
        }
        categorySums[cat.category].total += cat.rating;
        categorySums[cat.category].count++;
      });
      // channel stats
      channelStats[rev.channel] = (channelStats[rev.channel] ?? 0) + 1;
      // trend by month (YYYY-MM)
      const date = new Date(rev.submittedAt);
      const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
      const entry = trendMap.get(monthKey) ?? { total: 0, count: 0 };
      entry.total += rating;
      entry.count++;
      trendMap.set(monthKey, entry);
    }
    const ratingAvg = count > 0 ? parseFloat((sumRatings / count).toFixed(2)) : null;
    const categoryAverages: Record<string, number> = {};
    for (const catName of Object.keys(categorySums)) {
      const { total, count } = categorySums[catName];
      // convert 10-point scale to 5-star average
      const avg = (total / count) / 2;
      categoryAverages[catName] = parseFloat(avg.toFixed(2));
    }
    // build trend array sorted by month ascending
    const trend: Array<{ date: string; ratingAvg: number | null }> = [];
    Array.from(trendMap.entries())
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .forEach(([month, data]) => {
        trend.push({ date: month, ratingAvg: parseFloat((data.total / data.count).toFixed(2)) });
      });
    listings.push({
      listingId: listingName.toLowerCase().replace(/\s+/g, '-'),
      listingName,
      ratingAvg,
      categoryAverages,
      channelStats,
      reviews: list,
      trend,
    });
  }
  // sort listings by rating if requested
  if (filters.sort === 'asc') {
    listings.sort((a, b) => (a.ratingAvg ?? 0) - (b.ratingAvg ?? 0));
  } else if (filters.sort === 'desc') {
    listings.sort((a, b) => (b.ratingAvg ?? 0) - (a.ratingAvg ?? 0));
  }
  return {
    listings,
    totals: { reviewCount: filtered.length, listingCount: listings.length },
    filters,
  };
}

/**
 * Toggle or explicitly set the approval state of a review by ID.  This
 * function mutates the JSON file on disk to persist the change.  It
 * returns the new approval state.  If an `approved` boolean is provided
 * it will set the state accordingly, otherwise it toggles the existing
 * state.
 */
export async function toggleApprove(id: number, approved?: boolean): Promise<{ success: boolean; approved: boolean }> {
  const filePath = path.join(process.cwd(), 'data', 'reviews.json');
  const raw = await fs.readFile(filePath, 'utf-8');
  const reviews: Review[] = JSON.parse(raw);
  const idx = reviews.findIndex((r) => r.id === id);
  if (idx === -1) {
    return { success: false, approved: false };
  }
  const current = reviews[idx].approved ?? false;
  const newVal = typeof approved === 'boolean' ? approved : !current;
  reviews[idx].approved = newVal;
  await fs.writeFile(filePath, JSON.stringify(reviews, null, 2), 'utf-8');
  // update cache
  cachedReviews = reviews;
  return { success: true, approved: newVal };
}

/**
 * Delete a review by id. Returns true on success, false if not found.
 */
export async function deleteReview(id: number): Promise<boolean> {
  const filePath = path.join(process.cwd(), 'data', 'reviews.json');
  const raw = await fs.readFile(filePath, 'utf-8');
  const reviews: Review[] = JSON.parse(raw);
  const idx = reviews.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  reviews.splice(idx, 1);
  await fs.writeFile(filePath, JSON.stringify(reviews, null, 2), 'utf-8');
  cachedReviews = reviews;
  return true;
}