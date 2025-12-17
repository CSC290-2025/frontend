import { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from '@vis.gl/react-google-maps';
import { ref, onValue, update } from 'firebase/database';
import { database } from '@/lib/firebase';
import { apiClient } from '@/lib/apiClient';
import { useEmergencyVehicles } from '../hooks/useEmergencyVehicles';
import { useTrafficLightCycle } from '../hooks/useTrafficLightCycle';
import EmergencyVehicleMarker from '../components/EmergencyVehicleMarker';
import MapSettingsDialog from '../components/MapSettingsDialog';
import LightEditorDialog from '../components/LightEditorDialog';
import AddLightDialog from '../components/AddLightDialog';
import AddIntersectionDialog from '../components/AddIntersectionDialog';
import {
  Activity,
  AlertTriangle,
  Settings,
  MapPin,
  Search,
  Eye,
  EyeOff,
  PlayCircle,
  StopCircle,
  Navigation,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  colorNumberToString,
  getLightDuration,
  groupLightsByIntersection,
  calculateIntersectionLightDurations,
  calculateRedLightRemainingTime,
  sortLightsByRoadId,
  COLOR_GREEN,
  COLOR_YELLOW,
  COLOR_RED,
} from '../utils/trafficLightCalculations';

interface TrafficSignal {
  color: 'red' | 'yellow' | 'green';
  direction: string;
  lat: number;
  lng: number;
  online: boolean;
  remainingTime: number;
  timestamp: number;
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

interface MapContentProps {
  signals: TrafficSignal[];
  emergencyVehicles: any[];
  onSignalClick: (signal: TrafficSignal) => void;
  selectedSignal: TrafficSignal | null;
  onMapReady?: (map: google.maps.Map | null) => void;
  emergencyStopAll?: boolean;
  stoppedJunctions?: Set<string>;
  emergencyMode?: string | null;
  emergencyControlledIntersections?: Set<string>;
  isPickingPosition?: boolean;
  onMapClick?: (lat: number, lng: number) => void;
}

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

function useTeam10TrafficSignals() {
  const [signals, setSignals] = useState<TrafficSignal[]>([]);
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

            const allSignals: TrafficSignal[] = [];

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

const TrafficSignalMarker = memo(
  function TrafficSignalMarker({
    signal,
    isSelected,
    onClick,
    isStopped,
    isEmergencyAllRed,
  }: {
    signal: TrafficSignal;
    isSelected: boolean;
    onClick: () => void;
    isStopped?: boolean;
    isEmergencyAllRed?: boolean;
  }) {
    const colorMap = {
      red: '#ef4444',
      yellow: '#fbbf24',
      green: '#22c55e',
    };

    if (!signal.online) return null;

    // Check if light is broken (status=1) or fixing (status=2)
    const isBrokenOrFixing = signal.status === 1 || signal.status === 2;
    const statusLabel =
      signal.status === 1 ? 'BROKEN' : signal.status === 2 ? 'FIXING' : '';

    // Determine background color - gray for broken/fixing, normal color otherwise
    const backgroundColor = isBrokenOrFixing
      ? '#6b7280'
      : colorMap[signal.color];

    // Show "--" for stopped, broken/fixing, or emergency all-red mode lights
    const showDash = isStopped || isBrokenOrFixing || isEmergencyAllRed;

    return (
      <AdvancedMarker
        position={{ lat: signal.lat, lng: signal.lng }}
        title={`Junction: ${signal.junctionId} | Direction: ${signal.direction}${isStopped ? ' (STOPPED)' : ''}${isBrokenOrFixing ? ` (${statusLabel})` : ''}`}
        onClick={onClick}
      >
        <div className="flex cursor-pointer flex-col items-center">
          <div
            className={`flex items-center justify-center rounded-full border-4 shadow-lg ${
              isSelected
                ? 'border-slate-700 ring-4 ring-slate-300'
                : isBrokenOrFixing
                  ? 'border-gray-400'
                  : 'border-white'
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
                ? 'bg-slate-800 text-white'
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
      prevProps.isEmergencyAllRed === nextProps.isEmergencyAllRed
    );
  }
);

function MapContent({
  signals,
  emergencyVehicles,
  onSignalClick,
  selectedSignal,
  onMapReady,
  emergencyStopAll,
  stoppedJunctions,
  emergencyMode,
  emergencyControlledIntersections,
  isPickingPosition,
  onMapClick,
}: MapContentProps) {
  const map = useMap();
  const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false);

  // Notify parent when map is ready
  useEffect(() => {
    if (map && onMapReady) {
      onMapReady(map);
    }
  }, [map, onMapReady]);

  // Handle map click for position picking
  useEffect(() => {
    if (!map || !isPickingPosition || !onMapClick) return;

    const listener = map.addListener(
      'click',
      (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          onMapClick(e.latLng.lat(), e.latLng.lng());
        }
      }
    );

    // Change cursor to crosshair when picking
    map.setOptions({ draggableCursor: 'crosshair' });

    return () => {
      google.maps.event.removeListener(listener);
      map.setOptions({ draggableCursor: null });
    };
  }, [map, isPickingPosition, onMapClick]);

  useEffect(() => {
    if (map && selectedSignal) {
      map.panTo({ lat: selectedSignal.lat, lng: selectedSignal.lng });
      map.setZoom(18);
    }
  }, [map, selectedSignal]);

  // Handle jump to current location
  const handleJumpToLocation = useCallback(() => {
    if (!map) return;

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = { lat: latitude, lng: longitude };

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
  }, [map]);

  return (
    <>
      {/* Traffic Signal Markers */}
      {signals.map((signal) => {
        const isStopped =
          emergencyStopAll || stoppedJunctions?.has(signal.junctionId);
        // Check if this intersection is under emergency control (any mode)
        const isEmergencyControlled = emergencyControlledIntersections?.has(
          signal.junctionId
        );
        return (
          <TrafficSignalMarker
            key={`${signal.junctionId}-${signal.direction}`}
            signal={signal}
            isSelected={
              selectedSignal?.junctionId === signal.junctionId &&
              selectedSignal?.direction === signal.direction
            }
            onClick={() => onSignalClick(signal)}
            isStopped={isStopped}
            isEmergencyAllRed={isEmergencyControlled}
          />
        );
      })}

      {/* Emergency Vehicle Markers */}
      {emergencyVehicles.map((vehicle) => (
        <EmergencyVehicleMarker key={vehicle.vehicleId} vehicle={vehicle} />
      ))}

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

export default function TrafficControlPage() {
  const apiKey = import.meta.env.VITE_G10_GOOGLE_MAPS_API_KEY;
  const { signals, loading, error, trafficLightsData } =
    useTeam10TrafficSignals();
  const { vehicles: emergencyVehicles } = useEmergencyVehicles();

  // Manage traffic light cycles with Firebase sync (only one controller across all instances)
  useTrafficLightCycle();

  const [selectedSignal, setSelectedSignal] = useState<TrafficSignal | null>(
    null
  );
  const [filter, setFilter] = useState<'all' | 'red' | 'yellow' | 'green'>(
    'all'
  );
  const [editingLight, setEditingLight] = useState<TrafficSignal | null>(null);
  const [showLightEditor, setShowLightEditor] = useState(false);

  // Add light/intersection dialog state
  const [showAddLightDialog, setShowAddLightDialog] = useState(false);
  const [showAddIntersectionDialog, setShowAddIntersectionDialog] =
    useState(false);
  const [addLightJunctionId, setAddLightJunctionId] = useState<string>('');
  const [isPickingPosition, setIsPickingPosition] = useState(false);
  const [pickedPosition, setPickedPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Load broken lights visibility from localStorage
  const BROKEN_LIGHTS_STORAGE_KEY =
    'smartcity_traffic_control_show_broken_lights_v1';
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
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [emergencyStopAll, setEmergencyStopAll] = useState(false);
  const [stoppedJunctions, setStoppedJunctions] = useState<Set<string>>(
    new Set()
  );

  // Emergency ambulance control state
  const [emergencyMode, setEmergencyMode] = useState<string | null>(null);
  const [
    emergencyControlledIntersections,
    setEmergencyControlledIntersections,
  ] = useState<Set<string>>(new Set());

  // Ref for auto-scrolling to selected light in sidebar
  const lightItemsRef = useRef<Record<string, HTMLDivElement | null>>({});

  // Auto-scroll to selected light in sidebar
  useEffect(() => {
    if (selectedSignal?.trafficLightId) {
      const element = lightItemsRef.current[selectedSignal.trafficLightId];
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [selectedSignal?.trafficLightId]);

  // Listen to emergency stop state from Firebase
  useEffect(() => {
    const emergencyStopRef = ref(database, 'teams/10/emergency-stop');
    const stoppedIntersectionsRef = ref(
      database,
      'teams/10/stopped-intersections'
    );
    const emergencyModeRef = ref(database, 'teams/10/emergency-mode');
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
          // Convert interid keys to junction ID format (e.g., "3" -> "Inter-3")
          const junctionIds = Object.keys(data)
            .filter((key) => data[key] === true)
            .map((key) => `Inter-${key}`);
          setStoppedJunctions(new Set(junctionIds));
        } else {
          setStoppedJunctions(new Set());
        }
      }
    );

    const unsubscribeEmergencyMode = onValue(emergencyModeRef, (snapshot) => {
      const value = snapshot.val();
      setEmergencyMode(value || null);
    });

    const unsubscribeEmergencyControlled = onValue(
      emergencyControlledRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const junctionIds = Object.keys(data)
            .filter((key) => data[key] === true)
            .map((key) => `Inter-${key}`);
          setEmergencyControlledIntersections(new Set(junctionIds));
        } else {
          setEmergencyControlledIntersections(new Set());
        }
      }
    );

    return () => {
      unsubscribeEmergencyStop();
      unsubscribeStoppedIntersections();
      unsubscribeEmergencyMode();
      unsubscribeEmergencyControlled();
    };
  }, []);

  // Load settings from localStorage with unique key
  const STORAGE_KEY = 'smartcity_traffic_control_map_settings_v1';
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

  const handleSignalClick = useCallback(
    (signal: TrafficSignal) => {
      setSelectedSignal(signal);

      // Pan to the signal location
      if (mapInstance) {
        mapInstance.panTo({ lat: signal.lat, lng: signal.lng });
        mapInstance.setZoom(18);
      }

      // Don't auto-open dialog - user must click control button
    },
    [mapInstance]
  );

  const handleEditLight = useCallback((signal: TrafficSignal) => {
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
        // Get previous status and light data
        const lightData = trafficLightsData[lightKey];
        const previousStatus = parseInt(lightData?.status) || 0;
        const lat = parseFloat(lightData?.lat) || 0;
        const lng = parseFloat(lightData?.lng) || 0;
        const interid = parseInt(lightData?.interid) || 0;
        const roadid = parseInt(lightData?.roadid) || 0;
        const supportMarkerId = lightData?.support_marker_id;

        const updates: Record<string, any> = {
          [`teams/10/traffic_lights/${lightKey}/green_duration`]: greenDuration,
          [`teams/10/traffic_lights/${lightKey}/yellow_duration`]:
            yellowDuration,
          [`teams/10/traffic_lights/${lightKey}/status`]: status,
        };

        // Handle marker API integration for status changes
        // When status changes to broken (1) or fixing (2), create a support marker
        if (previousStatus === 0 && (status === 1 || status === 2)) {
          try {
            const statusLabel = status === 1 ? 'BROKEN' : 'FIXING';
            const response = await apiClient.post('/api/markers', {
              description: `Traffic Light ${statusLabel} - Inter-${interid} Road-${roadid}`,
              marker_type_id: 2,
              location: { lat, lng },
            });

            // API returns { success, data: { id, ... }, message }
            const markerId = response.data?.data?.id;
            if (markerId) {
              updates[`teams/10/traffic_lights/${lightKey}/support_marker_id`] =
                markerId;
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
              updates[`teams/10/traffic_lights/${lightKey}/support_marker_id`] =
                null;
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

  // Position picking handlers
  const handleStartPickingPosition = useCallback(() => {
    setIsPickingPosition(true);
    setPickedPosition(null);
  }, []);

  const handleStopPickingPosition = useCallback(() => {
    setIsPickingPosition(false);
  }, []);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setPickedPosition({ lat, lng });
  }, []);

  // Add intersection handler
  const handleAddIntersection = useCallback(
    async (intersectionId: number, lat: number, lng: number) => {
      try {
        const lightKey = `inter${intersectionId}_road1`;
        const updates: Record<string, any> = {
          [`teams/10/traffic_lights/${lightKey}`]: {
            interid: intersectionId,
            roadid: 1,
            lat,
            lng,
            color: COLOR_GREEN,
            remaintime: 30,
            green_duration: 27,
            yellow_duration: 3,
            status: 0,
            autoON: true,
            timestamp: new Date().toISOString(),
            marker_id: lightKey,
          },
        };

        await update(ref(database), updates);
        setShowAddIntersectionDialog(false);
        setPickedPosition(null);
      } catch (err) {
        console.error('Failed to add intersection:', err);
      }
    },
    []
  );

  // Add light to existing junction handler
  const handleAddLight = useCallback(
    async (junctionId: string, roadId: number, lat: number, lng: number) => {
      try {
        const interid = parseInt(junctionId.replace('Inter-', ''));
        const lightKey = `inter${interid}_road${roadId}`;

        const updates: Record<string, any> = {};

        // First, add the new light
        updates[`teams/10/traffic_lights/${lightKey}`] = {
          interid,
          roadid: roadId,
          lat,
          lng,
          color: COLOR_RED,
          remaintime: 0,
          green_duration: 27,
          yellow_duration: 3,
          status: 0,
          autoON: true,
          timestamp: new Date().toISOString(),
          marker_id: lightKey,
        };

        // Write the new light first
        await update(ref(database), updates);

        // Now stop and restart the intersection cycle with the new light included
        // This ensures proper timing calculations
        const stopUpdates: Record<string, any> = {
          [`teams/10/stopped-intersections/${interid}`]: true,
        };
        await update(ref(database), stopUpdates);

        // Small delay to ensure stop is processed
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Restart with all lights (including new one)
        const restartUpdates: Record<string, any> = {
          [`teams/10/stopped-intersections/${interid}`]: null,
        };

        // Re-fetch to include the new light we just added
        const intersections = groupLightsByIntersection({
          ...trafficLightsData,
          [lightKey]: {
            interid,
            roadid: roadId,
            green_duration: 27,
            yellow_duration: 3,
          },
        });
        const allLights = intersections[interid];

        if (allLights && allLights.length > 0) {
          const sortedLights = sortLightsByRoadId(allLights);
          const firstLight = sortedLights[0];
          const lightDurations =
            calculateIntersectionLightDurations(sortedLights);
          const { greenDuration, yellowDuration } =
            getLightDuration(firstLight);

          // Set first light to green, others to red with proper stacked times
          sortedLights.forEach((light, idx) => {
            const isActive = idx === 0;
            const redTime = isActive
              ? 0
              : calculateRedLightRemainingTime(lightDurations, 0, idx);

            restartUpdates[`teams/10/traffic_lights/${light.key}/color`] =
              isActive ? COLOR_GREEN : COLOR_RED;
            restartUpdates[`teams/10/traffic_lights/${light.key}/remaintime`] =
              isActive ? greenDuration + yellowDuration : redTime;
            restartUpdates[`teams/10/traffic_lights/${light.key}/timestamp`] =
              new Date().toISOString();
          });
        }

        await update(ref(database), restartUpdates);

        setShowAddLightDialog(false);
        setAddLightJunctionId('');
        setPickedPosition(null);
      } catch (err) {
        console.error('Failed to add light:', err);
      }
    },
    [trafficLightsData]
  );

  // Remove light handler
  const handleRemoveLight = useCallback(
    async (signal: TrafficSignal) => {
      if (!signal.trafficLightId) return;

      const confirmDelete = window.confirm(
        `Are you sure you want to remove ${signal.direction} from ${signal.junctionId}?`
      );
      if (!confirmDelete) return;

      try {
        // Check if this light has a support marker to delete
        const lightData = trafficLightsData[signal.trafficLightId];
        const supportMarkerId = lightData?.support_marker_id;

        if (supportMarkerId) {
          try {
            await apiClient.delete(`/api/markers/${supportMarkerId}`);
          } catch (markerErr) {
            console.error('Failed to delete support marker:', markerErr);
          }
        }

        // Remove the light from Firebase
        await update(ref(database), {
          [`teams/10/traffic_lights/${signal.trafficLightId}`]: null,
        });

        // Clear selection if this was selected
        if (selectedSignal?.trafficLightId === signal.trafficLightId) {
          setSelectedSignal(null);
        }
      } catch (err) {
        console.error('Failed to remove light:', err);
      }
    },
    [trafficLightsData, selectedSignal]
  );

  // Open add light dialog for a junction
  const handleOpenAddLightDialog = useCallback((junctionId: string) => {
    setAddLightJunctionId(junctionId);
    setShowAddLightDialog(true);
    setPickedPosition(null);
  }, []);

  // Get existing intersection IDs
  const existingIntersectionIds = useMemo(() => {
    const ids = new Set<number>();
    signals.forEach((s) => {
      const interid = parseInt(s.junctionId.replace('Inter-', ''));
      if (!isNaN(interid)) ids.add(interid);
    });
    return Array.from(ids);
  }, [signals]);

  // Get existing road IDs for a junction
  const getExistingRoadIds = useCallback(
    (junctionId: string) => {
      return signals
        .filter((s) => s.junctionId === junctionId)
        .map((s) => parseInt(s.direction.replace('Road-', '')))
        .filter((id) => !isNaN(id));
    },
    [signals]
  );

  // Get existing light positions for a junction
  const getExistingLightPositions = useCallback(
    (junctionId: string) => {
      return signals
        .filter((s) => s.junctionId === junctionId)
        .map((s) => ({
          lat: s.lat,
          lng: s.lng,
          direction: s.direction,
        }));
    },
    [signals]
  );

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

  const handleEmergencyStopAll = useCallback(async () => {
    try {
      const updates: Record<string, any> = {
        'teams/10/emergency-stop': true,
      };

      // Set all traffic lights to red
      Object.keys(trafficLightsData).forEach((lightKey) => {
        updates[`teams/10/traffic_lights/${lightKey}/color`] = COLOR_RED;
        updates[`teams/10/traffic_lights/${lightKey}/remaintime`] = 0;
      });

      await update(ref(database), updates);
      setEmergencyStopAll(true);
    } catch (err) {
      console.error('Failed to set emergency stop:', err);
    }
  }, [trafficLightsData]);

  const handleStartAll = useCallback(async () => {
    try {
      // Reset all intersection cycles to start fresh
      const resetUpdates: Record<string, any> = {
        'teams/10/emergency-stop': false,
        'teams/10/stopped-intersections': {},
      };

      // Group traffic lights by intersection
      const intersections = groupLightsByIntersection(trafficLightsData);

      // Reset each intersection's cycle using unified calculation
      Object.entries(intersections).forEach(([interidStr, lights]) => {
        if (lights.length === 0) return;

        const sortedLights = sortLightsByRoadId(lights);
        const firstLight = sortedLights[0];
        const lightDurations =
          calculateIntersectionLightDurations(sortedLights);
        const { greenDuration, yellowDuration } = getLightDuration(firstLight);

        // Set first light to green, others to red with stacked times
        sortedLights.forEach((light, idx) => {
          const isActive = idx === 0;
          const redTime = isActive
            ? 0
            : calculateRedLightRemainingTime(lightDurations, 0, idx);

          resetUpdates[`teams/10/traffic_lights/${light.key}/color`] = isActive
            ? COLOR_GREEN
            : COLOR_RED;
          resetUpdates[`teams/10/traffic_lights/${light.key}/remaintime`] =
            isActive ? greenDuration + yellowDuration : redTime;
          resetUpdates[`teams/10/traffic_lights/${light.key}/timestamp`] =
            new Date().toISOString();
        });
      });

      await update(ref(database), resetUpdates);
      setEmergencyStopAll(false);
      setStoppedJunctions(new Set());
    } catch (err) {
      console.error('Failed to start all:', err);
    }
  }, [trafficLightsData]);

  const handleStopJunction = useCallback(
    async (junctionId: string) => {
      try {
        // Extract interid from junctionId (e.g., "Inter-3" -> 3)
        const interid = parseInt(junctionId.replace('Inter-', ''));

        const updates: Record<string, any> = {
          [`teams/10/stopped-intersections/${interid}`]: true,
        };

        // Set all lights in this intersection to red
        const intersections = groupLightsByIntersection(trafficLightsData);
        const lights = intersections[interid];

        if (lights && lights.length > 0) {
          lights.forEach((light) => {
            updates[`teams/10/traffic_lights/${light.key}/color`] = COLOR_RED;
            updates[`teams/10/traffic_lights/${light.key}/remaintime`] = 0;
          });
        }

        await update(ref(database), updates);
        setStoppedJunctions((prev) => new Set(prev).add(junctionId));
      } catch (err) {
        console.error('Failed to stop junction:', err);
      }
    },
    [trafficLightsData]
  );

  const handleStartJunction = useCallback(
    async (junctionId: string) => {
      try {
        // Extract interid from junctionId (e.g., "Inter-3" -> 3)
        const interid = parseInt(junctionId.replace('Inter-', ''));

        const resetUpdates: Record<string, any> = {
          [`teams/10/stopped-intersections/${interid}`]: null,
        };

        // Group traffic lights and find this intersection
        const intersections = groupLightsByIntersection(trafficLightsData);
        const lights = intersections[interid];

        if (lights && lights.length > 0) {
          const sortedLights = sortLightsByRoadId(lights);
          const firstLight = sortedLights[0];
          const lightDurations =
            calculateIntersectionLightDurations(sortedLights);
          const { greenDuration, yellowDuration } =
            getLightDuration(firstLight);

          // Set first light to green, others to red with stacked times
          sortedLights.forEach((light, idx) => {
            const isActive = idx === 0;
            const redTime = isActive
              ? 0
              : calculateRedLightRemainingTime(lightDurations, 0, idx);

            resetUpdates[`teams/10/traffic_lights/${light.key}/color`] =
              isActive ? COLOR_GREEN : COLOR_RED;
            resetUpdates[`teams/10/traffic_lights/${light.key}/remaintime`] =
              isActive ? greenDuration + yellowDuration : redTime;
            resetUpdates[`teams/10/traffic_lights/${light.key}/timestamp`] =
              new Date().toISOString();
          });
        }

        await update(ref(database), resetUpdates);
        setStoppedJunctions((prev) => {
          const newSet = new Set(prev);
          newSet.delete(junctionId);
          return newSet;
        });
      } catch (err) {
        console.error('Failed to start junction:', err);
      }
    },
    [trafficLightsData]
  );

  const stats = useMemo(() => {
    const total = signals.length;
    const red = signals.filter(
      (s) => s.color === 'red' && s.status !== 1 && s.status !== 2
    ).length;
    const yellow = signals.filter(
      (s) => s.color === 'yellow' && s.status !== 1 && s.status !== 2
    ).length;
    const green = signals.filter(
      (s) => s.color === 'green' && s.status !== 1 && s.status !== 2
    ).length;
    const offline = signals.filter((s) => !s.online).length;
    const broken = signals.filter(
      (s) => s.status === 1 || s.status === 2
    ).length;

    return { total, red, yellow, green, offline, broken };
  }, [signals]);

  const filteredSignals = useMemo(() => {
    let filtered = signals;

    if (filter !== 'all') {
      filtered = filtered.filter((s) => s.color === filter);
    }

    // Apply search query
    if (junctionSearchQuery.trim()) {
      const query = junctionSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.junctionId.toLowerCase().includes(query) ||
          s.direction.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [signals, filter, junctionSearchQuery]);

  const junctions = useMemo(() => {
    const junctionGroups: Record<string, TrafficSignal[]> = {};
    signals.forEach((signal) => {
      if (!junctionGroups[signal.junctionId]) {
        junctionGroups[signal.junctionId] = [];
      }
      junctionGroups[signal.junctionId].push(signal);
    });
    return Object.entries(junctionGroups);
  }, [signals]);

  const initialCenter = { lat: 13.647372072504554, lng: 100.49553588244684 };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-800 border-t-transparent"></div>
          <p className="text-gray-600">Loading traffic control system...</p>
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
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="flex w-96 flex-col overflow-hidden border-r border-gray-200 bg-white shadow-lg">
        {/* Header */}
        <div className="border-b border-gray-200 bg-slate-900 p-6 text-white">
          <div className="mb-2 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Traffic Control</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddIntersectionDialog(true)}
                className="rounded-lg bg-green-600 p-2 transition hover:bg-green-700"
                title="Add New Intersection"
              >
                <Plus className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="rounded-lg p-2 transition hover:bg-slate-800"
                title="Map Settings"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
          <p className="text-sm text-slate-300">
            Manage traffic lights in real-time
          </p>

          {/* Emergency Stop/Start Controls */}
          <div className="mt-4 flex gap-2">
            {emergencyStopAll ? (
              <button
                onClick={handleStartAll}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold transition hover:bg-green-700"
              >
                <PlayCircle className="h-4 w-4" />
                Start All Systems
              </button>
            ) : (
              <button
                onClick={handleEmergencyStopAll}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold transition hover:bg-red-700"
              >
                <StopCircle className="h-4 w-4" />
                Emergency Stop All
              </button>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="border-b border-gray-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">
            System Status
          </h2>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <Activity className="h-4 w-4 text-slate-600" />
                <span className="text-2xl font-bold text-gray-800">
                  {stats.total}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-600">Total Lights</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <span className="text-2xl font-bold text-gray-800">
                  {stats.red}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-600">Red</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <span className="text-2xl font-bold text-gray-800">
                  {stats.yellow}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-600">Yellow</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-2xl font-bold text-gray-800">
                  {stats.green}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-600">Green</p>
            </div>
            <div className="col-span-2 rounded-lg bg-gray-100 p-3">
              <div className="flex items-center justify-between">
                <AlertTriangle className="h-4 w-4 text-gray-600" />
                <span className="text-2xl font-bold text-gray-800">
                  {stats.broken}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-600">Broken / Fixing</p>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="border-b border-gray-200 bg-white px-4 py-3">
          <span className="text-sm font-medium text-gray-700">
            Traffic Signals ({filteredSignals.length})
          </span>
        </div>

        {/* Search Bar */}
        <div className="border-b border-gray-200 bg-white p-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search junction..."
              value={junctionSearchQuery}
              onChange={(e) => setJunctionSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pr-3 pl-10 text-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Filter */}
        <div className="border-b border-gray-200 bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">
              Filter by Status
            </h2>
            <button
              onClick={handleToggleBrokenLights}
              className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition ${
                showBrokenLights
                  ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {showBrokenLights ? (
                <Eye className="h-3 w-3" />
              ) : (
                <EyeOff className="h-3 w-3" />
              )}
              Broken Lights
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                filter === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('red')}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                filter === 'red'
                  ? 'bg-slate-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Red
            </button>
            <button
              onClick={() => setFilter('yellow')}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                filter === 'yellow'
                  ? 'bg-slate-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Yellow
            </button>
            <button
              onClick={() => setFilter('green')}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                filter === 'green'
                  ? 'bg-slate-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Green
            </button>
          </div>
        </div>

        {/* Content - Junctions */}
        <div className="flex-1 overflow-y-auto p-4">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">
            Junctions ({junctions.length})
          </h2>
          <div className="space-y-2">
            {junctions.map(([junctionId, junctionSignals]) => {
              const isJunctionStopped =
                emergencyStopAll || stoppedJunctions.has(junctionId);
              // Check if this junction is under emergency control (any mode)
              const isJunctionEmergencyControlled =
                emergencyControlledIntersections.has(junctionId);

              return (
                <div
                  key={junctionId}
                  className={`rounded-lg border p-3 shadow-sm transition ${
                    isJunctionStopped
                      ? 'border-red-300 bg-red-50'
                      : isJunctionEmergencyControlled
                        ? 'border-orange-300 bg-orange-50'
                        : 'border-gray-200 bg-white hover:shadow-md'
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-600" />
                      <span className="font-semibold text-gray-800">
                        {junctionId}
                      </span>
                      {isJunctionStopped && (
                        <span className="rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                          STOPPED
                        </span>
                      )}
                      {isJunctionEmergencyControlled && !isJunctionStopped && (
                        <span className="rounded bg-orange-600 px-2 py-0.5 text-xs font-bold text-white">
                          EMERGENCY
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {junctionSignals.length} light
                        {junctionSignals.length !== 1 ? 's' : ''}
                      </span>
                      <button
                        onClick={() => handleOpenAddLightDialog(junctionId)}
                        className="rounded-md bg-green-600 p-1 text-white transition hover:bg-green-700"
                        title="Add Light to Junction"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      {!emergencyStopAll &&
                        (isJunctionStopped ? (
                          <button
                            onClick={() => handleStartJunction(junctionId)}
                            className="rounded-md bg-green-600 p-1 text-white transition hover:bg-green-700"
                            title="Start Junction"
                          >
                            <PlayCircle className="h-3 w-3" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStopJunction(junctionId)}
                            className="rounded-md bg-red-600 p-1 text-white transition hover:bg-red-700"
                            title="Stop Junction"
                          >
                            <StopCircle className="h-3 w-3" />
                          </button>
                        ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {junctionSignals
                      .filter((s) => filter === 'all' || s.color === filter)
                      .map((signal, idx) => {
                        const isBrokenOrFixing =
                          signal.status === 1 || signal.status === 2;
                        const statusLabel =
                          signal.status === 1
                            ? 'BROKEN'
                            : signal.status === 2
                              ? 'FIXING'
                              : '';
                        const showDash =
                          isJunctionStopped ||
                          isBrokenOrFixing ||
                          isJunctionEmergencyControlled;

                        return (
                          <div
                            key={idx}
                            ref={(el) => {
                              if (signal.trafficLightId) {
                                lightItemsRef.current[signal.trafficLightId] =
                                  el;
                              }
                            }}
                            className={`rounded-lg border p-3 transition ${
                              selectedSignal?.trafficLightId ===
                              signal.trafficLightId
                                ? 'border-slate-500 bg-slate-50 ring-2 ring-slate-200'
                                : isBrokenOrFixing
                                  ? 'border-gray-400 bg-gray-200'
                                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <button
                                onClick={() => handleSignalClick(signal)}
                                className="flex flex-1 items-center gap-3 text-left"
                              >
                                <div
                                  className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white shadow-md ${
                                    isBrokenOrFixing
                                      ? 'bg-gray-500'
                                      : signal.color === 'red'
                                        ? 'bg-red-500'
                                        : signal.color === 'yellow'
                                          ? 'bg-yellow-500'
                                          : 'bg-green-500'
                                  }`}
                                >
                                  {showDash ? '--' : signal.remainingTime}
                                </div>
                                <div className="flex-1">
                                  <div className="font-semibold text-gray-800">
                                    {signal.direction}
                                  </div>
                                  <div className="text-xs text-gray-500 capitalize">
                                    {isBrokenOrFixing
                                      ? statusLabel
                                      : `${signal.color} Light`}
                                  </div>
                                </div>
                              </button>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleEditLight(signal)}
                                  className="rounded-md p-2 text-gray-400 transition hover:bg-gray-200 hover:text-gray-600"
                                  title="Edit light settings"
                                >
                                  <Settings className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleRemoveLight(signal)}
                                  className="rounded-md p-2 text-gray-400 transition hover:bg-red-100 hover:text-red-600"
                                  title="Remove light"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1">
        <APIProvider apiKey={apiKey}>
          <Map
            mapId="traffic-control-map"
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
              signals={filteredSignals}
              emergencyVehicles={emergencyVehicles}
              onSignalClick={handleSignalClick}
              selectedSignal={selectedSignal}
              onMapReady={setMapInstance}
              emergencyStopAll={emergencyStopAll}
              stoppedJunctions={stoppedJunctions}
              emergencyMode={emergencyMode}
              emergencyControlledIntersections={
                emergencyControlledIntersections
              }
              isPickingPosition={isPickingPosition}
              onMapClick={handleMapClick}
            />
          </Map>
        </APIProvider>
      </div>

      {/* Map Settings Dialog */}
      <MapSettingsDialog
        open={showSettings}
        onClose={() => setShowSettings(false)}
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

      {/* Add Intersection Dialog */}
      <AddIntersectionDialog
        open={showAddIntersectionDialog}
        onClose={() => {
          setShowAddIntersectionDialog(false);
          setPickedPosition(null);
          setIsPickingPosition(false);
        }}
        onSave={handleAddIntersection}
        existingIntersectionIds={existingIntersectionIds}
        onStartPickingPosition={handleStartPickingPosition}
        onStopPickingPosition={handleStopPickingPosition}
        isPickingPosition={isPickingPosition}
        pickedPosition={pickedPosition}
      />

      {/* Add Light Dialog */}
      <AddLightDialog
        open={showAddLightDialog}
        onClose={() => {
          setShowAddLightDialog(false);
          setAddLightJunctionId('');
          setPickedPosition(null);
          setIsPickingPosition(false);
        }}
        onSave={handleAddLight}
        junctionId={addLightJunctionId}
        existingRoadIds={getExistingRoadIds(addLightJunctionId)}
        onStartPickingPosition={handleStartPickingPosition}
        onStopPickingPosition={handleStopPickingPosition}
        isPickingPosition={isPickingPosition}
        pickedPosition={pickedPosition}
        existingLightPositions={getExistingLightPositions(addLightJunctionId)}
      />
    </div>
  );
}
