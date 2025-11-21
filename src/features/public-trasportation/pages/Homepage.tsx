import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import BusInfo from '../components/BusInfo';
import MapView from '../components/MapView';
import axios from 'axios';
import { getBaseAPIURL } from '@/lib/apiClient.ts';

const GOOGLE_API_KEY = 'AIzaSyAPNBcfQDaVuSGaC4LiSLTWMSvk3Xz3iNQ';

interface RouteSummary {
  start_address: string;
  end_address: string;
  distance: { text: string; value: number };
  duration: { text: string; value: number };
  detailedSteps: Array<{
    instruction: string;
    travel_mode: string;
    line_name?: string;
    vehicle_type?: string;
  }>;
  fare: { value: number; currency: string; text: string } | null;
}

interface Coords {
  lat: string;
  lng: string;
  name?: string;
}

const API_BASE_URL = getBaseAPIURL + '/api/routes/all';
const geocodeAddress = async (query: string): Promise<Coords | null> => {
  if (!query) return null;

  const mapSelectionMatch = query.match(/\(([^,]+),\s*([^)]+)\)/);
  if (mapSelectionMatch) {
    const lat = mapSelectionMatch[1].trim();
    const lng = mapSelectionMatch[2].trim();
    if (!isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
      return Promise.resolve({ lat, lng, name: query });
    }
  }

  try {
    const GEOCODE_URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`;

    const response = await axios.get(GEOCODE_URL);
    const data = response.data;

    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      const location = result.geometry.location;
      const name = result.formatted_address || query;

      return {
        lat: location.lat.toString(),
        lng: location.lng.toString(),
        name: name,
      };
    }

    return null;
  } catch (error) {
    console.error('Google Geocoding API Error:', error);
    return null;
  }
};

export default function Home() {
  const [routes, setRoutes] = useState<RouteSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [originQuery, setOriginQuery] = useState(
    "King Mongkut's University of Technology Thonburi"
  );

  const [originLocation, setOriginLocation] = useState({
    origLat: '13.6515',
    origLng: '100.4940',
    originName: "King Mongkut's University of Technology Thonburi",
  });

  const [destinationQuery, setDestinationQuery] = useState('');

  const [destinationCoords, setDestinationCoords] = useState<{
    lat: string;
    lng: string;
  } | null>(null);

  const [selectionMode, setSelectionMode] = useState<
    'origin' | 'destination' | null
  >(null);

  const fetchRoutes = async (
    origCoords: { lat: string; lng: string; name: string },
    destCoords: { lat: string; lng: string; name: string }
  ) => {
    setLoading(true);
    setError(null);
    setRoutes([]);

    try {
      const response = await axios.get(API_BASE_URL, {
        params: {
          origin: origCoords.name,
          origLat: origCoords.lat,
          origLng: origCoords.lng,
          destination: destCoords.name,
          destLat: destCoords.lat,
          destLng: destCoords.lng,
        },
      });

      if (response.data.success && response.data.allRoutes) {
        // 🟢 การจัดเรียงตาม duration.value (เร็วสุดไปช้าสุด)
        const sortedRoutes: RouteSummary[] = response.data.allRoutes.sort(
          (a: RouteSummary, b: RouteSummary) =>
            a.duration.value - b.duration.value
        );

        setRoutes(sortedRoutes);
      } else {
        setError(response.data.message || 'No routes found.');
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to connect to the route service. Check your backend port and CORS settings.';
      setError('Route Error: ' + message);
      console.error('API Call Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInitialSearch = async () => {
    if (!originQuery || !destinationQuery) {
      setError('Please enter both Origin and Destination.');
      return;
    }

    const originCoordsResult = await geocodeAddress(originQuery);
    if (!originCoordsResult) {
      setError(
        `Could not find coordinates for Origin: "${originQuery}". Please refine your search or select on map.`
      );
      return;
    }
    const newOriginCoords = {
      lat: originCoordsResult.lat,
      lng: originCoordsResult.lng,
      name: originCoordsResult.name || originQuery,
    };
    setOriginLocation({
      origLat: newOriginCoords.lat,
      origLng: newOriginCoords.lng,
      originName: newOriginCoords.name,
    });
    setOriginQuery(newOriginCoords.name);

    const destCoordsResult = await geocodeAddress(destinationQuery);
    if (!destCoordsResult) {
      setError(
        `Could not find coordinates for Destination: "${destinationQuery}". Please refine your search or select on map.`
      );
      return;
    }
    const newDestCoords = {
      lat: destCoordsResult.lat,
      lng: destCoordsResult.lng,
      name: destCoordsResult.name || destinationQuery,
    };
    setDestinationCoords({ lat: newDestCoords.lat, lng: newDestCoords.lng });
    setDestinationQuery(newDestCoords.name);

    fetchRoutes(newOriginCoords, newDestCoords);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInitialSearch();
    }
  };

  const handleMapSelection = (lat: number, lng: number) => {
    if (!selectionMode) return;

    const newName = `Map Selected (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    const newCoords = { lat: lat.toString(), lng: lng.toString() };

    if (selectionMode === 'origin') {
      setOriginQuery(newName);
      setOriginLocation({
        origLat: newCoords.lat,
        origLng: newCoords.lng,
        originName: newName,
      });
      setDestinationCoords(null);
    } else if (selectionMode === 'destination') {
      setDestinationQuery(newName);
      setDestinationCoords({ lat: newCoords.lat, lng: newCoords.lng });

      const currentOriginCoords = {
        lat: originLocation.origLat,
        lng: originLocation.origLng,
        name: originLocation.originName,
      };

      const mapSelectedDestCoords = {
        lat: newCoords.lat,
        lng: newCoords.lng,
        name: newName,
      };

      fetchRoutes(currentOriginCoords, mapSelectedDestCoords);
    }

    setSelectionMode(null);
  };

  const destinationMarker = useMemo(() => {
    if (!destinationCoords) return undefined;
    return {
      lat: parseFloat(destinationCoords.lat),
      lng: parseFloat(destinationCoords.lng),
    };
  }, [destinationCoords]);

  return (
    <div className="flex min-h-screen bg-white text-gray-800">
      <Sidebar active="Transport" />

      <main className="flex-1 p-8">
        <div className="mb-6 flex items-center space-x-4">
          {['Transport', 'Traffics', 'Nearby', 'Support Map'].map((tab, i) => (
            <button
              key={i}
              className={`rounded-xl border px-6 py-2 text-sm font-medium ${
                i === 0
                  ? 'border-sky-500 bg-sky-500 text-white'
                  : 'border-gray-200 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mb-6 flex flex-col space-y-3">
          {selectionMode && (
            <div className="relative rounded border border-yellow-400 bg-yellow-100 px-4 py-2 text-sm text-yellow-700">
              Please click on the map to set your **
              {selectionMode.toUpperCase()}** location.
            </div>
          )}

          <div className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="Search for your Origin (e.g., Central World)"
              value={originQuery}
              onChange={(e) => setOriginQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-1/2 rounded-xl border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
              className={`rounded-xl px-4 py-2 text-sm font-medium ${selectionMode === 'origin' ? 'bg-red-500 text-white' : 'bg-green-500 text-white hover:bg-green-600'}`}
              onClick={() =>
                setSelectionMode(selectionMode === 'origin' ? null : 'origin')
              }
              disabled={loading}
            >
              {selectionMode === 'origin'
                ? 'Cancel Selection'
                : 'Select Origin on Map'}
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="Search for your destination (e.g., KMUTT)"
              value={destinationQuery}
              onChange={(e) => setDestinationQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-1/2 rounded-xl border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-400"
            />
            <button
              onClick={() =>
                setSelectionMode(
                  selectionMode === 'destination' ? null : 'destination'
                )
              }
              disabled={loading}
              className={`rounded-xl px-4 py-2 text-sm font-medium ${selectionMode === 'destination' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white hover:bg-yellow-600'}`}
            >
              {selectionMode === 'destination'
                ? 'Cancel Selection'
                : 'Select Destination on Map'}
            </button>
            <button
              onClick={handleInitialSearch}
              disabled={
                loading ||
                originQuery.length === 0 ||
                destinationQuery.length === 0
              }
              className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white disabled:bg-gray-400"
            >
              {loading ? 'Searching...' : 'Search Route'}
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="relative flex-1 overflow-hidden rounded-xl border border-gray-200">
            <MapView
              onMapClick={selectionMode ? handleMapSelection : undefined}
              origin={{
                lat: parseFloat(originLocation.origLat),
                lng: parseFloat(originLocation.origLng),
              }}
              destination={destinationMarker}
            />
            <select className="absolute top-4 right-4 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm">
              <option>Bus Station</option>
              <option>BTS Station</option>
              <option>MRT Station</option>
            </select>
          </div>

          <div className="max-h-[500px] w-80 space-y-3 overflow-y-auto rounded-2xl bg-blue-700 p-4 text-white">
            {loading && <p className="p-4 text-center">Loading routes...</p>}
            {error && (
              <p className="p-4 text-center text-red-300">Error: {error}</p>
            )}

            {routes.length === 0 && !loading && !error && (
              <p className="p-4 text-center text-gray-300">
                Enter your destination or select a point on the map.
              </p>
            )}

            {/* 🟢 ส่วนนี้จะแสดงผลลัพธ์ที่ถูกจัดเรียงแล้ว */}
            {routes.map((route, index) => {
              const mainTransport = route.detailedSteps.find(
                (s) => s.travel_mode === 'TRANSIT'
              );
              const routeName =
                mainTransport?.line_name ||
                mainTransport?.vehicle_type ||
                'Walking Route';
              const fareText = route.fare?.text || 'Tap In/Out';
              const stopsList = route.detailedSteps.map(
                (step) =>
                  step.instruction +
                  (step.line_name ? ` (${step.line_name})` : '')
              );

              return (
                <BusInfo
                  key={index}
                  route={routeName}
                  from={route.start_address.split(',')[0]}
                  to={route.end_address.split(',')[0]}
                  duration={route.duration.text}
                  fare={fareText}
                  gpsAvailable={!!mainTransport}
                  stops={stopsList}
                />
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
