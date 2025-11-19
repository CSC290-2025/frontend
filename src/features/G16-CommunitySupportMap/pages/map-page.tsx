// src/pages/MapPage.tsx
import { useEffect, useRef, useState } from 'react';
import initMapAndMarkers from '../config/google-map';

// Raw marker format from backend
type ApiMarker = {
  id: number;
  description: string | null;
  // location can be GeoJSON, string or other shape from PostGIS
  location: any | null;
};

// Normalized marker format used by Google Maps
type MapMarker = {
  id: number;
  lat: number;
  lng: number;
  description: string | null;
};

// Area of map that covers the 4 districts
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

// Check if marker is inside any of the 4 districts
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

  // Fetch markers from backend and normalize location
  useEffect(() => {
    async function loadMarkers() {
      try {
        setLoading(true);

        const res = await fetch('http://localhost:3000/api/markers?limit=200');
        const json = await res.json();
        const data = json.data as ApiMarker[];

        const mapped: MapMarker[] = data
          .map((m) => {
            if (!m.location) return null;

            let lat: number | null = null;
            let lng: number | null = null;
            const loc = m.location as any;

            // Case 1 - GeoJSON { type: 'Point', coordinates: [lng, lat] }
            if (loc && Array.isArray(loc.coordinates)) {
              const [lngRaw, latRaw] = loc.coordinates;
              lng = Number(lngRaw);
              lat = Number(latRaw);
            }
            // Case 2 - WKT string e.g. "POINT(100.49 13.65)"
            else if (typeof loc === 'string') {
              const match = loc.match(/POINT\(([-0-9.]+)\s+([-0-9.]+)\)/i);
              if (match) {
                lng = parseFloat(match[1]);
                lat = parseFloat(match[2]);
              }
            }
            // Case 3 - Object with x/y properties e.g. { x: lng, y: lat }
            else if (
              typeof loc === 'object' &&
              loc !== null &&
              typeof loc.x === 'number' &&
              typeof loc.y === 'number'
            ) {
              lng = loc.x;
              lat = loc.y;
            }

            // If we still cannot get valid lat/lng, skip this marker
            if (
              lat === null ||
              lng === null ||
              Number.isNaN(lat) ||
              Number.isNaN(lng)
            ) {
              return null;
            }

            return {
              id: m.id,
              lat,
              lng,
              description: m.description,
            };
          })
          // Remove null entries
          .filter((m): m is MapMarker => m !== null);

        setMarkers(mapped);
      } finally {
        setLoading(false);
      }
    }

    loadMarkers();
  }, []);

  // Render Google Map whenever markers change
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
      // Lock map inside the bounding box
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
