import Link from 'next/link';
import listingsStatic from '../../../data/listings.json';

export default function ShareIndexPage() {
  const listings = listingsStatic as any[];

  return (
    <div className="container mx-auto px-6 py-6">
      <h1 className="text-2xl font-semibold mb-4">Shareable properties</h1>
      <p className="text-sm text-gray-600">Click a card to view public reviews for that property.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {listings.map((l) => (
          <Link key={l.listingId} href={`/share/${l.listingId}`} className="block bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
            <div className="w-full h-44 bg-gray-100">
              <img src={l.imgurl || '/assets/flexliving1.jpeg'} alt={l.listingName} className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">{l.listingName}</h3>
                {l.price && <div className="text-sm font-semibold text-[#284E4C]">${l.price}</div>}
              </div>
              <p className="text-sm text-gray-500 mt-2">{l.bedrooms} beds · {l.bathrooms} baths · {l.guests} guests</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
