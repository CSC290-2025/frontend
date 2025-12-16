// src/pages/MapPage.tsx
import { useEffect, useRef, useState } from 'react';
import initMapAndMarkers from '../config/google-map';
import type { SuccessMarker, MapMarker } from '../interfaces/api';
import { MarkerSidePanel } from '../components/rightSide';
import { apiClient } from '@/lib/apiClient';

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

  // map id to marker_type_icon (string)
  const [markerTypeIconById, setMarkerTypeIconById] = useState<
    Record<number, string>
  >({});

  async function handleDeleteMarker(id: number) {
    try {
      await apiClient.delete(`/api/markers/${id}`);
      setMarkers((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  }

  // marker types (id to marker_type_icon)

  useEffect(() => {
    async function loadMarkerTypes() {
      try {
        const res = await apiClient.get('/api/marker-types', {
          params: { limit: 200 },
        });

        // response: res.data.data.markerTypes
        const types = res.data.data.markerTypes as {
          id: number;
          marker_type_icon: string;
        }[];

        setMarkerTypeIconById(
          Object.fromEntries(types.map((t) => [t.id, t.marker_type_icon]))
        );
      } catch (err) {
        console.error('Load marker types failed:', err);
      }
    }

    loadMarkerTypes();
  }, []);

  // Fetch markers from backend and normalize location
  useEffect(() => {
    async function loadMarkers() {
      try {
        setLoading(true);
        const res = await apiClient.get('/api/markers', {
          params: { limit: 200 },
        });

        const data = res.data.data.markers as SuccessMarker[];

        const mapped: MapMarker[] = data
          .filter((m) => m.location)
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
              marker_type_id: m.marker_type_id,
            };
          })
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
      restriction: {
        latLngBounds: MAP_BOUNDS,
        strictBounds: true,
      },
    };

    // const markerOptions = filtered.map((m) => ({
    //   position: { lat: m.lat, lng: m.lng },
    //   title: m.description ?? `Marker #${m.id}`,

    // markerTypeId: m.marker_type_id ?? 1,

    //   markerTypeIconKey: markerTypeIconById[m.marker_type_id ?? 1],
    // }));

    const markerOptions = filtered.map((m) => ({
      position: { lat: m.lat, lng: m.lng },
      title: m.description ?? `Marker #${m.id}`,

      // send id to be fallback
      markerTypeId: m.marker_type_id ?? 1,

      // fix send key from DB (if it have)
      markerTypeIconKey: markerTypeIconById[m.marker_type_id ?? 1],
    }));

    initMapAndMarkers({
      mapEl: mapRef.current,
      mapOptions,
      markerOptions,
    });
    // }, [markers]);
  }, [markers, markerTypeIconById]);

  const panelMarkers = markers.filter(isInAnyZone);

  return (
    <div className="w-full space-y-4">
      {loading && <p className="text-sm text-gray-500">Loading markers...</p>}

      <div className="flex gap-4">
        <div className="flex-1">
          <div
            ref={mapRef}
            id="google_map"
            className="overflow-hidden rounded-xl border border-neutral-300 shadow-sm"
            style={{ height: 'calc(95vh - 180px)' }}
          />
        </div>

        <MarkerSidePanel markers={panelMarkers} onDelete={handleDeleteMarker} />
      </div>
    </div>
  );
};

export default MapPage;
