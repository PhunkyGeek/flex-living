import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query') || 'house';

  const key = process.env.UNSPLASH_KEY || process.env.NEXT_PUBLIC_UNSPLASH_KEY;
  if (!key) {
    // return a simple placeholder image URL (SVG data-uri)
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'><rect width='100%' height='100%' fill='%23e5e7eb'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='36'>No Image</text></svg>`;
    const url = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    return new Response(JSON.stringify({ url }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1`, {
      headers: { Authorization: `Client-ID ${key}` },
    });
    if (!res.ok) throw new Error('Unsplash request failed');
    const data = await res.json();
    const url = data?.results?.[0]?.urls?.regular || data?.results?.[0]?.urls?.small || null;
    if (!url) throw new Error('No image');
    return new Response(JSON.stringify({ url }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'><rect width='100%' height='100%' fill='%23e5e7eb'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='36'>Image unavailable</text></svg>`;
    const url = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    return new Response(JSON.stringify({ url }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
}
