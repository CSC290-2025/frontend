// frontend/src/components/BinLocator.tsx
import { useState, useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type {
  Coordinates,
  Bin,
  BinFilter,
} from '@/features/waste-management/types';
import {
  fetchNearbyBins,
  fetchBins,
} from '@/features/waste-management/api/bin.api';
import {
  RecenterMap,
  MapClickHandler,
} from '@/features/waste-management/components';
import { NearestBinCard } from '@/features/waste-management/components';
import { LocationsSideBar } from '@/features/waste-management/components';
import { BIN_TYPE_COLORS } from '@/constant';

const icon = new URL(
  'leaflet/dist/images/marker-icon.png',
  import.meta.url
).toString();
const iconShadow = new URL(
  'leaflet/dist/images/marker-shadow.png',
  import.meta.url
).toString();

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const BANGKOK_COORDS = { lat: 13.7563, lng: 100.5018 };

export function BinLocator() {
  const [userLocation, setUserLocation] = useState<Coordinates>(BANGKOK_COORDS);
  const [userAddress, setUserAddress] = useState<string>('Your Location');
  const [bins, setBins] = useState<Bin[]>([]);
  const [allBins, setAllBins] = useState<Bin[]>([]);

  const [selectedBinId, setSelectedBinId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTypeFilter, setActiveTypeFilter] = useState<BinFilter>('All');
  const mapRef = useRef<L.Map | null>(null);
  const nearestBinMarkerRef = useRef<L.Marker | null>(null);

  const [centerLocation, setCenterLocation] =
    useState<Coordinates>(userLocation);

  const [searchLocation, setSearchLocation] = useState<{
    lat: number;
    lng: number;
    name?: string;
  } | null>(null);
  const [searchLocationNearestBin, setSearchLocationNearestBin] =
    useState<Bin | null>(null);

  // Function to fetch address from coordinates
  const fetchAddressFromCoordinates = async (
    lat: number,
    lng: number
  ): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'User-Agent': 'WasteManagementApp',
          },
        }
      );
      const data = await response.json();
      return data.display_name || 'Location';
    } catch (error) {
      console.error('Error fetching address:', error);
      return 'Location';
    }
  };

  const handleLocationSearch = (coords: Coordinates, address?: string) => {
    setCenterLocation(coords);
    setSelectedBinId(null);
    setSearchLocation({ lat: coords.lat, lng: coords.lng, name: address });
  };

  useEffect(() => {
    async function loadAllBins() {
      try {
        setLoading(true);
        const data = await fetchBins();
        console.log('Fetched all bins:', data);
        setAllBins(data);
      } catch (error) {
        console.error('Failed to fetch all bins:', error);
        alert('Failed to load bins. Please check the console for details.');
      } finally {
        setLoading(false);
      }
    }

    // Fetch initial address for Bangkok default location
    const fetchInitialAddress = async () => {
      const address = await fetchAddressFromCoordinates(
        BANGKOK_COORDS.lat,
        BANGKOK_COORDS.lng
      );
      setUserAddress(address);
    };

    loadAllBins();
    fetchInitialAddress();
  }, []);

  useEffect(() => {
    async function loadNearbyBins() {
      try {
        const data = await fetchNearbyBins(
          centerLocation.lat,
          centerLocation.lng,
          activeTypeFilter === 'All' ? 'All' : activeTypeFilter,
          ''
        );
        setBins(data);

        if (data.length > 0 && selectedBinId === null) {
          setSelectedBinId(data[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch nearby bins:', error);
      }
    }

    loadNearbyBins();
  }, [centerLocation, activeTypeFilter]);

  const nearestBin = (() => {
    if (!bins.length || !bins[0].distance) return null;
    const distanceValue = parseFloat(bins[0].distance.toString().split(' ')[0]);
    return distanceValue <= 1 ? bins[0] : null;
  })();

  function handleSelectBin(binId: number) {
    const target = bins.find((bin) => bin.id === binId);
    if (!target) return;

    setSelectedBinId(binId);
    if (mapRef.current) {
      mapRef.current.flyTo([target.lat, target.lng], 15, {
        animate: true,
        duration: 1,
      });
    }
  }

  function handleMapClick(coords: Coordinates) {
    setCenterLocation(coords);
    setSelectedBinId(null);

    // Fetch address for the marked location
    fetchAddressFromCoordinates(coords.lat, coords.lng).then((address) => {
      setSearchLocation({ lat: coords.lat, lng: coords.lng, name: address });
    });

    // Fetch nearest bin for the marked location
    fetchNearbyBins(coords.lat, coords.lng, 'All', '').then((nearbyBins) => {
      if (nearbyBins.length > 0) {
        setSearchLocationNearestBin(nearbyBins[0]);
      }
    });
  }

  function handleLocateUser() {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position: GeolocationPosition) => {
          const { latitude, longitude } = position.coords;
          const coords = { lat: latitude, lng: longitude };
          setUserLocation(coords);

          // Fetch address for user location
          const address = await fetchAddressFromCoordinates(
            latitude,
            longitude
          );
          setUserAddress(address);

          setCenterLocation(coords);
          setSearchLocation(null);
          setSelectedBinId(null);
          setLoading(false);
        },
        (error: GeolocationPositionError) => {
          console.error(error);
          alert('Could not access location.');
          setLoading(false);
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
      setLoading(false);
    }
  }

  function handleFindNearestBin() {
    handleLocateUser();
  }

  // Auto-open nearest bin popup when it changes
  useEffect(() => {
    if (nearestBin && nearestBinMarkerRef.current) {
      // Try opening popup with multiple attempts at different intervals
      const openPopup = () => {
        try {
          const popup = nearestBinMarkerRef.current?.getPopup?.();
          if (popup && nearestBinMarkerRef.current?.openPopup) {
            nearestBinMarkerRef.current.openPopup();
            console.log('Nearest bin popup opened successfully');
          }
        } catch (e) {
          console.log('Error opening popup:', e);
        }
      };

      // Multiple attempts to ensure popup opens
      const timers = [
        setTimeout(openPopup, 300),
        setTimeout(openPopup, 700),
        setTimeout(openPopup, 1200),
      ];

      return () => timers.forEach((timer) => clearTimeout(timer));
    }
  }, [nearestBin?.id]);

  const mapWrapperStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    minHeight: 520,
    borderRadius: 24,
    overflow: 'hidden',
    border: '1px solid #e5e7eb',
    backgroundColor: '#fff',
    boxShadow: '0 15px 45px rgba(15, 23, 42, 0.12)',
  };

  const mapContainerStyle: CSSProperties = {
    height: '100%',
    minHeight: 520,
    width: '100%',
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="mb-8 flex flex-col items-center gap-2">
        <h1 className="text-3xl font-bold text-gray-800">
          City Hub Bin Locations
        </h1>
        <p className="text-lg text-gray-500">
          Find waste disposal locations near you
        </p>
      </div>

      <div className="grid h-screen w-full max-w-7xl grid-cols-1 gap-6 lg:h-auto lg:grid-cols-2">
        {/* Map Column */}
        <div
          className="relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-2xl"
          style={{ ...mapWrapperStyle, minHeight: 600 }}
        >
          {nearestBin && <NearestBinCard bin={nearestBin} />}

          <MapContainer
            center={[centerLocation.lat, centerLocation.lng]}
            zoom={13}
            className="z-0 h-full w-full"
            scrollWheelZoom
            ref={mapRef}
            style={{ ...mapContainerStyle, minHeight: 600 }}
          >
            <RecenterMap lat={centerLocation.lat} lng={centerLocation.lng} />
            <MapClickHandler onSelect={handleMapClick} />

            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={[userLocation.lat, userLocation.lng]}>
              <Popup className="font-sans">
                <div className="w-40 space-y-0 rounded p-1">
                  <p className="text-xs font-semibold text-blue-700">
                    You are here
                  </p>
                  <p className="text-xs leading-tight font-medium break-words text-gray-800">
                    {userAddress}
                  </p>
                </div>
              </Popup>
            </Marker>

            {searchLocation && (
              <Marker position={[searchLocation.lat, searchLocation.lng]}>
                <Popup className="font-sans">
                  <div className="w-48 space-y-2 rounded p-2">
                    <div>
                      <p className="text-xs font-semibold text-green-700">
                        Selected point
                      </p>
                      <p className="text-xs leading-tight font-medium break-words text-gray-800">
                        {searchLocation.name ?? 'Location'}
                      </p>
                    </div>
                    {searchLocationNearestBin && (
                      <div className="border-t border-green-100 pt-2">
                        <p className="mb-1 text-xs font-semibold text-green-700">
                          Nearest Bin
                        </p>
                        <p className="text-xs font-medium text-gray-800">
                          {searchLocationNearestBin.name}
                        </p>
                        <p
                          className={`text-xs font-medium ${searchLocationNearestBin.color}`}
                        >
                          {searchLocationNearestBin.type}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-blue-600">
                          📍 {searchLocationNearestBin.distance}
                        </p>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            )}

            {allBins.map((bin) => {
              const isSelected = selectedBinId === bin.id;
              const isNearby = bins.some((b) => b.id === bin.id);

              const getColorForType = (type: string) => {
                switch (type) {
                  case 'Recyclable':
                    return BIN_TYPE_COLORS.RECYCLABLE;
                  case 'General Waste':
                    return BIN_TYPE_COLORS.GENERAL;
                  case 'Hazardous':
                    return BIN_TYPE_COLORS.HAZARDOUS;
                  default:
                    return '#6b7280';
                }
              };

              const createBinDivIcon = (color: string) =>
                L.divIcon({
                  className: 'custom-bin-icon',
                  html: `
                    <div style="display:flex;align-items:center;justify-content:center;">
                      <svg width="28" height="36" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="6" y="9" width="12" height="16" rx="2" fill="${color}" stroke="#ffffff" stroke-width="1" />
                        <rect x="4" y="5" width="16" height="4" rx="1" fill="#374151" />
                        <rect x="9" y="2" width="6" height="4" rx="1" fill="#374151" />
                        <circle cx="12" cy="16" r="3" fill="#ffffff" />
                      </svg>
                    </div>
                  `.trim(),
                  iconSize: [28, 36],
                  iconAnchor: [14, 36],
                });

              const color = getColorForType(bin.type);

              return (
                <Marker
                  key={bin.id}
                  position={[bin.lat, bin.lng]}
                  icon={createBinDivIcon(color)}
                  opacity={isSelected ? 1 : isNearby ? 0.95 : 0.6}
                  eventHandlers={{
                    click: () => handleSelectBin(bin.id),
                  }}
                >
                  <Popup>
                    <div className="space-y-1 text-center">
                      <h3 className="text-sm font-bold">{bin.name}</h3>
                      <span className="text-xs text-gray-500">{bin.type}</span>
                      {isNearby && bin.distance && (
                        <p className="text-xs font-semibold text-blue-600">
                          Distance: {bin.distance}
                        </p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {nearestBin && (
              <Marker
                ref={nearestBinMarkerRef}
                position={[nearestBin.lat, nearestBin.lng]}
                eventHandlers={{
                  popupopen: () => console.log('Nearest bin popup opened'),
                }}
              >
                <Popup className="font-sans" closeButton={false} autoPan={true}>
                  <div className="w-48 space-y-1.5 rounded p-2">
                    <p className="mb-1 text-xs font-bold text-purple-700">
                      📍 NEAREST BIN
                    </p>
                    <div>
                      <p className="text-xs font-bold text-gray-800">
                        {nearestBin.name}
                      </p>
                      <p className={`text-xs font-medium ${nearestBin.color}`}>
                        {nearestBin.type}
                      </p>
                    </div>
                    <div className="rounded bg-purple-50 px-2 py-1">
                      <p className="text-xs font-semibold text-purple-700">
                        Distance: {nearestBin.distance}
                      </p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        {/* Filter Card Column */}
        <div className="h-full">
          <LocationsSideBar
            bins={bins}
            selectedBinId={selectedBinId}
            activeTypeFilter={activeTypeFilter}
            loading={loading}
            onFilterChange={setActiveTypeFilter}
            onBinSelect={handleSelectBin}
            onLocateUser={handleLocateUser}
            onLocationSearch={handleLocationSearch}
          />
        </div>
      </div>
    </div>
  );
}
