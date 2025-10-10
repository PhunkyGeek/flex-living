export interface ReviewCategory {
  category: string;
  rating: number;
}

export type ReviewType = 'guest-to-host' | 'host-to-guest';
export type ReviewStatus =
  | 'awaiting'
  | 'pending'
  | 'scheduled'
  | 'submitted'
  | 'published'
  | 'expired';

export interface Review {
  id: number;
  type: ReviewType;
  status: ReviewStatus;
  rating: number | null;
  publicReview: string;
  reviewCategory: ReviewCategory[];
  submittedAt: string;
  guestName?: string;
  listingName: string;
  channel: string;
  approved?: boolean;
}

export interface ListingBundle {
  listingId: string;
  listingName: string;
  ratingAvg: number | null;
  categoryAverages: Record<string, number>;
  channelStats: Record<string, number>;
  reviews: Review[];
  trend: Array<{ date: string; ratingAvg: number | null }>;
}