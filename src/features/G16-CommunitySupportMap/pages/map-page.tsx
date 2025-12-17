// src/pages/MapPage.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import initMapAndMarkers from '../config/google-map';
import type { SuccessMarker, MapMarker } from '../interfaces/api';
import { MarkerSidePanel } from '../components/rightSide';
import { apiClient } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router';
import {
  ChevronDown,
  Wind,
  TrafficCone,
  Trophy,
  Siren,
  TriangleAlert,
  HeartPlus,
  Trash2,
  BusFront,
  MapPin,
  MessageCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

  // 1. add variable for Google Map Instance
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [loading, setLoading] = useState(false);

  // map id to marker_type_icon (string)
  const [markerTypeIconById, setMarkerTypeIconById] = useState<
    Record<number, string>
  >({});

  // null = show all, number = filter by marker_type_id
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const navigate = useNavigate();

  // 2. Focus function
  const handleFocusMarker = (lat: number, lng: number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat, lng }); // move to it
      mapInstanceRef.current.setZoom(18); // zoom
    }
  };

  const handleSelectTypeId = (id: number) => {
    console.log('=== handleSelectTypeId called ===');
    console.log('Clicked ID:', id);
    setSelectedTypeId((prev) => (prev === id ? null : id));
  };

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

        // response: res.data.data.markerTypes or marker by your API
        const types = (res.data.data.markerTypes || res.data.data.marker) as {
          id: number;
          marker_type_icon: string;
        }[];

        if (types) {
          const typeMap = Object.fromEntries(
            types.map((t) => [t.id, t.marker_type_icon])
          );
          setMarkerTypeIconById(typeMap);
        }
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

        const data = (res.data.data.markers ||
          res.data.data.marker ||
          []) as SuccessMarker[];

        if (!data) return;

        const mapped: MapMarker[] = data
          .filter((m) => m.location)
          .map((m) => {
            if (!m.location) return null;

            let lat: number | null = null;
            let lng: number | null = null;
            const loc = m.location as any;

            if (loc && Array.isArray(loc.coordinates)) {
              const [lngRaw, latRaw] = loc.coordinates;
              lng = Number(lngRaw);
              lat = Number(latRaw);
            } else if (typeof loc === 'string') {
              const match = loc.match(/POINT\(([-0-9.]+)\s+([-0-9.]+)\)/i);
              if (match) {
                lng = parseFloat(match[1]);
                lat = parseFloat(match[2]);
              }
            } else if (
              typeof loc === 'object' &&
              loc !== null &&
              typeof loc.x === 'number' &&
              typeof loc.y === 'number'
            ) {
              lng = loc.x;
              lat = loc.y;
            }

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

  // filter markers (zone + marker_type_id)
  const filteredMarkers = useMemo(() => {
    // Step 1: Filter by zone
    const inZone = markers.filter(isInAnyZone);

    // Step 2: Filter by marker_type_id
    const result = inZone.filter((m) => {
      if (selectedTypeId === null) {
        return true;
      }
      const markerTypeId = Number(m.marker_type_id);
      const selectedId = Number(selectedTypeId);
      return markerTypeId === selectedId;
    });

    return result;
  }, [markers, selectedTypeId]);

  // Render Google Map whenever filteredMarkers changes
  useEffect(() => {
    if (!mapRef.current) return;

    const filtered = filteredMarkers;

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

    const markerOptions = filtered.map((m) => ({
      position: { lat: m.lat, lng: m.lng },
      title: m.description ?? `Marker #${m.id}`,
      markerTypeId: m.marker_type_id ?? 1,
      markerTypeIconKey: markerTypeIconById[m.marker_type_id ?? 1],
    }));

    // 3. recive Map Instance in Ref when finish Init
    initMapAndMarkers({
      mapEl: mapRef.current,
      mapOptions,
      markerOptions,
    }).then((map) => {
      mapInstanceRef.current = map;
    });
  }, [filteredMarkers, markerTypeIconById]);

  const panelMarkers = filteredMarkers;

  return (
    <main className="min-h-screen overflow-hidden bg-white">
      {/* Header with 3 cards */}
      <div className="font-poppins mx-auto w-full max-w-[1200px] px-5 pt-6 pb-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
          <button
            onClick={() => navigate('/traffic')}
            className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-left transition-all hover:shadow-sm active:scale-95"
          >
            <TrafficCone className="h-6 w-8" />
            <div className="leading-tight">
              <div className="text-sm font-semibold md:text-base">Traffics</div>
              <div className="text-xs text-neutral-500 md:text-sm">
                Hospital &amp; emergency services
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/volunteer/board')}
            className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-left hover:shadow-sm"
          >
            <MapPin className="h-6 w-6" />
            <div className="leading-tight">
              <div className="text-sm font-semibold md:text-base">Nearby</div>
              <div className="text-xs text-neutral-500 md:text-sm">
                Activities and volunteer
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/map')}
            className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-left hover:shadow-sm"
          >
            <MessageCircle className="h-6 w-6" />
            <div className="leading-tight">
              <div className="text-sm font-semibold md:text-base">
                Support Map
              </div>
              <div className="text-xs text-neutral-500 md:text-sm">
                Reservation
              </div>
            </div>
          </button>
        </div>

        {/* Filter Button - Mobile */}
        <div className="mt-5 flex w-full justify-center md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-9 items-center gap-2 rounded-full border border-[#6FA8FF] bg-[#2749C9] px-4 text-white transition hover:bg-[#1f3db1]">
                Filter
                <ChevronDown className="h-4 w-4" strokeWidth={4} />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={10}
              className="w-48 rounded-2xl bg-[#2749C9] p-3 text-white shadow-xl"
            >
              <DropdownMenuItem
                onClick={() => handleSelectTypeId(1)}
                className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-[#1f3db1]"
              >
                <Wind className="h-6 w-6 text-white" strokeWidth={2} />
                <span className="text-base">Impure Air</span>
              </DropdownMenuItem>

              {/* mobile */}
              <DropdownMenuItem
                onClick={() => handleSelectTypeId(2)}
                className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-[#1f3db1]"
              >
                <TrafficCone className="h-6 w-6 text-white" strokeWidth={2} />
                <span className="text-base">Traffics</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSelectTypeId(3)}
                className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-[#1f3db1]"
              >
                <Trophy className="h-6 w-6 text-white" strokeWidth={2} />
                <span className="text-base">Events</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSelectTypeId(4)}
                className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-[#1f3db1]"
              >
                <Siren className="h-6 w-6 text-white" strokeWidth={2} />
                <span className="text-base">Emergency Request</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSelectTypeId(5)}
                className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-[#1f3db1]"
              >
                <TriangleAlert className="h-6 w-6 text-white" strokeWidth={2} />
                <span className="text-base">Danger Area</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSelectTypeId(6)}
                className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-[#1f3db1]"
              >
                <HeartPlus className="h-6 w-6 text-white" strokeWidth={2} />
                <span className="text-base">Injured Area</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSelectTypeId(7)}
                className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-[#1f3db1]"
              >
                <Trash2 className="h-6 w-6 text-white" strokeWidth={2} />
                <span className="text-base">Trash Area</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Filter Button - Desktop */}
        <div className="mt-5 hidden w-full justify-end md:flex lg:mr-20">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-9 items-center gap-2 rounded-full border border-[#6FA8FF] bg-[#2749C9] px-4 text-white transition hover:bg-[#1f3db1]">
                Filter
                <ChevronDown className="h-4 w-4" strokeWidth={4} />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={10}
              className="w-54 rounded-2xl bg-[#2749C9] p-3 text-white shadow-xl"
            >
              <DropdownMenuItem
                onClick={() => handleSelectTypeId(1)}
                className="group flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 transition hover:bg-white hover:text-black"
              >
                <Wind
                  className="h-6 w-6 text-white group-hover:text-black"
                  strokeWidth={2}
                />
                <span className="text-base group-hover:text-black">
                  Impure Air
                </span>
              </DropdownMenuItem>

              {/* desktop */}
              <DropdownMenuItem
                onClick={() => handleSelectTypeId(2)}
                className="group flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 transition hover:bg-white hover:text-black"
              >
                <TrafficCone
                  className="h-6 w-6 text-white group-hover:text-black"
                  strokeWidth={2}
                />
                <span className="text-base group-hover:text-black">
                  Traffics
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSelectTypeId(3)}
                className="group flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 transition hover:bg-white hover:text-black"
              >
                <Trophy
                  className="h-6 w-6 text-white group-hover:text-black"
                  strokeWidth={2}
                />
                <span className="text-base group-hover:text-black">Events</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSelectTypeId(4)}
                className="group flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 transition hover:bg-white hover:text-black"
              >
                <Siren
                  className="h-6 w-6 text-white group-hover:text-black"
                  strokeWidth={2}
                />
                <span className="text-base group-hover:text-black">
                  Emergency Request
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSelectTypeId(5)}
                className="group flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 transition hover:bg-white hover:text-black"
              >
                <TriangleAlert
                  className="h-6 w-6 text-white group-hover:text-black"
                  strokeWidth={2}
                />
                <span className="text-base group-hover:text-black">
                  Danger Area
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSelectTypeId(6)}
                className="group flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 transition hover:bg-white hover:text-black"
              >
                <HeartPlus
                  className="h-6 w-6 text-white group-hover:text-black"
                  strokeWidth={2}
                />
                <span className="text-base group-hover:text-black">
                  Injured Area
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSelectTypeId(7)}
                className="group flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 transition hover:bg-white hover:text-black"
              >
                <Trash2
                  className="h-6 w-6 text-white group-hover:text-black"
                  strokeWidth={2}
                />
                <span className="text-base group-hover:text-black">
                  Trash Area
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid flex-1 items-end gap-4 p-6">
        <div className="w-full space-y-4">
          {loading && (
            <p className="text-sm text-gray-500">Loading markers...</p>
          )}

          <div className="text-sm text-gray-600">
            <span>
              Selected Filter:{' '}
              {selectedTypeId === null ? 'All' : `Type ${selectedTypeId}`}
            </span>
            {' | '}
            <span>Showing: {filteredMarkers.length} markers</span>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <div
                ref={mapRef}
                id="google_map"
                className="overflow-hidden rounded-xl border border-neutral-300 shadow-sm"
                style={{ height: 'calc(95vh - 180px)' }}
              />
            </div>

            {/* send onFocus function to sidebar */}
            <MarkerSidePanel
              markers={panelMarkers}
              onDelete={handleDeleteMarker}
              onFocus={handleFocusMarker}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default MapPage;
