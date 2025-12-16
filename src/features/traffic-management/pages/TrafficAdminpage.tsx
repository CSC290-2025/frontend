import { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from '@vis.gl/react-google-maps';
import { ref, onValue, update } from 'firebase/database';
import { database } from '@/lib/firebase';
import { apiClient, getBaseAPIURL } from '@/lib/apiClient';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { Navigation } from 'lucide-react';
import MapSettingsDialog from '../components/MapSettingsDialog';
import TrafficNotifications from '../components/TrafficNotifications';
import EmergencyVehicleMarker from '../components/EmergencyVehicleMarker';
import TrafficLegend from '../components/TrafficLegend';
import TrafficSidebar from '../components/TrafficSidebar';
import LightEditorDialog from '../components/LightEditorDialog';
import { useEmergencyVehicles } from '../hooks/useEmergencyVehicles';
import { useEmergencyTrafficControl } from '../hooks/useEmergencyTrafficControl';
import { useTrafficLightCycle } from '../hooks/useTrafficLightCycle';
import type { trafficLight, lightRequest } from '../types/traffic.types';
import TrafficSettingPopup from '../components/TrafficSettingPopup';
import { useNavigate } from '@/router';
import {
  colorNumberToString,
  getLightDuration,
  COLOR_GREEN,
  COLOR_YELLOW,
  COLOR_RED,
} from '../utils/trafficLightCalculations';

interface TrafficLight {
  color: 'red' | 'yellow' | 'green';
  direction: string;
  lat: number;
  lng: number;
  online: boolean;
  remainingTime: number;
  timestamp: number;
}

interface Junction {
  currentActive: string;
  lights: {
    [key: string]: TrafficLight;
  };
}

interface SignalWithMeta extends TrafficLight {
  junctionId: string;
  source?: 'legacy' | 'backend'; // Track if this is from junctions (legacy) or traffic_lights (backend)
  trafficLightId?: string; // ID for traffic_lights updates (only for backend signals)
  status?: number; // 0=normal, 1=broken, 2=fixing
}

interface MapSettings {
  refreshRate: number;
  visibilityRange: number;
  mapType: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
  showTraffic: boolean;
  showTransit: boolean;
  showBicycling: boolean;
  gestureHandling: 'cooperative' | 'greedy' | 'none' | 'auto';
  zoomControl: boolean;
  mapTypeControl: boolean;
  streetViewControl: boolean;
  fullscreenControl: boolean;
  scaleControl: boolean;
  rotateControl: boolean;
  minZoom: number;
  maxZoom: number;
  enableClustering: boolean;
}
// NOTE: SSE connections are handled by `useTrafficSSE` inside the notification
// component. Avoid creating a global EventSource here to prevent duplicate connections.

function parseCoordinate(value: any): number | null {
  if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!isNaN(parsed) && isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
}

function isValidSignal(signal: any): boolean {
  const lat = parseCoordinate(signal?.lat);
  const lng = parseCoordinate(signal?.lng);
  return lat !== null && lng !== null;
}

function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function useTeam10TrafficSignals() {
  const [signals, setSignals] = useState<SignalWithMeta[]>([]);
  const [trafficLightsData, setTrafficLightsData] = useState<
    Record<string, any>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trafficLightsRef = ref(database, 'teams/10/traffic_lights');

    // Listen to traffic_lights only (single source of truth)
    const unsubscribe = onValue(
      trafficLightsRef,
      (snapshot) => {
        try {
          const data = snapshot.val();

          if (data) {
            setTrafficLightsData(data);

            const allSignals: SignalWithMeta[] = [];

            Object.entries(data).forEach(([key, lightData]: [string, any]) => {
              if (
                lightData &&
                typeof lightData === 'object' &&
                isValidSignal(lightData)
              ) {
                const lat = parseCoordinate(lightData.lat);
                const lng = parseCoordinate(lightData.lng);

                if (lat !== null && lng !== null) {
                  const colorNum = parseInt(lightData.color) || 1;
                  const color = colorNumberToString(colorNum);
                  const { greenDuration, yellowDuration } =
                    getLightDuration(lightData);

                  // Get raw remaining time from Firebase
                  const remainingTime = parseInt(lightData.remaintime) || 0;

                  // For display: green shows only green portion, yellow shows yellow portion
                  let displayTime = remainingTime;
                  if (colorNum === COLOR_GREEN) {
                    // Green: show time minus yellow duration
                    displayTime = Math.max(0, remainingTime - yellowDuration);
                  } else if (colorNum === COLOR_YELLOW) {
                    // Yellow: show remaining time as-is (should be <= yellowDuration)
                    displayTime = remainingTime;
                  }
                  // Red: show remaining time as-is (time until green)

                  const interid = parseInt(lightData.interid) || 0;
                  const roadid = parseInt(lightData.roadid) || 0;
                  const status = parseInt(lightData.status) || 0;

                  allSignals.push({
                    color,
                    direction: `Road-${roadid}`,
                    lat,
                    lng,
                    online: lightData.autoON !== false,
                    remainingTime: displayTime,
                    timestamp: lightData.timestamp
                      ? new Date(lightData.timestamp).getTime()
                      : Date.now(),
                    junctionId: `Inter-${interid}`,
                    source: 'backend',
                    trafficLightId: key,
                    status,
                  });
                }
              }
            });

            setSignals(allSignals);
            setError(null);
            setLoading(false);
          } else {
            setSignals([]);
            setLoading(false);
          }
        } catch (err) {
          console.error('Error processing traffic_lights data:', err);
          setError('Error processing traffic lights data');
          setLoading(false);
        }
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { signals, loading, error, trafficLightsData };
}

interface TrafficSignalMarkerProps {
  signal: SignalWithMeta;
  isSelected: boolean;
  onClick: () => void;
  setMarkerRef?: (
    marker: google.maps.marker.AdvancedMarkerElement | null,
    key: string
  ) => void;
  isStopped?: boolean;
  isEmergencyControlled?: boolean;
}

const TrafficSignalMarker = memo(
  function TrafficSignalMarker({
    signal,
    isSelected,
    onClick,
    setMarkerRef,
    isStopped,
    isEmergencyControlled,
  }: TrafficSignalMarkerProps) {
    const colorMap = {
      red: '#ef4444',
      yellow: '#fbbf24',
      green: '#22c55e',
    };

    const markerKey = `${signal.junctionId}-${signal.direction}`;

    if (!signal.online) {
      return null;
    }

    // Check if light is broken (status=1) or fixing (status=2)
    const isBrokenOrFixing = signal.status === 1 || signal.status === 2;
    const statusLabel =
      signal.status === 1 ? 'BROKEN' : signal.status === 2 ? 'FIXING' : '';

    // Determine background color - gray for broken/fixing, normal color otherwise
    const backgroundColor = isBrokenOrFixing ? '#6b7280' : colorMap[signal.color];

    // Show "--" for stopped, broken/fixing, or emergency controlled lights
    const showDash = isStopped || isBrokenOrFixing || isEmergencyControlled;

    return (
      <AdvancedMarker
        position={{ lat: signal.lat, lng: signal.lng }}
        title={`Junction: ${signal.junctionId} | Direction: ${signal.direction}${isStopped ? ' (STOPPED)' : ''}${isBrokenOrFixing ? ` (${statusLabel})` : ''}`}
        onClick={onClick}
        ref={(marker) => setMarkerRef && setMarkerRef(marker, markerKey)}
      >
        <div className="flex cursor-pointer flex-col items-center">
          <div
            className={`flex items-center justify-center rounded-full shadow-lg ${
              isSelected
                ? 'border-4 border-blue-500 ring-4 ring-blue-300'
                : isBrokenOrFixing
                  ? 'border-4 border-gray-400'
                  : 'border-4 border-white'
            }`}
            style={{
              backgroundColor,
              width: '48px',
              height: '48px',
            }}
          >
            <span className="text-base font-bold text-white">
              {showDash ? '--' : signal.remainingTime}
            </span>
          </div>
          <div
            className={`mt-1 rounded px-2 py-1 text-xs font-semibold shadow-md ${
              isSelected
                ? 'bg-blue-500 text-white'
                : isBrokenOrFixing
                  ? 'bg-gray-600 text-white'
                  : 'bg-white text-gray-800'
            }`}
          >
            {isBrokenOrFixing ? statusLabel : signal.junctionId}
          </div>
        </div>
      </AdvancedMarker>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison to prevent flickering
    return (
      prevProps.signal.junctionId === nextProps.signal.junctionId &&
      prevProps.signal.direction === nextProps.signal.direction &&
      prevProps.signal.color === nextProps.signal.color &&
      prevProps.signal.remainingTime === nextProps.signal.remainingTime &&
      prevProps.signal.lat === nextProps.signal.lat &&
      prevProps.signal.lng === nextProps.signal.lng &&
      prevProps.signal.online === nextProps.signal.online &&
      prevProps.signal.status === nextProps.signal.status &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.isStopped === nextProps.isStopped &&
      prevProps.isEmergencyControlled === nextProps.isEmergencyControlled
    );
  }
);

interface BrokenLightMarkerProps {
  light: trafficLight;
}

function BrokenLightMarker({ light }: BrokenLightMarkerProps) {
  if (!light.location?.coordinates || light.location.coordinates.length !== 2) {
    return null;
  }

  const [lng, lat] = light.location.coordinates;

  return (
    <AdvancedMarker
      position={{ lat, lng }}
      title={`Broken Light | ID: ${light.id} | Intersection: ${light.intersection_id}`}
    >
      <div className="flex cursor-pointer flex-col items-center">
        <div
          className="flex items-center justify-center rounded-full border-4 border-white shadow-lg"
          style={{
            backgroundColor: '#6b7280', // gray-500
            width: '48px',
            height: '48px',
          }}
        >
          <span className="text-5xl text-amber-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="icon icon-tabler icons-tabler-filled icon-tabler-alert-triangle"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M12 1.67c.955 0 1.845 .467 2.39 1.247l.105 .16l8.114 13.548a2.914 2.914 0 0 1 -2.307 4.363l-.195 .008h-16.225a2.914 2.914 0 0 1 -2.582 -4.2l.099 -.185l8.11 -13.538a2.914 2.914 0 0 1 2.491 -1.403zm.01 13.33l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm-.01 -7a1 1 0 0 0 -.993 .883l-.007 .117v4l.007 .117a1 1 0 0 0 1.986 0l.007 -.117v-4l-.007 -.117a1 1 0 0 0 -.993 -.883z" />
            </svg>
          </span>
        </div>
        <div className="mt-1 rounded bg-gray-600 px-2 py-1 text-xs font-semibold text-white shadow-md">
          BROKEN
        </div>
      </div>
    </AdvancedMarker>
  );
}

interface MapContentProps {
  settings: MapSettings;
  userLocation: { lat: number; lng: number } | null;
  selectedSignal: SignalWithMeta | null;
  onSignalClick: (signal: SignalWithMeta) => void;
  signals: SignalWithMeta[];
  brokenLights: trafficLight[];
  onMapReady?: (map: google.maps.Map | null) => void;
  showBrokenLights?: boolean;
  legendVisible?: boolean;
  onToggleLegend?: () => void;
  onUserLocationUpdate?: (location: { lat: number; lng: number }) => void;
  emergencyStopAll?: boolean;
  stoppedIntersections?: Set<number>;
  emergencyControlledIntersections?: Set<number>;
}

function MapContent({
  settings,
  userLocation,
  selectedSignal,
  onSignalClick,
  signals,
  brokenLights,
  onMapReady,
  showBrokenLights = true,
  legendVisible = true,
  onToggleLegend,
  onUserLocationUpdate,
  emergencyStopAll = false,
  stoppedIntersections = new Set(),
  emergencyControlledIntersections = new Set(),
}: MapContentProps) {
  const map = useMap();
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  // Notify parent when map is ready
  useEffect(() => {
    if (map && onMapReady) {
      onMapReady(map);
    }
  }, [map, onMapReady]);

  // Handle jump to current location
  const handleJumpToLocation = useCallback(() => {
    if (!map) return;

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = { lat: latitude, lng: longitude };

        // Update parent component with location
        if (onUserLocationUpdate) {
          onUserLocationUpdate(location);
        }

        // Pan and zoom to user location
        map.panTo(location);
        map.setZoom(16);
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert(
          'Unable to get your location. Please check location permissions.'
        );
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  }, [map, onUserLocationUpdate]);
  const [trafficLayer, setTrafficLayer] =
    useState<google.maps.TrafficLayer | null>(null);
  const [transitLayer, setTransitLayer] =
    useState<google.maps.TransitLayer | null>(null);
  const [bicyclingLayer, setBicyclingLayer] =
    useState<google.maps.BicyclingLayer | null>(null);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markersMapRef = useRef<{
    [key: string]: google.maps.marker.AdvancedMarkerElement;
  }>({});

  // Track emergency vehicles
  const { vehicles: emergencyVehicles } = useEmergencyVehicles();

  // Auto-switch traffic lights to green for emergency vehicles
  const { switchedJunctions } = useEmergencyTrafficControl(
    emergencyVehicles,
    signals
  );

  const visibleSignals = useMemo(() => {
    if (!userLocation || settings.visibilityRange === 0) {
      return signals;
    }

    return signals.filter((signal) => {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        signal.lat,
        signal.lng
      );
      return distance <= settings.visibilityRange;
    });
  }, [signals, userLocation, settings.visibilityRange]);

  // Handle traffic layer
  useEffect(() => {
    if (!map) return;

    if (settings.showTraffic) {
      if (!trafficLayer) {
        const layer = new google.maps.TrafficLayer();
        layer.setMap(map);
        setTrafficLayer(layer);
      }
    } else if (trafficLayer) {
      trafficLayer.setMap(null);
      setTrafficLayer(null);
    }
  }, [map, settings.showTraffic, trafficLayer]);

  // Handle transit layer
  useEffect(() => {
    if (!map) return;

    if (settings.showTransit) {
      if (!transitLayer) {
        const layer = new google.maps.TransitLayer();
        layer.setMap(map);
        setTransitLayer(layer);
      }
    } else if (transitLayer) {
      transitLayer.setMap(null);
      setTransitLayer(null);
    }
  }, [map, settings.showTransit, transitLayer]);

  // Handle bicycling layer
  useEffect(() => {
    if (!map) return;

    if (settings.showBicycling) {
      if (!bicyclingLayer) {
        const layer = new google.maps.BicyclingLayer();
        layer.setMap(map);
        setBicyclingLayer(layer);
      }
    } else if (bicyclingLayer) {
      bicyclingLayer.setMap(null);
      setBicyclingLayer(null);
    }
  }, [map, settings.showBicycling, bicyclingLayer]);

  // Initialize/update marker clustering based on settings
  useEffect(() => {
    if (!map) return;

    if (settings.enableClustering) {
      // Initialize clusterer if it doesn't exist
      if (!clustererRef.current) {
        clustererRef.current = new MarkerClusterer({
          map,
          markers: [],
        });
      }
    } else {
      // Disable clustering
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
        clustererRef.current.setMap(null);
        clustererRef.current = null;
      }
    }
  }, [map, settings.enableClustering]);

  // Jump to selected signal
  useEffect(() => {
    if (map && selectedSignal) {
      setPopupOpen(true);
      map.panTo({ lat: selectedSignal.lat, lng: selectedSignal.lng });
      map.setZoom(18);
    }
  }, [map, selectedSignal]);

  // Debounce clusterer update to prevent flickering
  const clustererUpdateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setMarkerRef = useCallback(
    (marker: google.maps.marker.AdvancedMarkerElement | null, key: string) => {
      if (marker) {
        markersMapRef.current[key] = marker;
      } else {
        delete markersMapRef.current[key];
      }

      // Debounce clusterer update when markers change (if clustering is enabled)
      if (map && settings.enableClustering && clustererRef.current) {
        // Clear any pending update
        if (clustererUpdateTimeoutRef.current) {
          clearTimeout(clustererUpdateTimeoutRef.current);
        }
        // Schedule update after a short delay
        clustererUpdateTimeoutRef.current = setTimeout(() => {
          if (clustererRef.current) {
            const markerArray = Object.values(markersMapRef.current);
            clustererRef.current.clearMarkers();
            clustererRef.current.addMarkers(markerArray);
          }
        }, 100);
      }
    },
    [map, settings.enableClustering]
  );

  if (signals.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">No traffic signals found in team 10</p>
          <p className="mt-2 text-xs text-gray-500">
            Check Firebase connection
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {visibleSignals.map((signal) => {
        // Extract interid from junctionId (e.g., "Inter-3" -> 3)
        const interid = parseInt(signal.junctionId.replace('Inter-', '')) || 0;
        const isStopped = emergencyStopAll || stoppedIntersections.has(interid);
        const isEmergencyControlled = emergencyControlledIntersections.has(interid);

        return (
          <TrafficSignalMarker
            key={`${signal.junctionId}-${signal.direction}`}
            signal={signal}
            isSelected={
              selectedSignal?.junctionId === signal.junctionId &&
              selectedSignal?.direction === signal.direction
            }
            onClick={() => onSignalClick(signal)}
            setMarkerRef={setMarkerRef}
            isStopped={isStopped}
            isEmergencyControlled={isEmergencyControlled}
          />
        );
      })}

      {showBrokenLights &&
        brokenLights.map((light) => (
          <BrokenLightMarker key={`broken-${light.id}`} light={light} />
        ))}

      {emergencyVehicles.map((vehicle) => (
        <EmergencyVehicleMarker key={vehicle.vehicleId} vehicle={vehicle} />
      ))}

      <TrafficLegend
        totalLights={signals.length}
        activeLights={visibleSignals.filter((s) => s.online && s.status === 0).length}
        brokenLights={signals.filter((s) => s.status === 1 || s.status === 2).length}
        emergencyVehicles={emergencyVehicles.length}
        junctionsOverridden={switchedJunctions.length}
        isVisible={legendVisible}
        onToggleVisibility={onToggleLegend}
      />

      {/* Jump to Current Location Button */}
      <button
        onClick={handleJumpToLocation}
        disabled={isGettingLocation}
        className="absolute right-4 bottom-4 z-10 flex items-center gap-2 rounded-lg border border-gray-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm transition hover:bg-white disabled:opacity-50"
        title="Jump to my location"
      >
        <Navigation
          className={`h-5 w-5 text-slate-600 ${isGettingLocation ? 'animate-pulse' : ''}`}
        />
        <span className="text-sm font-medium text-gray-700">
          {isGettingLocation ? 'Getting location...' : 'My Location'}
        </span>
      </button>

      <TrafficSettingPopup
        open={popupOpen}
        onOpenChange={(v) => setPopupOpen(v)}
        Traffickey={String(selectedSignal?.trafficLightId)}
      />
    </>
  );
}

export default function TrafficAdminpage() {
  const navigate = useNavigate();
  const apiKey = import.meta.env.VITE_G10_GOOGLE_MAPS_API_KEY;
  const [currentLocation, setCurrentLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [brokenLights, setBrokenLights] = useState<trafficLight[]>([]);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [openMoniter, setOpenMoniter] = useState(true);
  const [selectedSignal, setSelectedSignal] = useState<SignalWithMeta | null>(
    null
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [requestOpen, setrequestOpen] = useState(false);
  const [signalOpen, setsignalOpen] = useState(false);
  const [refreshrate, setrefreshrate] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [LightRequest, setLightRequest] = useState<lightRequest[]>([]);

  // Load broken lights visibility from localStorage
  const BROKEN_LIGHTS_STORAGE_KEY =
    'smartcity_traffic_map_show_broken_lights_v1';
  const [showBrokenLights, setShowBrokenLights] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(BROKEN_LIGHTS_STORAGE_KEY);
      if (saved !== null) {
        return JSON.parse(saved);
      }
    } catch (err) {
      console.error('Failed to load broken lights visibility:', err);
    }
    return true; // Default: show broken lights
  });

  const emergencyRequests = [
    {
      id: 1,
      location: 'INT-001',
      time: '14:32',
      reason: 'Accident',
      status: 'Active',
    },
    {
      id: 2,
      location: 'INT-005',
      time: '14:28',
      reason: 'Medical Emergency',
      status: 'Active',
    },
    {
      id: 3,
      location: 'INT-003',
      time: '14:15',
      reason: 'Traffic Jam',
      status: 'Resolved',
    },
  ];

  useEffect(() => {
    (async () => {
      try {
        const url = getBaseAPIURL + `/api/light-requests`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to get request details');
        const response: any = await res.json();

        console.log('This traffic light data:', response);
        console.log('Current traffic data:', response.data.data);
        console.log('Light request data:', response.data.data[0].reason);
        setLightRequest(response.data.data);
      } catch (err) {
        console.error('Error loading request details', err);
      }
    })();
  }, []);

  // Save broken lights visibility to localStorage
  const handleToggleBrokenLights = useCallback(() => {
    setShowBrokenLights((prev) => {
      const newValue = !prev;
      try {
        localStorage.setItem(
          BROKEN_LIGHTS_STORAGE_KEY,
          JSON.stringify(newValue)
        );
      } catch (err) {
        console.error('Failed to save broken lights visibility:', err);
      }
      return newValue;
    });
  }, [BROKEN_LIGHTS_STORAGE_KEY]);

  const [junctionSearchQuery, setJunctionSearchQuery] = useState('');

  // Load legend visibility from localStorage
  const LEGEND_STORAGE_KEY = 'smartcity_traffic_map_legend_visible_v1';
  const [legendVisible, setLegendVisible] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(LEGEND_STORAGE_KEY);
      if (saved !== null) {
        return JSON.parse(saved);
      }
    } catch (err) {
      console.error('Failed to load legend visibility:', err);
    }
    return true; // Default: show legend
  });

  // Save legend visibility to localStorage
  const handleToggleLegend = useCallback(() => {
    setLegendVisible((prev) => {
      const newValue = !prev;
      try {
        localStorage.setItem(LEGEND_STORAGE_KEY, JSON.stringify(newValue));
      } catch (err) {
        console.error('Failed to save legend visibility:', err);
      }
      return newValue;
    });
  }, [LEGEND_STORAGE_KEY]);

  // Load settings from localStorage with unique key
  const STORAGE_KEY = 'smartcity_traffic_management_map_settings_v1';
  const [settings, setSettings] = useState<MapSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (err) {
      console.error('Failed to load map settings:', err);
    }
    return {
      refreshRate: 5,
      visibilityRange: 0,
      mapType: 'roadmap',
      showTraffic: true, // Default: on
      showTransit: false,
      showBicycling: false,
      gestureHandling: 'greedy',
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false, // Default: off
      scaleControl: false,
      rotateControl: false,
      minZoom: 3,
      maxZoom: 21,
      enableClustering: true, // Default: enabled
    };
  });

  // Fetch traffic signals from Firebase
  const { signals, loading, error, trafficLightsData } = useTeam10TrafficSignals();

  // Manage traffic light cycles with Firebase sync (only one controller across all instances)
  useTrafficLightCycle();

  // Emergency state
  const [emergencyStopAll, setEmergencyStopAll] = useState(false);
  const [stoppedIntersections, setStoppedIntersections] = useState<Set<number>>(
    new Set()
  );
  const [emergencyControlledIntersections, setEmergencyControlledIntersections] =
    useState<Set<number>>(new Set());

  // Light editor state
  const [editingLight, setEditingLight] = useState<SignalWithMeta | null>(null);
  const [showLightEditor, setShowLightEditor] = useState(false);

  // Listen to emergency state from Firebase
  useEffect(() => {
    const emergencyStopRef = ref(database, 'teams/10/emergency-stop');
    const stoppedIntersectionsRef = ref(
      database,
      'teams/10/stopped-intersections'
    );
    const emergencyControlledRef = ref(
      database,
      'teams/10/emergency-controlled-intersections'
    );

    const unsubscribeEmergencyStop = onValue(emergencyStopRef, (snapshot) => {
      const value = snapshot.val();
      setEmergencyStopAll(value === true);
    });

    const unsubscribeStoppedIntersections = onValue(
      stoppedIntersectionsRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const intersectionIds = Object.keys(data)
            .filter((key) => data[key] === true)
            .map((key) => parseInt(key));
          setStoppedIntersections(new Set(intersectionIds));
        } else {
          setStoppedIntersections(new Set());
        }
      }
    );

    const unsubscribeEmergencyControlled = onValue(
      emergencyControlledRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const intersectionIds = Object.keys(data)
            .filter((key) => data[key] === true)
            .map((key) => parseInt(key));
          setEmergencyControlledIntersections(new Set(intersectionIds));
        } else {
          setEmergencyControlledIntersections(new Set());
        }
      }
    );

    return () => {
      unsubscribeEmergencyStop();
      unsubscribeStoppedIntersections();
      unsubscribeEmergencyControlled();
    };
  }, []);

  // Fetch broken traffic lights on mount
  useEffect(() => {
    const fetchBrokenLights = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL ?? ''}/traffic-lights/status`
        );
        if (!res.ok) throw new Error('Failed to fetch status');
        const json = await res.json();
        const allLights = Array.isArray(json)
          ? json
          : json?.data?.trafficLights || json?.trafficLights || [];

        // Filter for broken (status=1) and maintenance (status=2)
        const problematicLights = allLights.filter((light: trafficLight) => {
          const status = light.status;
          const label = (light.statusLabel || '').toString().toLowerCase();
          return (
            status === 1 ||
            status === 2 ||
            /broken/.test(label) ||
            /maintenance/.test(label)
          );
        });

        setBrokenLights(problematicLights);
      } catch (err) {
        console.error('Failed to fetch broken traffic lights:', err);
      }
    };

    fetchBrokenLights();
  }, []);

  const handleMapSettingsClick = () => {
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  const handleSaveSettings = (newSettings: MapSettings) => {
    setSettings(newSettings);
    setShowSettings(false);

    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch (err) {
      console.error('Failed to save map settings:', err);
    }
  };

  const handleSignalSelect = useCallback((signal: SignalWithMeta) => {
    setSelectedSignal((prev) => {
      if (
        prev?.junctionId === signal.junctionId &&
        prev?.direction === signal.direction
      ) {
        return null;
      }
      return signal;
    });
  }, []);

  const handleMoniter = () => {
    setOpenMoniter(!openMoniter);
  };

  const handleUserLocationUpdate = useCallback(
    (location: { lat: number; lng: number }) => {
      setUserLocation(location);
    },
    []
  );

  // Light editor handlers
  const handleEditLight = useCallback((signal: SignalWithMeta) => {
    setEditingLight(signal);
    setShowLightEditor(true);
  }, []);

  const handleSaveLightSettings = useCallback(
    async (
      lightKey: string,
      greenDuration: number,
      yellowDuration: number,
      status: number
    ) => {
      try {
        const lightData = trafficLightsData[lightKey];
        const previousStatus = parseInt(lightData?.status) || 0;
        const lat = parseFloat(lightData?.lat) || 0;
        const lng = parseFloat(lightData?.lng) || 0;
        const interid = parseInt(lightData?.interid) || 0;
        const roadid = parseInt(lightData?.roadid) || 0;
        const supportMarkerId = lightData?.support_marker_id;

        const updates: Record<string, any> = {
          [`teams/10/traffic_lights/${lightKey}/green_duration`]: greenDuration,
          [`teams/10/traffic_lights/${lightKey}/yellow_duration`]: yellowDuration,
          [`teams/10/traffic_lights/${lightKey}/status`]: status,
        };

        // When status changes to broken (1) or fixing (2), create a support marker
        if (previousStatus === 0 && (status === 1 || status === 2)) {
          try {
            const statusLabel = status === 1 ? 'BROKEN' : 'FIXING';
            const response = await apiClient.post('/api/markers', {
              description: `Traffic Light ${statusLabel} - Inter-${interid} Road-${roadid}`,
              marker_type_id: 2,
              location: { lat, lng },
            });

            const markerId = response.data?.data?.marker?.id;
            if (markerId) {
              updates[`teams/10/traffic_lights/${lightKey}/support_marker_id`] = markerId;
            }
          } catch (markerErr) {
            console.error('Failed to create support marker:', markerErr);
          }
        }

        // When status changes back to normal (0), delete the support marker
        if ((previousStatus === 1 || previousStatus === 2) && status === 0) {
          if (supportMarkerId) {
            try {
              await apiClient.delete(`/api/markers/${supportMarkerId}`);
              updates[`teams/10/traffic_lights/${lightKey}/support_marker_id`] = null;
            } catch (markerErr) {
              console.error('Failed to delete support marker:', markerErr);
            }
          }
        }

        await update(ref(database), updates);
        setShowLightEditor(false);
        setEditingLight(null);
      } catch (err) {
        console.error('Failed to update light settings:', err);
      }
    },
    [trafficLightsData]
  );

  const handleForceGreen = useCallback(
    async (lightKey: string) => {
      try {
        const lightData = trafficLightsData[lightKey];
        const greenDuration = parseInt(lightData?.green_duration) || 27;
        const yellowDuration = parseInt(lightData?.yellow_duration) || 3;

        const updates: Record<string, any> = {
          [`teams/10/traffic_lights/${lightKey}/color`]: COLOR_GREEN,
          [`teams/10/traffic_lights/${lightKey}/remaintime`]:
            greenDuration + yellowDuration,
          [`teams/10/traffic_lights/${lightKey}/timestamp`]:
            new Date().toISOString(),
        };

        await update(ref(database), updates);
        setShowLightEditor(false);
        setEditingLight(null);
      } catch (err) {
        console.error('Failed to force green:', err);
      }
    },
    [trafficLightsData]
  );

  const initialCenter = { lat: 13.647372072504554, lng: 100.49553588244684 };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600">Loading traffic monitor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="mb-2 text-red-600">Error: {error}</p>
          <p className="text-sm text-gray-500">Check Firebase connection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {!openMoniter ? (
        <></>
      ) : (
        <div className="w-96 flex-shrink-0 rounded-md border-1">
          <TrafficSidebar
            signals={signals}
            selectedSignal={selectedSignal}
            onSignalSelect={handleSignalSelect}
            mapInstance={mapInstance}
            showBrokenLights={showBrokenLights}
            onToggleBrokenLights={handleToggleBrokenLights}
            searchQuery={junctionSearchQuery}
            onSearchChange={setJunctionSearchQuery}
            emergencyStopAll={emergencyStopAll}
            stoppedIntersections={stoppedIntersections}
            emergencyControlledIntersections={emergencyControlledIntersections}
          />
        </div>
      )}
      <button onClick={handleMoniter} className="border-2 p-2">
        {openMoniter ? '<' : '>'}
      </button>

      <TrafficNotifications />

      {/* Map area - Takes remaining space */}
      <div className="flex flex-1 flex-col">
        <div className="flex h-full w-full flex-col border-1 bg-gradient-to-b from-gray-100 to-gray-300 p-3">
          <div className="relative h-full w-full overflow-hidden rounded-lg shadow-xl">
            <APIProvider apiKey={apiKey}>
              <Map
                mapId="traffic-signals-map"
                defaultCenter={initialCenter}
                defaultZoom={15}
                mapTypeId={settings.mapType}
                gestureHandling={settings.gestureHandling}
                disableDefaultUI={false}
                zoomControl={settings.zoomControl}
                mapTypeControl={settings.mapTypeControl}
                streetViewControl={settings.streetViewControl}
                fullscreenControl={settings.fullscreenControl}
                scaleControl={settings.scaleControl}
                rotateControl={settings.rotateControl}
                minZoom={settings.minZoom}
                maxZoom={settings.maxZoom}
                className="h-full w-full"
              >
                <MapContent
                  settings={settings}
                  userLocation={userLocation}
                  selectedSignal={selectedSignal}
                  onSignalClick={handleSignalSelect}
                  signals={signals}
                  brokenLights={brokenLights}
                  onMapReady={setMapInstance}
                  showBrokenLights={showBrokenLights}
                  legendVisible={legendVisible}
                  onToggleLegend={handleToggleLegend}
                  onUserLocationUpdate={handleUserLocationUpdate}
                  emergencyStopAll={emergencyStopAll}
                  stoppedIntersections={stoppedIntersections}
                  emergencyControlledIntersections={emergencyControlledIntersections}
                />
              </Map>
            </APIProvider>
          </div>
        </div>
        {/*Control panel */}  
        <div className="absolute top-15 right-8 z-10 mt-15 flex flex-col gap-2">
          {!legendVisible && !requestOpen && !signalOpen && (
            <div className="">
              <button
                onClick={() => navigate('/traffic/AddLight')}
                className="mb-2 flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-white shadow-lg hover:bg-green-700"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 8C11 7.44772 11.4477 7 12 7C12.5523 7 13 7.44771 13 8V11H16C16.5523 11 17 11.4477 17 12C17 12.5523 16.5523 13 16 13H13V16C13 16.5523 12.5523 17 12 17C11.4477 17 11 16.5523 11 16V13H8C7.44772 13 7 12.5523 7 12C7 11.4477 7.44771 11 8 11H11V8Z"
                  />
                </svg>
                   
              </button>
              <button
                onClick={() => handleMapSettingsClick()}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white shadow-lg hover:bg-blue-700"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
                   
              </button>
            </div>
          )}
                    {/*Emer*/}   
          {!legendVisible && !settingsOpen && !signalOpen && (
            <button
              onClick={() => setrequestOpen(!requestOpen)}
              className="relative flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-white shadow-lg hover:bg-red-700"
            >
              {emergencyRequests.length > 0 && (
                <>
                  <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full border-2 border-white bg-red-500" />
                  {/*<span className="absolute -top-2.75 -right-2 h-5 w-5 text-red-500 text-center" >{emergencyRequests.length}</span>*/}
                  <span className="absolute -top-2 -right-2 h-5 w-5 animate-ping rounded-full bg-red-500" />
                </>
              )}
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
                 
            </button>
          )}
                    {/*Signal*/} 
          {!legendVisible && !settingsOpen && !requestOpen && (
            <button
              onClick={() => setsignalOpen(!signalOpen)}
              className="relative flex items-center gap-2 rounded-lg bg-yellow-500 px-6 py-3 text-white shadow-lg hover:bg-yellow-600"
            >
              {LightRequest.length > 0 && (
                <>
                  <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full border-2 border-white bg-red-500" />
                  {/*<span className="absolute -top-2.75 -right-2 h-5 w-5 text-red-500 text-center" >{emergencyRequests.length}</span>*/}
                  <span className="absolute -top-2 -right-2 h-5 w-5 animate-ping rounded-full bg-red-500" />
                </>
              )}
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
                 
            </button>
          )}
                    {/*Emer re*/} 
          {requestOpen && (
            <div className="max-h-80 max-w-md overflow-y-auto rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">
                                        Emergency Requests                
                  </h3>
                  <button
                    onClick={() => setrequestOpen(false)}
                    className="text-xl text-gray-500 hover:text-gray-700"
                  >
                                        ×
                  </button>
                </div>
                <div className="max-h-96 space-y-3 overflow-y-auto">
                  {emergencyRequests.map((request) => (
                    <div
                      key={request.id}
                      className="rounded-md border border-gray-200 p-3 hover:bg-gray-50"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <div className="font-semibold text-gray-800">
                                                    {request.location}         
                        </div>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-bold ${
                            request.status === 'Active'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                                                    {request.status}           
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>
                                                    <strong>Reason:</strong>
                          {request.reason}               
                        </p>
                        <p>
                                                    <strong>Time:</strong>
                          {request.time}   
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
                    {/*Signal off*/}   
          {signalOpen && (
            <div className="max-h-80 max-w-md overflow-y-auto rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">
                                        Offline Signals
                  </h3>
                  <button
                    onClick={() => setsignalOpen(false)}
                    className="text-xl text-gray-500 hover:text-gray-700"
                  ></button>
                </div>
                <div className="max-h-96 space-y-3 overflow-y-auto">
                  {LightRequest.length > 0 ? (
                    LightRequest.map((LR) => (
                      <div
                        key={LR.traffic_light_id}
                        className="rounded-md border border-yellow-200 bg-yellow-50 p-3 hover:bg-yellow-100"
                      >
                        <div className="mb-2 flex items-start justify-between">
                          <div className="font-semibold text-gray-800">
                            Traffic Light NO.
                            {LR.traffic_light_id}   
                          </div>
                          <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-bold text-yellow-700">
                                                        Offline                
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>
                                                        <strong>Reason:</strong>
                            {LR.reason}   
                          </p>
                          <p>
                            <strong>Request by</strong> {LR.requested_by}       
                          </p>
                          <p>
                            <strong>Last Seen:</strong> {LR.requested_at}       
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="py-4 text-center text-gray-500">
                                            No offline signals                  
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        <MapSettingsDialog
          open={showSettings}
          onClose={handleCloseSettings}
          onSave={handleSaveSettings}
          currentSettings={settings}
        />

        {/* Light Editor Dialog */}
        {editingLight && (
          <LightEditorDialog
            open={showLightEditor}
            onClose={() => {
              setShowLightEditor(false);
              setEditingLight(null);
            }}
            onSave={handleSaveLightSettings}
            lightKey={editingLight.trafficLightId || ''}
            initialGreenDuration={
              editingLight.trafficLightId &&
              trafficLightsData[editingLight.trafficLightId]
                ? parseInt(
                    trafficLightsData[editingLight.trafficLightId].green_duration
                  ) || 27
                : 27
            }
            initialYellowDuration={
              editingLight.trafficLightId &&
              trafficLightsData[editingLight.trafficLightId]
                ? parseInt(
                    trafficLightsData[editingLight.trafficLightId].yellow_duration
                  ) || 3
                : 3
            }
            initialStatus={
              editingLight.trafficLightId &&
              trafficLightsData[editingLight.trafficLightId]
                ? parseInt(
                    trafficLightsData[editingLight.trafficLightId].status
                  ) || 0
                : 0
            }
            direction={editingLight.direction}
            junctionId={editingLight.junctionId}
            onForceGreen={handleForceGreen}
          />
        )}
      </div>
    </div>
  );
}
