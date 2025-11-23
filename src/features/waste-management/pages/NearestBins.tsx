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
  const [bins, setBins] = useState<Bin[]>([]);
  const [allBins, setAllBins] = useState<Bin[]>([]);

  const [selectedBinId, setSelectedBinId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTypeFilter, setActiveTypeFilter] = useState<BinFilter>('All');
  const mapRef = useRef<L.Map | null>(null);

  const [centerLocation, setCenterLocation] =
    useState<Coordinates>(userLocation);

  const [searchLocation, setSearchLocation] = useState<{
    lat: number;
    lng: number;
    name?: string;
  } | null>(null);

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

    loadAllBins();
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

  const nearestBin = bins.length > 0 ? bins[0] : null;

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
    setSearchLocation({ lat: coords.lat, lng: coords.lng, name: undefined });
  }

  function handleLocateUser() {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          const { latitude, longitude } = position.coords;
          const coords = { lat: latitude, lng: longitude };
          setUserLocation(coords);

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
    <div className="flex min-h-screen flex-col items-center bg-gray-50 p-4">
      <div className="mb-6 flex flex-col items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          City Hub Bin Locations
        </h1>
        <button
          onClick={handleFindNearestBin}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-blue-700 disabled:bg-blue-400"
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span>
              Locating...
            </>
          ) : (
            <>
              <span>📍</span>
              Find Nearest Bin for My Location
            </>
          )}
        </button>
      </div>
      <p className="mb-8 max-w-3xl text-center text-gray-500">
        Explore recycling and disposal sites across the city. Use the filters to
        view different bin types, select a location from the list, or click
        anywhere on the map to update your position and refresh the nearest
        bins.
      </p>

      <div className="grid w-full max-w-6xl gap-6 md:grid-cols-[2fr,1fr]">
        {/* Map Wrapper */}
        <div
          className="relative h-[520px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
          style={mapWrapperStyle}
        >
          {nearestBin && <NearestBinCard bin={nearestBin} />}

          <MapContainer
            center={[centerLocation.lat, centerLocation.lng]}
            zoom={13}
            className="z-0 h-full w-full"
            scrollWheelZoom
            ref={mapRef}
            style={mapContainerStyle}
          >
            <RecenterMap lat={centerLocation.lat} lng={centerLocation.lng} />
            <MapClickHandler onSelect={handleMapClick} />

            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={[userLocation.lat, userLocation.lng]}>
              <Popup className="font-sans">You are here</Popup>
            </Marker>

            {searchLocation && (
              <Marker position={[searchLocation.lat, searchLocation.lng]}>
                <Popup className="font-sans">
                  {searchLocation.name ?? 'Searched location'}
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
          </MapContainer>
        </div>
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
  );
}
