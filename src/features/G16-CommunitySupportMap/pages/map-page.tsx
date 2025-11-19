// src/pages/MapPage.tsx
import { useEffect, useRef, useState } from 'react';
import initMapAndMarkers from '../config/google-map';

type ApiMarker = {
  id: number;
  description: string | null;
  location: {
    type: string;
    coordinates: [number, number]; // [lng, lat]
  } | null;
};

type MapMarker = {
  id: number;
  lat: number;
  lng: number;
  description: string | null;
};

// area of map with 4 district
const MAP_BOUNDS = {
  north: 13.745,
  south: 13.58,
  east: 100.54,
  west: 100.43,
};

const ZONES = {
  ThungKhru: { north: 13.67, south: 13.58, east: 100.53, west: 100.44 },
  RatBurana: { north: 13.715, south: 13.65, east: 100.54, west: 100.47 },
  Thonburi: { north: 13.745, south: 13.68, east: 100.505, west: 100.44 },
  ChomThong: { north: 13.72, south: 13.655, east: 100.5, west: 100.43 },
} as const;

// check marker is inside 4 district
function isInAnyZone(m: MapMarker): boolean {
  return Object.values(ZONES).some(
    (z) =>
      m.lat <= z.north && m.lat >= z.south && m.lng <= z.east && m.lng >= z.west
  );
}

const MapPage = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [loading, setLoading] = useState(false);

  // fetch marker from backend
  useEffect(() => {
    async function loadMarkers() {
      try {
        setLoading(true);

        const res = await fetch('http://localhost:3000/api/markers?limit=200');
        const json = await res.json();
        const data = json.data as ApiMarker[];

        const mapped = data
          .filter((m) => m.location)
          .map((m) => {
            const [lng, lat] = m.location!.coordinates;
            return { id: m.id, lat, lng, description: m.description };
          });

        setMarkers(mapped);
      } finally {
        setLoading(false);
      }
    }

    loadMarkers();
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Only markers inside the 4 target districts
    const filtered = markers.filter(isInAnyZone);

    // Center of the whole area
    const center = {
      lat: (MAP_BOUNDS.north + MAP_BOUNDS.south) / 2,
      lng: (MAP_BOUNDS.east + MAP_BOUNDS.west) / 2,
    };

    const mapOptions: google.maps.MapOptions = {
      center,
      zoom: 13,
      mapId: 'map1',

      // Lock map
      restriction: {
        latLngBounds: MAP_BOUNDS,
        strictBounds: true,
      },
    };

    const markerOptions = filtered.map((m) => ({
      position: { lat: m.lat, lng: m.lng },
      title: m.description ?? `Marker #${m.id}`,
    }));

    initMapAndMarkers({
      mapEl: mapRef.current,
      mapOptions,
      markerOptions,
    });
  }, [markers]);

  return (
    <div className="w-full space-y-4">
      {loading && <p className="text-sm text-gray-500">Loading markers...</p>}

      <div
        ref={mapRef}
        id="google_map"
        className="overflow-hidden rounded-xl border border-neutral-300 shadow-sm"
        style={{ height: 'calc(95vh - 180px)' }}
      />
    </div>
  );
};

export default MapPage;