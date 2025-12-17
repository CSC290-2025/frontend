import { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from '@vis.gl/react-google-maps';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { Navigation } from 'lucide-react';
import ControlPanel from '../components/ControlPanel';
import MapSettingsDialog from '../components/MapSettingsDialog';
import EmergencyVehicleMarker from '../components/EmergencyVehicleMarker';
import TrafficLegend from '../components/TrafficLegend';
import TrafficSidebar from '../components/TrafficSidebar';
import { useEmergencyVehicles } from '../hooks/useEmergencyVehicles';
import { useEmergencyTrafficControl } from '../hooks/useEmergencyTrafficControl';
import { useTrafficLightCycle } from '../hooks/useTrafficLightCycle';
import {
  colorNumberToString,
  getLightDuration,
  COLOR_GREEN,
  COLOR_YELLOW,
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

function useTeam10TrafficSignals(refreshRate: number) {
  const [signals, setSignals] = useState<SignalWithMeta[]>([]);
  const [trafficLightsData, setTrafficLightsData] = useState<
    Record<string, any>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

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
            setLastUpdate(Date.now());
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

    const interval = setInterval(() => {
      setLastUpdate(Date.now());
    }, refreshRate * 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [refreshRate]);

  return { signals, loading, error, lastUpdate, trafficLightsData };
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

    // Determine background color - gray for broken/fixing/emergency, normal color otherwise
    const backgroundColor =
      isBrokenOrFixing || isEmergencyControlled
        ? '#6b7280'
        : colorMap[signal.color];

    // Show "--" for stopped, broken/fixing, or emergency controlled lights
    const showDash = isStopped || isBrokenOrFixing || isEmergencyControlled;

    return (
      <AdvancedMarker
        position={{ lat: signal.lat, lng: signal.lng }}
        title={`Junction: ${signal.junctionId} | Direction: ${signal.direction}${isStopped ? ' (STOPPED)' : ''}${isBrokenOrFixing ? ` (${statusLabel})` : ''}${isEmergencyControlled ? ' (EMERGENCY)' : ''}`}
        onClick={onClick}
        ref={(marker) => setMarkerRef && setMarkerRef(marker, markerKey)}
      >
        <div className="flex cursor-pointer flex-col items-center">
          <div
            className={`flex items-center justify-center rounded-full shadow-lg ${
              isSelected
                ? 'border-4 border-blue-500 ring-4 ring-blue-300'
                : isBrokenOrFixing || isEmergencyControlled
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
                  : isEmergencyControlled
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-800'
            }`}
          >
            {isBrokenOrFixing
              ? statusLabel
              : isEmergencyControlled
                ? 'EMERGENCY'
                : signal.junctionId}
          </div>
        </div>
      </AdvancedMarker>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison to prevent flickering - only re-render when visually relevant props change
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

interface MapContentProps {
  settings: MapSettings;
  userLocation: { lat: number; lng: number } | null;
  selectedSignal: SignalWithMeta | null;
  onSignalClick: (signal: SignalWithMeta) => void;
  signals: SignalWithMeta[];
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
    let filtered = signals;

    // Filter out broken/fixing lights if showBrokenLights is false
    if (!showBrokenLights) {
      filtered = filtered.filter(
        (s) => s.status === 0 || s.status === undefined
      );
    }

    // Filter by distance if user location and visibility range are set
    if (userLocation && settings.visibilityRange > 0) {
      filtered = filtered.filter((signal) => {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          signal.lat,
          signal.lng
        );
        return distance <= settings.visibilityRange;
      });
    }

    return filtered;
  }, [signals, userLocation, settings.visibilityRange, showBrokenLights]);

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
      map.panTo({ lat: selectedSignal.lat, lng: selectedSignal.lng });
      map.setZoom(18);
    }
  }, [map, selectedSignal]);

  // Debounce clusterer update to prevent flickering
  const clustererUpdateTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

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
        const isEmergencyControlled =
          emergencyControlledIntersections.has(interid);

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

      {emergencyVehicles.map((vehicle) => (
        <EmergencyVehicleMarker key={vehicle.vehicleId} vehicle={vehicle} />
      ))}

      <TrafficLegend
        totalLights={signals.length}
        activeLights={
          visibleSignals.filter((s) => s.online && s.status === 0).length
        }
        brokenLights={
          signals.filter((s) => s.status === 1 || s.status === 2).length
        }
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
    </>
  );
}

export default function TrafficMapPage() {
  const apiKey = import.meta.env.VITE_G10_GOOGLE_MAPS_API_KEY;
  const [currentLocation, setCurrentLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedSignal, setSelectedSignal] = useState<SignalWithMeta | null>(
    null
  );

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

  // Fetch traffic signals from Firebase (reads from traffic_lights only)
  const { signals, loading, error } = useTeam10TrafficSignals(
    settings.refreshRate
  );

  // Manage traffic light cycles with Firebase sync (only one controller across all instances)
  useTrafficLightCycle();

  // Emergency stop state
  const [emergencyStopAll, setEmergencyStopAll] = useState(false);
  const [stoppedIntersections, setStoppedIntersections] = useState<Set<number>>(
    new Set()
  );
  const [
    emergencyControlledIntersections,
    setEmergencyControlledIntersections,
  ] = useState<Set<number>>(new Set());

  // Listen to emergency stop state from Firebase
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

  const handleStart = async () => {
    alert('Navigation feature is currently disabled (Geocoding API not free)');
  };

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

  const handleUserLocationUpdate = useCallback(
    (location: { lat: number; lng: number }) => {
      setUserLocation(location);
    },
    []
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
    <div className="flex h-screen w-full">
      {/* Enhanced Sidebar - Fixed width column */}
      <div className="w-96 flex-shrink-0">
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

      {/* Map area - Takes remaining space */}
      <div className="flex flex-1 flex-col">
        <div className="flex h-full w-full flex-col bg-gray-100 p-6">
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
                  onMapReady={setMapInstance}
                  showBrokenLights={showBrokenLights}
                  legendVisible={legendVisible}
                  onToggleLegend={handleToggleLegend}
                  onUserLocationUpdate={handleUserLocationUpdate}
                  emergencyStopAll={emergencyStopAll}
                  stoppedIntersections={stoppedIntersections}
                  emergencyControlledIntersections={
                    emergencyControlledIntersections
                  }
                />
              </Map>
            </APIProvider>
          </div>
        </div>

        <ControlPanel
          className="top-0"
          onMapSettingsClick={handleMapSettingsClick}
        />

        <MapSettingsDialog
          open={showSettings}
          onClose={handleCloseSettings}
          onSave={handleSaveSettings}
          currentSettings={settings}
        />
      </div>
    </div>
  );
}
