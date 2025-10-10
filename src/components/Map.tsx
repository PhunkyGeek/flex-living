"use client";

import { useEffect, useRef, useState } from 'react';

type Loc = { id: string | number; lat: number; lng: number; title?: string };

interface MapProps {
  locations?: Loc[];
  height?: string;
  zoom?: number;
  selectedId?: string | null;
}

export default function Map({ locations = [], height = '400px', zoom = 12, selectedId = null }: MapProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any | null>(null);
  const markersRef = useRef<Record<string, any>>({});
  const [forceMock, setForceMock] = useState(false);
  const timerRef = useRef<number | null>(null);
  const [showLoader, setShowLoader] = useState(false);
  const loaderTimerRef = useRef<number | null>(null);
  // reloadKey toggles to force re-init of Leaflet on Retry
  const [reloadKey, setReloadKey] = useState(0);

  // start a fallback timer: if map hasn't initialized after 5s, show mock map
  useEffect(() => {
    // clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    // only start timer when we haven't initialized map yet
    if (!mapRef.current) {
      timerRef.current = window.setTimeout(() => {
        // show a loader first, then after a short delay show the mock map
        if (!mapRef.current) {
          setShowLoader(true);
          // small loader duration before switching to mock
          loaderTimerRef.current = window.setTimeout(() => {
            setShowLoader(false);
            setForceMock(true);
          }, 600) as unknown as number;
        }
      }, 5000) as unknown as number;
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (loaderTimerRef.current) {
        clearTimeout(loaderTimerRef.current);
        loaderTimerRef.current = null;
      }
    };
  }, [locations, reloadKey]);

  useEffect(() => {
    if (!ref.current) return;

    // cleanup previous map if any
    if (mapRef.current) {
      try {
        mapRef.current.remove();
      } catch (e) {}
      mapRef.current = null;
      markersRef.current = {};
    }

    let cancelled = false;

    const init = async () => {
      try {
        // dynamically import leaflet on the client only to avoid SSR/window errors
        const mod = await import('leaflet');
        const L = (mod && (mod.default ?? mod)) as any;

        if (cancelled || !ref.current) return;

        const coords = locations.length > 0 ? locations : [{ lat: 51.5074, lng: -0.1278, id: 'london' }];
        const center = coords.reduce((acc, c) => ({ lat: acc.lat + c.lat, lng: acc.lng + c.lng }), { lat: 0, lng: 0 });
        center.lat /= coords.length;
        center.lng /= coords.length;

        mapRef.current = L.map(ref.current).setView([center.lat, center.lng], zoom);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(mapRef.current);

        // create a dark green marker icon (SVG data URI)
        const svgIcon = encodeURIComponent(`
          <svg xmlns='http://www.w3.org/2000/svg' width='32' height='42' viewBox='0 0 32 42'>
            <path d='M16 0C9.4 0 4 5.4 4 12c0 9.6 12 24 12 24s12-14.4 12-24c0-6.6-5.4-12-12-12z' fill='#284E4C' />
            <circle cx='16' cy='12' r='5' fill='white' />
          </svg>
        `);
        const icon = L.icon({
          iconUrl: `data:image/svg+xml;utf8,${svgIcon}`,
          iconSize: [32, 42],
          iconAnchor: [16, 42],
          popupAnchor: [0, -38],
        });

        // add markers
        const existing = markersRef.current;
        const newIds = new Set<string>();
        locations.forEach((c) => {
          const id = String(c.id);
          newIds.add(id);
          if (!existing[id]) {
            const marker = L.marker([c.lat, c.lng], { icon }).addTo(mapRef.current);
            if (c.title) marker.bindPopup(`<strong>${c.title}</strong>`);
            existing[id] = marker;
          } else {
            try {
              existing[id].setLatLng([c.lat, c.lng]);
              if (c.title) existing[id].bindPopup(`<strong>${c.title}</strong>`);
            } catch (e) {}
          }
        });
        // remove old markers
        Object.keys(existing).forEach((id) => {
          if (!newIds.has(id)) {
            try {
              mapRef.current.removeLayer(existing[id]);
            } catch (e) {}
            delete existing[id];
          }
        });

        // fit bounds to markers
        try {
          const group = L.featureGroup(Object.values(markersRef.current));
          if (group && group.getBounds && group.getBounds().isValid && group.getBounds().isValid()) {
            mapRef.current.fitBounds(group.getBounds().pad(0.2));
          }
        } catch (e) {
          // ignore
        }

        // map initialized -> clear timers and ensure not forcing mock
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        if (loaderTimerRef.current) {
          clearTimeout(loaderTimerRef.current);
          loaderTimerRef.current = null;
        }
        setShowLoader(false);
        setForceMock(false);
      } catch (e) {
        // fail gracefully and allow mock UI
        setForceMock(true);
      }
    };

    init();

    return () => {
      cancelled = true;
      try {
        if (mapRef.current) mapRef.current.remove();
      } catch (e) {}
      mapRef.current = null;
    };
  }, [locations, zoom, reloadKey]);

  // pan & open popup when selectedId changes
  useEffect(() => {
    if (!selectedId) return;
    const map = mapRef.current;
    const marker = markersRef.current[selectedId];
    if (marker && map) {
      try {
        map.panTo(marker.getLatLng());
        if (marker.getPopup) marker.openPopup();
      } catch (e) {}
    }
  }, [selectedId]);

  // Mock map when Leaflet failed
  if (showLoader) {
    return (
      <div className="rounded-md border flex items-center justify-center" style={{ height }}>
        <div className="flex flex-col items-center gap-3">
          <div className="p-2 bg-white rounded-full">
            <svg className="animate-spin h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#CBD5E1" strokeWidth="4"></circle>
              <path d="M22 12a10 10 0 00-10-10" stroke="#284E4C" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
          <div className="text-sm text-gray-600">Map is taking longer than expected</div>
        </div>
      </div>
    );
  }

  // If map initialization failed or user forced mock, show a mock map with Retry
  if (forceMock) {
    const points = locations.length > 0 ? locations : [{ lat: 51.5074, lng: -0.1278, id: 'london' }];
    const lats = points.map((p) => p.lat);
    const lngs = points.map((p) => p.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    return (
      <div className="rounded-md border p-6 flex flex-col items-center justify-center" style={{ height }}>
        <div className="text-center">
          <div className="text-lg font-semibold mb-2">Map unavailable</div>
          <div className="text-sm text-gray-600 mb-4">The interactive map couldn't initialize. You can retry loading it.</div>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => {
                // refresh the map by toggling reloadKey
                setForceMock(false);
                setShowLoader(false);
                setReloadKey((k) => k + 1);
              }}
              className="px-4 py-2 bg-[#284E4C] text-white rounded-md"
            >
              Retry
            </button>
            <button
              onClick={() => {
                // keep mock map visible
                setForceMock(true);
              }}
              className="px-4 py-2 border rounded-md"
            >
              Keep fallback
            </button>
          </div>
        </div>
        <div className="mt-4 w-full bg-gray-100 rounded-md border" style={{ height: '200px' }}>
          <div className="relative h-full w-full">
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">Mock map (no Leaflet)</div>
            {points.map((p) => {
              const top = maxLat === minLat ? 50 : ((maxLat - p.lat) / (maxLat - minLat)) * 80 + 10;
              const left = maxLng === minLng ? 50 : ((p.lng - minLng) / (maxLng - minLng)) * 80 + 10;
              return (
                <div
                  key={p.id}
                  title={p.title}
                  style={{ position: 'absolute', top: `${top}%`, left: `${left}%`, transform: 'translate(-50%,-50%)' }}
                >
                  <div className="h-6 w-6 rounded-full bg-[#284E4C] text-white flex items-center justify-center text-xs">•</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return <div ref={ref} className="rounded-md border" style={{ height }} />;
}
