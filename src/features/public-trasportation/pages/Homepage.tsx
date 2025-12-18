import React, { useState, useEffect, useMemo } from 'react';
import BusInfo from '../components/BusInfo';
import MapView from '../components/MapView';
import axios from 'axios';
import { getBaseAPIURL } from '@/lib/apiClient.ts';
import Layout from '@/components/main/Layout';

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
  overview_polyline: { points: string };
}

interface Coords {
  lat: string;
  lng: string;
  name?: string;
}

interface APITapTransaction {
  id: number;
  type: 'IN' | 'OUT';
  locationName: string;
  timestamp: string;
  chargedAmount?: number;
}

const API_BASE_URL = getBaseAPIURL + '/api/routes/all';
const TRANSACTION_API_URL = getBaseAPIURL + '/api/transactions/tap';
const METRO_CARD_API_URL = getBaseAPIURL + '/metro-cards/me';
const HISTORY_API_URL = getBaseAPIURL + '/api/transactions/history';

const geocodeAddress = async (query: string): Promise<Coords | null> => {
  if (!query) return null;

  const mapSelectionMatch = query.match(/\(([^,]+),\s*([^)]+)\)/);
  if (mapSelectionMatch) {
    const lat = mapSelectionMatch[1].trim();
    const lng = mapSelectionMatch[2].trim();
    if (!isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
      try {
        const REVERSE_GEOCODE_URL = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`;
        const response = await axios.get(REVERSE_GEOCODE_URL);
        const data = response.data;

        if (data.status === 'OK' && data.results.length > 0) {
          const name =
            data.results[0].formatted_address ||
            `Map Selected (${lat}, ${lng})`;
          return { lat, lng, name };
        }
      } catch (error) {
        console.error('Reverse Geocoding Error:', error);
      }

      return Promise.resolve({
        lat,
        lng,
        name: `Lat: ${parseFloat(lat).toFixed(4)}, Lng: ${parseFloat(lng).toFixed(4)}`,
      });
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

  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);

  const [tappedInRouteIndex, setTappedInRouteIndex] = useState<number | null>(
    null
  );

  const [isTapProcessing, setIsTapProcessing] = useState(false);

  const [activeCardId, setActiveCardId] = useState<number | null>(null);
  const [cardError, setCardError] = useState<string | null>(null);

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
    name?: string;
  } | null>(null);
  const [selectionMode, setSelectionMode] = useState<
    'origin' | 'destination' | null
  >(null);

  const [activeTab, setActiveTab] = useState<
    'Transportation' | 'Recent Routes' | 'Tap History'
  >('Transportation');

  const [recentRoutes, setRecentRoutes] = useState<
    { origin: string; destination: string; id: number }[]
  >([
    {
      id: 5,
      origin: 'KMUTT',
      destination: 'Siam Paragon',
    },
    {
      id: 4,
      origin: 'BTS Phaya Thai',
      destination: 'Chatuchak Market',
    },
    {
      id: 3,
      origin: "King Mongkut's University of Technology Thonburi",
      destination: 'Central World (Ratchaprasong)',
    },
    {
      id: 2,
      origin: 'Siam Paragon',
      destination: 'Chatuchak Market',
    },
    {
      id: 1,
      origin: 'Ekkamai Bus Terminal',
      destination: 'Thonglor Pier',
    },
  ]);

  const [tapHistory, setTapHistory] = useState<
    { type: 'IN' | 'OUT'; location: string; time: string; charge?: number }[]
  >([]);

  const [tapHistoryLoading, setTapHistoryLoading] = useState(false);
  const [tapHistoryError, setTapHistoryError] = useState<string | null>(null);
  const [tapHistoryStatus, setTapHistoryStatus] = useState<string | null>(null);

  // ------------------------------------
  // Fetch Card Data
  // ------------------------------------
  useEffect(() => {
    const fetchActiveCard = async () => {
      try {
        setCardError(null);
        const response = await axios.get(METRO_CARD_API_URL, {
          withCredentials: true,
        });
        const responseData = response.data.data;

        if (
          responseData &&
          responseData.metroCards &&
          responseData.metroCards.length > 0
        ) {
          const card = responseData.metroCards[0];

          setActiveCardId(card.id);
        } else if (response.data.success && response.data.id) {
          setActiveCardId(response.data.id);
        } else {
          setCardError('No active Metro Card found for this user.');
        }
      } catch (err: any) {
        const status = err.response?.status;
        const msg =
          status === 401
            ? 'Unauthorized. Please log in (Failed to fetch Card data with Cookie).'
            : 'Failed to fetch Metro Card data. Check Finance Service.';
        setCardError(msg);
        console.error('Metro Card Fetch Error:', err);
      }
    };
    fetchActiveCard();
  }, []);

  // ------------------------------------
  // Tap History Fetching
  // ------------------------------------
  const fetchTapHistory = async (cardId: number) => {
    if (isNaN(cardId) || cardId === null || cardId === 0) {
      setTapHistoryStatus(
        'Cannot fetch history: Active Card ID is invalid or not yet loaded.'
      );
      setTapHistoryError(null);
      return;
    }

    setTapHistoryLoading(true);
    setTapHistoryError(null);
    setTapHistoryStatus(null);
    setTapHistory([]);

    try {
      const response = await axios.get(HISTORY_API_URL, {
        params: { cardId: cardId },
        withCredentials: true,
      });

      let historyDataContainer = response.data.data;

      if (historyDataContainer && historyDataContainer.data) {
        historyDataContainer = historyDataContainer.data;
      }

      if (response.data.success) {
        if (
          Array.isArray(historyDataContainer) &&
          historyDataContainer.length > 0
        ) {
          const historyData: APITapTransaction[] = historyDataContainer;

          const formattedHistory = historyData.reduce(
            (acc, data) => {
              try {
                const date = new Date(data.timestamp);

                if (isNaN(date.getTime())) {
                  return acc;
                }

                const locationName =
                  data.locationName || 'Location Data Missing';
                let displayLocation = locationName.split(',')[0].trim();

                if (displayLocation.length > 30) {
                  const words = displayLocation.split(/\s+/);
                  displayLocation = words.slice(0, 3).join(' ');
                  if (words.length > 3) {
                    displayLocation += '...';
                  }
                }

                acc.push({
                  type: data.type,
                  location: displayLocation,
                  time: date.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  }),
                  charge: data.chargedAmount,
                });
                return acc;
              } catch (e) {
                return acc;
              }
            },
            [] as {
              type: 'IN' | 'OUT';
              location: string;
              time: string;
              charge?: number;
            }[]
          );

          if (formattedHistory.length === 0) {
            setTapHistoryStatus(
              'All fetched transactions appear corrupted and cannot be displayed.'
            );
          } else {
            setTapHistory(formattedHistory.slice(0, 5));
            setTapHistoryStatus(null);
          }
          setTapHistoryError(null);
        } else {
          setTapHistoryStatus('No recent tap history found.');
        }
      } else {
        setTapHistoryError(response.data.message || 'API reported failure.');
      }
    } catch (err: any) {
      const status = err.response?.status;
      let msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch tap history.';

      if (status === 401) {
        msg = 'Unauthorized. Please check your session and card status.';
      }

      setTapHistoryError('History Error: ' + msg);
      setTapHistoryStatus(null);
      console.error('Tap History Fetch Error:', err);
    } finally {
      setTapHistoryLoading(false);
    }
  };

  // ------------------------------------
  // useEffect: Trigger History Fetch เมื่อได้ Card ID
  // ------------------------------------
  useEffect(() => {
    if (activeCardId !== null && !cardError) {
      fetchTapHistory(activeCardId);
    } else if (cardError) {
      setTapHistoryError(cardError);
    }
  }, [activeCardId, cardError]);

  // ------------------------------------
  // Route Fetching
  // ------------------------------------
  const fetchRoutes = async (
    origCoords: { lat: string; lng: string; name: string },
    destCoords: { lat: string; lng: string; name: string }
  ) => {
    setLoading(true);
    setError(null);
    setRoutes([]);
    setTappedInRouteIndex(null);

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
        const sortedRoutes: RouteSummary[] = response.data.allRoutes.sort(
          (a: RouteSummary, b: RouteSummary) =>
            a.duration.value - b.duration.value
        );

        setRoutes(sortedRoutes);
        setSelectedRouteIndex(0);
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

  // ------------------------------------
  // Search Logic (ถูกใช้เมื่อกดปุ่ม Search)
  // ------------------------------------
  const handleInitialSearch = async () => {
    if (!originQuery || !destinationQuery) {
      setError('Please enter both Origin and Destination.');
      return;
    }

    const originalOriginQuery = originQuery;
    const originalDestinationQuery = destinationQuery;

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
      name: originalOriginQuery,
    };
    setOriginLocation({
      origLat: newOriginCoords.lat,
      origLng: newOriginCoords.lng,
      originName: originCoordsResult.name || originalOriginQuery,
    });
    setOriginQuery(originCoordsResult.name || originalOriginQuery);

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
      name: originalDestinationQuery,
    };
    setDestinationCoords({ lat: newDestCoords.lat, lng: newDestCoords.lng });
    setDestinationQuery(destCoordsResult.name || originalDestinationQuery);

    setRecentRoutes((prev) => {
      const newRoute = {
        id: Date.now(),
        origin: originalOriginQuery,
        destination: originalDestinationQuery,
      };
      return [newRoute, ...prev].slice(0, 5);
    });

    fetchRoutes(
      { ...newOriginCoords, name: originalOriginQuery },
      { ...newDestCoords, name: originalDestinationQuery }
    );
  };

  // ------------------------------------
  // Search Logic (ถูกใช้เมื่อคลิก Recent Route)
  // ------------------------------------
  const handleRecentRouteClick = async (route: {
    origin: string;
    destination: string;
    id: number;
  }) => {
    setOriginQuery(route.origin);
    setDestinationQuery(route.destination);

    const originCoordsResult = await geocodeAddress(route.origin);
    const destCoordsResult = await geocodeAddress(route.destination);

    if (!originCoordsResult || !destCoordsResult) {
      setError('Failed to re-fetch coordinates for this recent route.');
      setActiveTab('Transportation');
      return;
    }

    const newOriginCoords = {
      lat: originCoordsResult.lat,
      lng: originCoordsResult.lng,
      name: route.origin,
    };
    setOriginLocation({
      origLat: newOriginCoords.lat,
      origLng: newOriginCoords.lng,
      originName: originCoordsResult.name || route.origin,
    });

    const newDestCoords = {
      lat: destCoordsResult.lat,
      lng: destCoordsResult.lng,
      name: route.destination,
    };
    setDestinationCoords({ lat: newDestCoords.lat, lng: newDestCoords.lng });

    fetchRoutes(newOriginCoords, newDestCoords);

    setActiveTab('Transportation');
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInitialSearch();
    }
  };

  const handleMapSelection = async (lat: number, lng: number) => {
    if (!selectionMode) return;

    const newCoordsResult = await geocodeAddress(`(${lat}, ${lng})`);

    const newName =
      newCoordsResult?.name || `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
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
      setDestinationCoords({
        lat: newCoords.lat,
        lng: newCoords.lng,
        name: newName,
      });

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

  const selectedRoute = routes[selectedRouteIndex];

  // ------------------------------------
  // Tap Transaction Logic
  // ------------------------------------
  const handleTapTransaction = async (
    routeIndex: number,
    isTappingIn: boolean
  ): Promise<{ success: boolean; message: string }> => {
    if (activeCardId === null) {
      return {
        success: false,
        message: cardError || 'No valid Metro Card available. Cannot proceed.',
      };
    }

    if (isTapProcessing) {
      return {
        success: false,
        message: 'Another transaction is already processing. Please wait.',
      };
    }

    if (
      isTappingIn &&
      tappedInRouteIndex !== null &&
      tappedInRouteIndex !== routeIndex
    ) {
      return {
        success: false,
        message: 'Please TAP OUT from your current trip first.',
      };
    }

    const routeToTap = routes[routeIndex];
    if (!routeToTap) {
      return { success: false, message: 'Invalid route selected.' };
    }

    const transitStep = routeToTap.detailedSteps.find(
      (s) => s.travel_mode === 'TRANSIT'
    );
    const vehicleType = transitStep?.vehicle_type || 'AC_BUS';

    let locationData: { lat: string; lng: string; name?: string } = {
      lat: '',
      lng: '',
    };

    if (isTappingIn) {
      locationData = {
        lat: originLocation.origLat,
        lng: originLocation.origLng,
        name: originLocation.originName,
      };
    } else {
      if (!destinationCoords)
        return {
          success: false,
          message: 'Destination location not set for Tap Out.',
        };
      locationData = destinationCoords;
    }
    setIsTapProcessing(true);
    try {
      const response = await axios.post(
        TRANSACTION_API_URL,
        {
          cardId: activeCardId,
          location: locationData,
          vehicleType: vehicleType,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        if (isTappingIn) {
          setTappedInRouteIndex(routeIndex);
        } else {
          setTappedInRouteIndex(null);
        }

        const result = response.data.data;
        const chargedAmount = result.charged || result.maxFareReserved;

        if (activeCardId !== null) {
          fetchTapHistory(activeCardId);
        }

        return {
          success: true,
          message: `${isTappingIn ? 'TAP IN' : 'TAP OUT'} Successful. Charged/Reserved: ${chargedAmount} THB.`,
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Transaction failed (API error).',
        };
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Connection or Finance Service Error.';
      return { success: false, message: message };
    } finally {
      setIsTapProcessing(false);
    }
  };

  // ------------------------------------
  // JSX Render (รวม Tab Menu)
  // ------------------------------------
  return (
    <Layout>
      <div className="min-h-screen bg-white text-gray-800">
        <main className="p-8">
          <div className="mb-6 flex items-center space-x-6 border-b border-gray-200">
            {['Transportation', 'Recent Routes', 'Tap History'].map((tab) => (
              <button
                key={tab}
                onClick={() =>
                  setActiveTab(
                    tab as 'Transportation' | 'Recent Routes' | 'Tap History'
                  )
                }
                className={`px-1 py-2 text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab
                    ? 'border-b-2 border-sky-500 text-sky-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'Transportation' && (
            <>
              <div className="mb-6 flex flex-col space-y-3">
                {/* Alerts */}
                {cardError && (
                  <div className="relative rounded border border-red-400 bg-red-100 px-4 py-2 text-sm text-red-700">
                    🚨 **Card Error:** {cardError}
                  </div>
                )}
                {!activeCardId && !cardError && (
                  <div className="relative rounded border border-yellow-400 bg-yellow-100 px-4 py-2 text-sm text-yellow-700">
                    Loading active Metro Card...
                  </div>
                )}
                {selectionMode && (
                  <div className="relative rounded border border-yellow-400 bg-yellow-100 px-4 py-2 text-sm text-yellow-700">
                    Please click on the map to set your **
                    {selectionMode.toUpperCase()}** location.
                  </div>
                )}

                {/* ช่องค้นหา Origin */}
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
                      setSelectionMode(
                        selectionMode === 'origin' ? null : 'origin'
                      )
                    }
                    disabled={loading}
                  >
                    {selectionMode === 'origin'
                      ? 'Cancel Selection'
                      : 'Select Origin on Map'}
                  </button>
                </div>

                {/* ช่องค้นหา Destination และปุ่ม Search */}
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
                {/* MapView */}
                <div className="relative flex-1 overflow-hidden rounded-xl border border-gray-200">
                  <MapView
                    onMapClick={selectionMode ? handleMapSelection : undefined}
                    origin={{
                      lat: parseFloat(originLocation.origLat),
                      lng: parseFloat(originLocation.origLng),
                    }}
                    destination={destinationMarker}
                    routePolyline={selectedRoute?.overview_polyline?.points}
                  />
                  <select className="absolute top-4 right-4 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm">
                    <option>Bus Station</option>
                    <option>BTS Station</option>
                    <option>MRT Station</option>
                  </select>
                </div>

                {/* รายการ Routes (BusInfo List) */}
                <div className="max-h-[500px] w-80 space-y-3 overflow-y-auto rounded-2xl bg-blue-700 p-4 text-white">
                  {loading && (
                    <p className="p-4 text-center">Loading routes...</p>
                  )}
                  {error && (
                    <p className="p-4 text-center text-red-300">
                      Error: {error}
                    </p>
                  )}

                  {routes.length === 0 && !loading && !error && (
                    <p className="p-4 text-center text-gray-300">
                      Enter your destination or select a point on the map.
                    </p>
                  )}

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

                    const isRouteTappedIn = tappedInRouteIndex === index;

                    return (
                      <div
                        key={index}
                        onClick={() => setSelectedRouteIndex(index)}
                        className={`cursor-pointer rounded-lg p-1 ${index === selectedRouteIndex ? 'border-2 border-yellow-300' : ''}`}
                      >
                        <BusInfo
                          key={index}
                          route={routeName}
                          from={route.start_address.split(',')[0]}
                          to={route.end_address.split(',')[0]}
                          duration={route.duration.text}
                          fare={fareText}
                          gpsAvailable={!!mainTransport}
                          stops={stopsList}
                          isTappedIn={isRouteTappedIn}
                          isGlobalProcessing={isTapProcessing}
                          onTapConfirmed={(isTappingIn) =>
                            handleTapTransaction(index, isTappingIn)
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {activeTab === 'Recent Routes' && (
            <div className="space-y-4 pt-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Latest 5 Routes
              </h3>
              {recentRoutes.length > 0 ? (
                recentRoutes.map((route) => (
                  <div
                    key={route.id}
                    className="cursor-pointer rounded-xl border border-gray-200 p-4 shadow-sm transition-shadow hover:shadow-md"
                    onClick={() => handleRecentRouteClick(route)}
                  >
                    <p className="text-sm text-gray-500">From:</p>
                    <p className="text-lg font-medium text-gray-800">
                      {route.origin.trim()}
                    </p>
                    <p className="mt-2 mb-1 text-lg font-bold text-sky-600">
                      &darr;
                    </p>
                    <p className="text-sm text-gray-500">To:</p>
                    <p className="text-lg font-medium text-gray-800">
                      {route.destination.trim()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No recent searches.</p>
              )}
            </div>
          )}

          {activeTab === 'Tap History' && (
            <div className="space-y-4 pt-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Latest 5 Transactions
              </h3>

              {tapHistoryLoading && (
                <p className="text-gray-500">Loading tap history from API...</p>
              )}

              {tapHistoryError && !tapHistoryLoading && (
                <p className="text-red-500">🚨 API Error: {tapHistoryError}</p>
              )}

              {!tapHistoryLoading && tapHistory.length > 0
                ? tapHistory.map((tap, index) => (
                    <div
                      key={index}
                      className={`rounded-xl border p-4 shadow-sm ${
                        tap.type === 'IN'
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-green-300 bg-green-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-lg font-bold ${tap.type === 'IN' ? 'text-blue-700' : 'text-green-700'}`}
                        >
                          {tap.type === 'IN' ? 'TAP IN' : 'TAP OUT'}
                        </p>
                        <p className="text-sm text-gray-500">{tap.time}</p>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        Location:{' '}
                        <span className="font-medium">{tap.location}</span>
                      </p>
                      {tap.charge !== undefined && (
                        <p className="text-sm text-gray-600">
                          Charge:{' '}
                          <span className="font-bold text-red-600">
                            {tap.charge.toFixed(2)} THB
                          </span>
                        </p>
                      )}
                    </div>
                  ))
                : !tapHistoryLoading &&
                  !tapHistoryError &&
                  tapHistoryStatus && (
                    <p className="text-gray-500">{tapHistoryStatus}</p>
                  )}
              {!tapHistoryLoading &&
                !tapHistoryError &&
                tapHistory.length === 0 &&
                !tapHistoryStatus && (
                  <p className="text-gray-500">No tap history found.</p>
                )}
            </div>
          )}
        </main>
      </div>
    </Layout>
  );
}
