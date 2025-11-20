// src/pages/MapPage.tsx
import { useEffect, useRef, useState } from 'react';
import initMapAndMarkers from '../config/google-map';
import type { SuccessMarker, MapMarker } from '../interfaces/api';
import { Trash2 } from 'lucide-react';

// const parser = new DOMParser();
// // A marker with a custom inline SVG.
// const pinSvgString =
//   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bus-front-icon lucide-bus-front"><path d="M4 6 2 7"/><path d="M10 6h4"/><path d="m22 7-2-1"/><rect width="16" height="16" x="4" y="3" rx="2"/><path d="M4 11h16"/><path d="M8 15h.01"/><path d="M16 15h.01"/><path d="M6 19v2"/><path d="M18 21v-2"/></svg>

// const pinSvg = parser.parseFromString(
//   pinSvgString,
//   'image/svg+xml'
// ).documentElement;
// const pinSvgMarker = new AdvancedMarkerElement({
//   position: { lat: 37.42475, lng: -122.094 },
//   title: 'busfront'
//   //@ts-ignore
//   anchorLeft: '-50%',
//   anchorTop: '-50%',
// });
// pinSvgMarker.append(pinSvg);
// mapElement.append(pinSvgMarker);

export const MarkerIcon = {
  Trash: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-trash2-icon lucide-trash-2"
    >
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Busfront: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-bus-front-icon lucide-bus-front"
    >
      <path d="M4 6 2 7" />
      <path d="M10 6h4" />
      <path d="m22 7-2-1" />
      <rect width="16" height="16" x="4" y="3" rx="2" />
      <path d="M4 11h16" />
      <path d="M8 15h.01" />
      <path d="M16 15h.01" />
      <path d="M6 19v2" />
      <path d="M18 21v-2" />
    </svg>
  ),
  TrafficCone: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-traffic-cone-icon lucide-traffic-cone"
    >
      <path d="M16.05 10.966a5 2.5 0 0 1-8.1 0" />
      <path d="m16.923 14.049 4.48 2.04a1 1 0 0 1 .001 1.831l-8.574 3.9a2 2 0 0 1-1.66 0l-8.574-3.91a1 1 0 0 1 0-1.83l4.484-2.04" />
      <path d="M16.949 14.14a5 2.5 0 1 1-9.9 0L10.063 3.5a2 2 0 0 1 3.874 0z" />
      <path d="M9.194 6.57a5 2.5 0 0 0 5.61 0" />
    </svg>
  ),
  MapPin: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-map-pin-icon lucide-map-pin"
    >
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  MessageCircle: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-message-circle-icon lucide-message-circle"
    >
      <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />
    </svg>
  ),
  ChevronDown: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-chevron-down-icon lucide-chevron-down"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
  Wind: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-wind-icon lucide-wind"
    >
      <path d="M12.8 19.6A2 2 0 1 0 14 16H2" />
      <path d="M17.5 8a2.5 2.5 0 1 1 2 4H2" />
      <path d="M9.8 4.4A2 2 0 1 1 11 8H2" />
    </svg>
  ),
  Trophy: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-trophy-icon lucide-trophy"
    >
      <path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978" />
      <path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978" />
      <path d="M18 9h1.5a1 1 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z" />
      <path d="M6 9H4.5a1 1 0 0 1 0-5H6" />
    </svg>
  ),
  Siren: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-siren-icon lucide-siren"
    >
      <path d="M7 18v-6a5 5 0 1 1 10 0v6" />
      <path d="M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z" />
      <path d="M21 12h1" />
      <path d="M18.5 4.5 18 5" />
      <path d="M2 12h1" />
      <path d="M12 2v1" />
      <path d="m4.929 4.929.707.707" />
      <path d="M12 12v6" />
    </svg>
  ),
  TriangleAlert: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-triangle-alert-icon lucide-triangle-alert"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  ),
} as const;

// export function createMarkerIcon(markerTypeId: number): HTMLElement {
//   const parser = new DOMParser();
//   let svgString: string;

//   switch (markerTypeId) {
//     case 1:
//       svgString = MarkerIcon.Busfront;
//       break;
//     case 2:
//       svgString = MarkerIcon.Wind;
//       break;
//     case 3:
//       svgString = MarkerIcon.TrafficCone;
//       break;
//     case 4:
//       svgString = MarkerIcon.Trophy;
//       break;
//     case 5:
//       svgString = MarkerIcon.Siren;
//       break;
//     case 6:
//       svgString = MarkerIcon.TriangleAlert;
//       break;
//     default:
//       svgString = MarkerIcon.Busfront;
//   }

//   const svgDoc = parser.parseFromString(svgString.trim(), 'image/svg+xml');
//   return svgDoc.documentElement as unknown as HTMLElement;
// }
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

  const panelMarkers = markers.filter(isInAnyZone);

  async function handleDeleteMarker(id: number) {
    try {
      const res = await fetch(`http://localhost:3000/api/markers/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        console.error('Delete failed:', await res.text());
        return;
      }
      setMarkers((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  }

  // Fetch markers from backend and normalize location
  useEffect(() => {
    async function loadMarkers() {
      try {
        setLoading(true);

        const res = await fetch('http://localhost:3000/api/markers?limit=200');
        const json = await res.json();
        const data = json.data as SuccessMarker[];

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

      <div className="flex gap-4">
        <div className="flex-1">
          <div
            ref={mapRef}
            id="google_map"
            className="overflow-hidden rounded-xl border border-neutral-300 shadow-sm"
            style={{ height: 'calc(95vh - 180px)' }}
          />
        </div>
        <div
          className="hidden w-[260px] shrink-0 flex-col rounded-xl border border-neutral-300 bg-white/95 p-3 shadow-sm md:flex"
          style={{ height: 'calc(95vh - 180px)' }}
        >
          <div className="mb-2 text-sm font-semibold">
            Selected markers
            <span className="ml-1 text-xs text-neutral-500">
              ({panelMarkers.length})
            </span>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto pr-1">
            {panelMarkers.map((m) => (
              <div
                key={m.id}
                className="flex items-start gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
              >
                <div className="flex-1">
                  <div className="text-xs font-semibold">ID : {m.id}</div>
                  <div className="line-clamp-2 text-[11px] text-neutral-600">
                    {m.description || 'No description'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteMarker(m.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
            ))}

            {panelMarkers.length === 0 && (
              <p className="text-xs text-neutral-500">
                No markers in this area.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
