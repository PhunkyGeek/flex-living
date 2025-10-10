"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { ListingBundle, Review, ReviewCategory } from '../../../lib/types';
import ReviewsTable from '../../../components/ReviewsTable';
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaUserFriends,
  FaBed,
  FaBath,
  FaHome,
  FaTv,
  FaGlobe,
  FaWifi,
  FaUtensils,
  FaTshirt,
  FaWind,
  FaThermometerHalf,
  FaShieldAlt,
  FaChevronRight,
  FaSmokingBan,
  FaPaw,
  FaGlassMartiniAlt,
  FaCalendarAlt,
  FaClock,
  FaPaperPlane,
  FaComment,
} from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import listingsStatic from '../../../../data/listings.json';
import Map from '../../../components/Map';
import Loader from '../../../components/ui/Loader';

export default function PropertyPage() {
  const params = useParams();
  const listingId = Array.isArray(params.listingId) ? params.listingId[0] : (params.listingId as string);
  const [bundle, setBundle] = useState<ListingBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [listingMeta, setListingMeta] = useState<any>(null);
  const [showMore, setShowMore] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [guests, setGuests] = useState<number>(1);
  const [guestOpen, setGuestOpen] = useState(false);
  // fetch property bundle
  useEffect(() => {
    const fetchBundle = async () => {
      try {
        const res = await fetch(`/api/reviews/hostaway?listing=${listingId}`);
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
    fetchBundle();
    // load static listing meta (images, price, beds)
    try {
      const meta = (listingsStatic as any[]).find((l) => l.listingId === listingId);
      setListingMeta(meta ?? null);
    } catch (e) {
      setListingMeta(null);
    }
  }, [listingId]);
  // handle approval toggle
  const handleToggle = async (id: number, approved: boolean) => {
    await fetch(`/api/reviews/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved }),
    });
    // reload listing data after toggle
    const res = await fetch(`/api/reviews/hostaway?listing=${listingId}`);
    const data = await res.json();
    const found = data.listings.find((l: ListingBundle) => l.listingId === listingId);
    if (found) setBundle(found);
  };
  // compute approved-only reviews and average (client-side, mirroring server logic)
  const computeAvg = (revs: Review[]) => {
    if (!revs || revs.length === 0) return null;
    let sum = 0;
    let count = 0;
    for (const rev of revs) {
      let rating = rev.rating;
      if (rating == null) {
        const derived = rev.reviewCategory.reduce((acc: number, c: ReviewCategory) => acc + c.rating / 2, 0) / rev.reviewCategory.length;
        rating = derived;
      }
      sum += rating;
      count++;
    }
    return count > 0 ? parseFloat((sum / count).toFixed(2)) : null;
  };
  const approvedReviews = bundle ? bundle.reviews.filter((r: Review) => !!r.approved) : [];
  const approvedAvg = computeAvg(approvedReviews);
  // compute category data for bar chart
  const barData = bundle
    ? Object.keys(bundle.categoryAverages).map((cat) => ({ name: cat, value: bundle.categoryAverages[cat] }))
    : [];
  // channel mix data for pie chart
  const pieData = bundle
    ? Object.keys(bundle.channelStats).map((ch) => ({ name: ch, value: bundle.channelStats[ch] }))
    : [];
  const pieColors = ['#21A47C', '#40C78D', '#1C8D6C', '#A7F3D0', '#6EE7B7'];
  return (
    <div className="container mx-auto px-6 py-6">
      {loading ? (
        <div className="flex items-center gap-2"><Loader /><span className="text-sm text-gray-600">Loading</span></div>
      ) : error || !bundle ? (
        <p className="text-red-500">{error || 'Listing not found'}</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <img src={listingMeta?.imgurl || '/assets/flexliving1.jpeg'} alt={bundle.listingName} className="rounded-lg object-cover w-full h-[420px] md:col-span-2" />
              <div className="flex flex-col gap-4">
                <img src={listingMeta?.imgurl || '/assets/flexliving1.jpeg'} alt="thumb1" className="rounded-lg object-cover h-[200px] w-full" />
                <img src={listingMeta?.imgurl || '/assets/flexliving1.jpeg'} alt="thumb2" className="rounded-lg object-cover h-[200px] w-full" />
              </div>
            </div>

            {/* Title + stats */}
            <div>
              <h1 className="text-3xl font-bold mb-4">{bundle.listingName}</h1>
              <div className="flex items-center gap-6 text-gray-600 mb-4">
                <div className="flex items-center gap-2"><FaUserFriends className="text-gray-500" /> <div><div className="font-medium">{listingMeta?.guests ?? 2}</div><div className="text-xs">Guests</div></div></div>
                <div className="flex items-center gap-2"><FaBed className="text-gray-500" /> <div><div className="font-medium">{listingMeta?.bedrooms ?? 1}</div><div className="text-xs">Bedrooms</div></div></div>
                <div className="flex items-center gap-2"><FaBath className="text-gray-500" /> <div><div className="font-medium">{listingMeta?.bathrooms ?? 1}</div><div className="text-xs">Bathrooms</div></div></div>
                <div className="flex items-center gap-2"><FaHome className="text-gray-500" /> <div><div className="font-medium">{listingMeta?.beds ?? 1}</div><div className="text-xs">beds</div></div></div>
                {/* rating + reviews at rightmost end */}
                <div className="flex items-center gap-3 ml-auto">
                  {/* compute rating: prefer approvedAvg then server ratingAvg */}
                  {(() => {
                    const ratingNumber: number | null = typeof approvedAvg === 'number' ? approvedAvg : (bundle.ratingAvg ?? null);
                    const renderStars = (r: number | null) => {
                      if (r == null) return <div className="text-gray-500">—</div>;
                      const stars: React.ReactElement[] = [];
                      let remaining = Math.round(r * 2) / 2; // round to nearest 0.5
                      for (let i = 0; i < 5; i++) {
                        if (remaining >= 1) {
                          stars.push(<FaStar key={i} className="text-yellow-400" />);
                          remaining -= 1;
                        } else if (remaining === 0.5) {
                          stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
                          remaining = 0;
                        } else {
                          stars.push(<FaRegStar key={i} className="text-gray-300" />);
                        }
                      }
                      return <div className="flex items-center gap-1">{stars}</div>;
                    };
                    return (
                      <>
                        {renderStars(ratingNumber)}
                        <div className="ml-2 text-sm">
                          <div className="font-medium">{ratingNumber != null ? Number(ratingNumber).toFixed(1) : '—'}</div>
                          <div className="text-xs text-gray-600">{approvedReviews.length} reviews</div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* About this property */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-3">About this property</h2>
              {(() => {
                const sourceText = bundle.reviews && bundle.reviews.length > 0
                  ? bundle.reviews[0].publicReview
                  : listingMeta?.description ?? 'This property is a comfortable place to stay with great amenities. Located close to transit and local shops, it offers a well-equipped kitchen, fast internet, and thoughtful touches for a relaxing stay.';
                const moreText = ' The apartment includes hypoallergenic bedding, fast Wi‑Fi, a small workspace, and 24/7 support from the host. Guests consistently praise the location and cleanliness. For longer stays we provide extra linens and a weekly tidy service upon request.';
                const fullText = sourceText + moreText;
                const preview = fullText.slice(0, 260);
                return (
                  <p className="text-gray-700">
                    {showMore ? fullText : preview + (fullText.length > preview.length ? '...' : '')}
                    {fullText.length > preview.length && (
                      <button onClick={() => setShowMore(!showMore)} className="ml-2 text-green-800 font-medium">
                        {showMore ? 'Read less' : 'Read more'}
                      </button>
                    )}
                  </p>
                );
              })()}
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-semibold">Amenities</h2>
                <button className="text-sm text-gray-700 border rounded-md px-3 py-1 flex items-center gap-2">
                  View all amenities <FaChevronRight className="text-xs"/>
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-gray-700">
                <div className="flex items-center gap-3">
                  <FaTv className="text-gray-500 text-lg" />
                  <div>Cable TV</div>
                </div>
                <div className="flex items-center gap-3">
                  <FaGlobe className="text-gray-500 text-lg" />
                  <div>Internet</div>
                </div>
                <div className="flex items-center gap-3">
                  <FaWifi className="text-gray-500 text-lg" />
                  <div>Wireless</div>
                </div>
                <div className="flex items-center gap-3">
                  <FaUtensils className="text-gray-500 text-lg" />
                  <div>Kitchen</div>
                </div>
                <div className="flex items-center gap-3">
                  <FaTshirt className="text-gray-500 text-lg" />
                  <div>Washing Machine</div>
                </div>
                <div className="flex items-center gap-3">
                  <FaWind className="text-gray-500 text-lg" />
                  <div>Hair Dryer</div>
                </div>
                <div className="flex items-center gap-3">
                  <FaThermometerHalf className="text-gray-500 text-lg" />
                  <div>Heating</div>
                </div>
                <div className="flex items-center gap-3">
                  <FaShieldAlt className="text-gray-500 text-lg" />
                  <div>Smoke Detector</div>
                </div>
                <div className="flex items-center gap-3">
                  <FaShieldAlt className="text-gray-500 text-lg" />
                  <div>Carbon Monoxide Detector</div>
                </div>
              </div>
            </div>

            {/* Stay Policies & Cancellation */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-3">Stay Policies</h2>
              <div className="grid gap-4">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-2"><FaClock className="text-emerald-700" /> <h3 className="font-medium">Check-in & Check-out</h3></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg">Check-in Time<div className="font-bold">3:00 PM</div></div>
                    <div className="bg-white p-4 rounded-lg">Check-out Time<div className="font-bold">10:00 AM</div></div>
                  </div>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-2"><FaShieldAlt className="text-emerald-700" /> <h3 className="font-medium">House Rules</h3></div>
                  <div className="grid grid-cols-2 gap-4 text-gray-700">
                    <div className="bg-white p-3 rounded-lg flex items-center gap-3"><FaSmokingBan className="text-gray-500" /> No smoking</div>
                    <div className="bg-white p-3 rounded-lg flex items-center gap-3"><FaPaw className="text-gray-500" /> No pets</div>
                    <div className="bg-white p-3 rounded-lg flex items-center gap-3"><FaGlassMartiniAlt className="text-gray-500" /> No parties or events</div>
                    <div className="bg-white p-3 rounded-lg flex items-center gap-3"><FaShieldAlt className="text-gray-500" /> Security deposit required</div>
                  </div>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-2"><FaCalendarAlt className="text-emerald-700" /> <h3 className="font-medium">Cancellation Policy</h3></div>
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">For stays less than 28 days</h4>
                    <ul className="list-inside space-y-1 text-gray-700">
                      <li className="flex items-start gap-2"><span className="mt-1 text-emerald-700">●</span> Full refund up to 14 days before check-in</li>
                      <li className="flex items-start gap-2"><span className="mt-1 text-emerald-700">●</span> No refund for bookings less than 14 days before check-in</li>
                    </ul>
                  </div>
                  <div className="bg-white p-4 rounded-lg mt-3">
                    <h4 className="font-semibold mb-2">For stays of 28 days or more</h4>
                    <ul className="list-inside space-y-1 text-gray-700">
                      <li className="flex items-start gap-2"><span className="mt-1 text-emerald-700">●</span> Full refund up to 30 days before check-in</li>
                      <li className="flex items-start gap-2"><span className="mt-1 text-emerald-700">●</span> No refund for bookings less than 30 days before check-in</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Location (map) */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-3">Location</h2>
              <div className="rounded overflow-hidden">
                <Map locations={[{ id: listingId, lat: listingMeta?.lat ?? 51.505, lng: listingMeta?.lng ?? -0.12, title: bundle.listingName }]} height="360px" />
              </div>
            </div>

            {/* Manage reviews (moved below location) */}
            <div>
              <h2 className="text-xl font-semibold mt-4 mb-2">Manage Reviews</h2>
              <ReviewsTable reviews={bundle.reviews} onToggle={handleToggle} />
            </div>
          </div>

          {/* Right column: sticky booking card */}
          <aside className="lg:col-span-1">
            <div className="sticky top-20">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-6 bg-[#284E4C] text-white rounded-t-lg">
                  <h3 className="text-lg font-semibold">Book Your Stay</h3>
                  <p className="text-sm">Select dates to see prices</p>
                </div>
                <div className="p-6">
                      <div className="mb-3 flex gap-2 items-start">
                        {/* Date picker trigger (flex-1) */}
                        <div className="relative flex-1">
                          <button
                            type="button"
                            onClick={() => setShowDatePicker(!showDatePicker)}
                            className="w-full text-left border rounded-md px-10 py-2 bg-gray-50 flex items-center gap-2"
                          >
                            <FaCalendarAlt className="absolute left-3 text-gray-400" />
                            <span className="text-gray-700">
                              {startDate && endDate
                                ? new Date(startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' – ' + new Date(endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                                : 'Select dates'}
                            </span>
                          </button>

                          {showDatePicker && (
                            <div className="absolute left-0 mt-2 w-full bg-white border rounded-md shadow-lg p-4 z-40">
                              <div className="grid grid-cols-1 gap-3">
                                <label className="text-sm text-gray-600">Check-in</label>
                                <input
                                  type="date"
                                  value={startDate ?? ''}
                                  onChange={(e) => setStartDate(e.target.value || null)}
                                  className="w-full border rounded-md px-3 py-2"
                                />
                                <label className="text-sm text-gray-600">Check-out</label>
                                <input
                                  type="date"
                                  value={endDate ?? ''}
                                  onChange={(e) => setEndDate(e.target.value || null)}
                                  className="w-full border rounded-md px-3 py-2"
                                />
                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={() => {
                                      // ensure dates valid
                                      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
                                        // swap
                                        const s = startDate;
                                        setStartDate(endDate);
                                        setEndDate(s);
                                      }
                                      setShowDatePicker(false);
                                    }}
                                    className="px-3 py-2 bg-emerald-600 text-white rounded-md"
                                  >
                                    Apply
                                  </button>
                                  <button
                                    onClick={() => {
                                      setStartDate(null);
                                      setEndDate(null);
                                      setShowDatePicker(false);
                                    }}
                                    className="px-3 py-2 border rounded-md"
                                  >
                                    Clear
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Guests custom dropdown */}
                        <div className="relative w-36">
                          <button
                            type="button"
                            onClick={() => setGuestOpen((s) => !s)}
                            className="w-full text-left border rounded-md px-3 py-2 bg-white flex items-center gap-2"
                          >
                            <FaUserFriends className="text-gray-500" />
                            <span className="flex-1">{guests}</span>
                            <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" /></svg>
                          </button>
                          {guestOpen && (
                            <div className="absolute right-0 mt-2 w-full bg-white border rounded-md shadow-lg z-50">
                              {[1,2,3,4,5].map((n) => (
                                <button
                                  key={n}
                                  onClick={() => { setGuests(n); setGuestOpen(false); }}
                                  className={`w-full text-left px-3 py-2 hover:bg-[#284E4C] hover:text-white ${guests===n ? 'bg-[#284E4C] text-white' : 'text-gray-700'}`}
                                >
                                  <div className="flex items-center gap-2"><FaUserFriends /> {n} {n===1 ? 'guest' : 'guests'}</div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    <button className="w-full bg-gray-500 text-white rounded-md py-3 mb-3 flex items-center justify-center gap-2"><FaCalendarAlt /> Check availability</button>
                    <button className="w-full border rounded-md py-3 mb-3 text-[#284E4C] flex items-center justify-center gap-2"><FaComment className="text-[#284E4C]" /> Send Inquiry</button>
                    <div className="text-center text-sm text-gray-500"><FaShieldAlt className="inline-block mr-2 text-gray-400" /> Instant booking confirmation</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}