import { NextRequest } from 'next/server';

/**
 * Placeholder endpoint for fetching Google Reviews via the Places API.  It
 * demonstrates how a proxy to an external API could be structured.  The
 * implementation is intentionally left empty to avoid using external
 * credentials.  You can supply a `placeId` query parameter and return
 * mocked data in the same shape as Hostaway reviews if desired.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const placeId = searchParams.get('placeId');
  if (!placeId) {
    return new Response(JSON.stringify({ error: 'placeId is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  // In a real implementation you would call the Google Places Details API
  // with the provided placeId and map the resulting reviews into the
  // following shape: { id, type, status, rating, publicReview,
  // reviewCategory, submittedAt, guestName, listingName, channel, approved }
  return new Response(JSON.stringify({ error: 'Google Reviews integration is not implemented in this demo.' }), {
    status: 501,
    headers: { 'Content-Type': 'application/json' },
  });
}