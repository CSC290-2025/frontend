import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from '@vis.gl/react-google-maps';
import { ref, set, onValue, update } from 'firebase/database';
import { database } from '@/lib/firebase';
import {
  Crosshair,
  Settings,
  Ambulance,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Smartphone,
  Keyboard,
  Move,
  Info,
  X,
  RotateCcw,
  MapPin,
  Zap,
  AlertTriangle,
} from 'lucide-react';
import {
  groupLightsByIntersection,
  COLOR_GREEN,
  COLOR_RED,
  COLOR_YELLOW,
  colorNumberToString,
  getLightDuration,
} from '../utils/trafficLightCalculations';

interface TrafficLightData {
  key: string;
  interid: number;
  roadid: number;
  color: number;
  lat: number;
  lng: number;
  remaintime: number;
  green_duration: number;
  yellow_duration: number;
  emergency_override?: boolean;
}

interface EmergencySettings {
  movementStep: number; // How much to move per keypress (in degrees)
  proximityThreshold: number; // Distance in meters to trigger traffic light change
  enableTrafficControl: boolean; // Whether to affect traffic lights
  showProximityCircle: boolean;
  autoCenter: boolean; // Auto-pan map to follow vehicle
}

const DEFAULT_SETTINGS: EmergencySettings = {
  movementStep: 0.0003,
  proximityThreshold: 200,
  enableTrafficControl: true,
  showProximityCircle: true,
  autoCenter: true,
};

// Haversine formula to calculate distance between two coordinates
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

// Calculate direction from one point to another
function calculateDirection(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): string {
  const dLat = toLat - fromLat;
  const dLng = toLng - fromLng;
  const angle = Math.atan2(dLng, dLat) * (180 / Math.PI);

  // Convert angle to compass direction
  if (angle >= -22.5 && angle < 22.5) return 'N';
  if (angle >= 22.5 && angle < 67.5) return 'NE';
  if (angle >= 67.5 && angle < 112.5) return 'E';
  if (angle >= 112.5 && angle < 157.5) return 'SE';
  if (angle >= 157.5 || angle < -157.5) return 'S';
  if (angle >= -157.5 && angle < -112.5) return 'SW';
  if (angle >= -112.5 && angle < -67.5) return 'W';
  if (angle >= -67.5 && angle < -22.5) return 'NW';
  return 'N';
}

// Get direction from movement
function getMovementDirection(key: string): 'N' | 'S' | 'E' | 'W' | null {
  switch (key.toLowerCase()) {
    case 'w':
    case 'arrowup':
      return 'N';
    case 's':
    case 'arrowdown':
      return 'S';
    case 'a':
    case 'arrowleft':
      return 'W';
    case 'd':
    case 'arrowright':
      return 'E';
    default:
      return null;
  }
}

interface MapContentProps {
  vehiclePosition: { lat: number; lng: number };
  onVehicleMove: (lat: number, lng: number) => void;
  settings: EmergencySettings;
  nearbyIntersections: Array<{
    interid: number;
    distance: number;
    lat: number;
    lng: number;
  }>;
  trafficLights: TrafficLightData[];
  movementDirection: string | null;
  emergencyStopAll: boolean;
  stoppedIntersections: Set<number>;
  emergencyMode: string | null;
  emergencyControlledIntersections: Set<number>;
}

function MapContent({
  vehiclePosition,
  onVehicleMove,
  settings,
  nearbyIntersections,
  trafficLights,
  movementDirection,
  emergencyStopAll,
  stoppedIntersections,
  emergencyMode,
  emergencyControlledIntersections,
}: MapContentProps) {
  const map = useMap();
  const circleRef = useRef<google.maps.Circle | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(
    null
  );

  // Auto-center on vehicle
  useEffect(() => {
    if (map && settings.autoCenter) {
      map.panTo(vehiclePosition);
    }
  }, [map, vehiclePosition, settings.autoCenter]);

  // Create and manage the proximity circle - separate from marker position updates
  useEffect(() => {
    if (!map) return;

    if (settings.showProximityCircle) {
      if (!circleRef.current) {
        // Create new circle centered on vehicle
        circleRef.current = new google.maps.Circle({
          map,
          center: { lat: vehiclePosition.lat, lng: vehiclePosition.lng },
          radius: settings.proximityThreshold,
          strokeColor: '#ef4444',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#ef4444',
          fillOpacity: 0.1,
          clickable: false,
        });
      }
    }

    return () => {
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
    };
  }, [map, settings.showProximityCircle]);

  // Update circle center and radius separately to avoid recreation
  useEffect(() => {
    if (circleRef.current && settings.showProximityCircle) {
      circleRef.current.setCenter({ lat: vehiclePosition.lat, lng: vehiclePosition.lng });
    }
  }, [vehiclePosition.lat, vehiclePosition.lng, settings.showProximityCircle]);

  // Update circle radius when threshold changes
  useEffect(() => {
    if (circleRef.current && settings.showProximityCircle) {
      circleRef.current.setRadius(settings.proximityThreshold);
    }
  }, [settings.proximityThreshold, settings.showProximityCircle]);

  // Hide circle when disabled
  useEffect(() => {
    if (circleRef.current) {
      if (settings.showProximityCircle) {
        circleRef.current.setMap(map);
      } else {
        circleRef.current.setMap(null);
      }
    }
  }, [map, settings.showProximityCircle]);

  // Set up real-time drag listener on the marker
  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;

    const dragListener = marker.addListener('drag', () => {
      const position = marker.position;
      if (position) {
        const lat =
          typeof position.lat === 'function' ? position.lat() : position.lat;
        const lng =
          typeof position.lng === 'function' ? position.lng() : position.lng;
        if (lat !== undefined && lng !== undefined) {
          onVehicleMove(lat, lng);
        }
      }
    });

    return () => {
      google.maps.event.removeListener(dragListener);
    };
  }, [onVehicleMove]);

  const handleCenterOnVehicle = useCallback(() => {
    if (map) {
      map.panTo(vehiclePosition);
      map.setZoom(17);
    }
  }, [map, vehiclePosition]);

  // Memoize position to prevent marker flickering
  const markerPosition = useMemo(
    () => ({ lat: vehiclePosition.lat, lng: vehiclePosition.lng }),
    [vehiclePosition.lat, vehiclePosition.lng]
  );

  // Callback to capture marker ref
  const handleMarkerRef = useCallback(
    (marker: google.maps.marker.AdvancedMarkerElement | null) => {
      markerRef.current = marker;
    },
    []
  );

  return (
    <>
      {/* Emergency Vehicle Marker */}
      <AdvancedMarker
        ref={handleMarkerRef}
        position={markerPosition}
        draggable
        onDragEnd={(e) => {
          const lat = e.latLng?.lat();
          const lng = e.latLng?.lng();
          if (lat !== undefined && lng !== undefined) {
            onVehicleMove(lat, lng);
          }
        }}
        title="Emergency Vehicle - Drag to move"
      >
        <div className="relative flex flex-col items-center">
          {/* Direction indicator */}
          {movementDirection && (
            <div className="absolute -top-8 rounded-full bg-blue-600 px-2 py-1 text-xs font-bold text-white">
              {movementDirection}
            </div>
          )}
          {/* Vehicle icon */}
          <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-red-600 shadow-lg">
            <Ambulance className="h-7 w-7 text-white" />
          </div>
          <div className="mt-1 rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white shadow">
            EMERGENCY
          </div>
        </div>
      </AdvancedMarker>

      {/* Traffic Light Markers with countdown from Firebase */}
      {trafficLights.map((light) => {
        const colorMap: Record<string, string> = {
          red: '#ef4444',
          yellow: '#fbbf24',
          green: '#22c55e',
        };
        const colorStr = colorNumberToString(light.color);
        const { greenDuration, yellowDuration } = getLightDuration(light);

        // Calculate display time similar to TrafficMapPage
        let displayTime = light.remaintime || 0;
        if (light.color === COLOR_GREEN) {
          displayTime = Math.max(0, displayTime - yellowDuration);
        }

        const isOverridden = light.emergency_override === true;

        // Check if this light should show "--"
        const isStopped =
          emergencyStopAll || stoppedIntersections.has(light.interid);
        // Show "--" for ALL controlled intersections (both direction and all-red modes)
        const isEmergencyControlled =
          emergencyControlledIntersections.has(light.interid);
        const showDash = isStopped || isEmergencyControlled;

        return (
          <AdvancedMarker
            key={light.key}
            position={{ lat: light.lat, lng: light.lng }}
            title={`Inter-${light.interid} Road-${light.roadid}${isOverridden ? ' (EMERGENCY OVERRIDE)' : ''}${isStopped ? ' (STOPPED)' : ''}${isEmergencyControlled ? ' (EMERGENCY)' : ''}`}
          >
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 shadow ${isOverridden ? 'border-orange-400 ring-2 ring-orange-300' : isStopped ? 'border-red-400 ring-2 ring-red-300' : 'border-white'}`}
                style={{ backgroundColor: colorMap[colorStr] }}
              >
                <span className="text-sm font-bold text-white">
                  {showDash ? '--' : displayTime}
                </span>
              </div>
              <div className="mt-0.5 rounded bg-gray-800/80 px-1 py-0.5 text-[10px] font-medium text-white">
                R{light.roadid}
              </div>
            </div>
          </AdvancedMarker>
        );
      })}

      {/* Center button */}
      <button
        onClick={handleCenterOnVehicle}
        className="absolute top-4 right-4 z-10 rounded-full bg-white p-3 shadow-lg transition hover:bg-gray-100"
        title="Center on emergency vehicle"
      >
        <Crosshair className="h-5 w-5 text-gray-700" />
      </button>

      {/* Nearby intersections indicator */}
      {nearbyIntersections.length > 0 && (
        <div className="absolute top-4 left-4 z-10 rounded-lg bg-orange-500 px-3 py-2 text-white shadow-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-semibold">
              {nearbyIntersections.length} intersection(s) in range
            </span>
          </div>
        </div>
      )}
    </>
  );
}

export default function EmergencyTrackingPage() {
  const apiKey = import.meta.env.VITE_G10_GOOGLE_MAPS_API_KEY;

  // Vehicle position state
  const [vehiclePosition, setVehiclePosition] = useState({
    lat: 13.647372,
    lng: 100.495536,
  });

  // Previous position for direction calculation
  const prevPositionRef = useRef(vehiclePosition);

  // Movement direction state
  const [movementDirection, setMovementDirection] = useState<string | null>(
    null
  );

  // Settings state
  const SETTINGS_STORAGE_KEY = 'emergency_tracking_settings_v1';
  const [settings, setSettings] = useState<EmergencySettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Traffic lights data
  const [trafficLights, setTrafficLights] = useState<TrafficLightData[]>([]);
  const [nearbyIntersections, setNearbyIntersections] = useState<
    Array<{ interid: number; distance: number; lat: number; lng: number }>
  >([]);

  // Emergency stop state (from system-wide settings)
  const [emergencyStopAll, setEmergencyStopAll] = useState(false);
  const [stoppedIntersections, setStoppedIntersections] = useState<Set<number>>(
    new Set()
  );
  const [emergencyMode, setEmergencyMode] = useState<string | null>(null);
  const [emergencyControlledIntersections, setEmergencyControlledIntersections] =
    useState<Set<number>>(new Set());

  // Track which intersections have been controlled
  const controlledIntersectionsRef = useRef<Set<number>>(new Set());

  // Touch tracking for mobile swipe
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Save position to Firebase
  const saveToFirebase = useCallback(async (lat: number, lng: number) => {
    try {
      const path = ref(database, 'teams/13/ambulance_car');
      await set(path, {
        lat,
        lng,
        updatedAt: Date.now(),
      });
    } catch (err) {
      // Silently handle Firebase errors
    }
  }, []);

  // Sync ambulance position from Firebase on load
  useEffect(() => {
    const ambulanceRef = ref(database, 'teams/13/ambulance_car');
    const unsubscribe = onValue(ambulanceRef, (snapshot) => {
      const data = snapshot.val();
      if (data && typeof data.lat === 'number' && typeof data.lng === 'number') {
        setVehiclePosition({ lat: data.lat, lng: data.lng });
        prevPositionRef.current = { lat: data.lat, lng: data.lng };
      }
    }, { onlyOnce: true }); // Only sync once on load, not continuously

    return () => unsubscribe();
  }, []);

  // Move vehicle function
  const moveVehicle = useCallback(
    (direction: 'N' | 'S' | 'E' | 'W') => {
      setVehiclePosition((prev) => {
        let { lat, lng } = prev;
        const step = settings.movementStep;

        switch (direction) {
          case 'N':
            lat += step;
            break;
          case 'S':
            lat -= step;
            break;
          case 'E':
            lng += step;
            break;
          case 'W':
            lng -= step;
            break;
        }

        saveToFirebase(lat, lng);
        setMovementDirection(direction);

        return { lat, lng };
      });
    },
    [settings.movementStep, saveToFirebase]
  );

  // Handle vehicle position update (from drag)
  const handleVehicleMove = useCallback(
    (lat: number, lng: number) => {
      // Calculate direction based on movement
      const direction = calculateDirection(
        prevPositionRef.current.lat,
        prevPositionRef.current.lng,
        lat,
        lng
      );
      setMovementDirection(direction);
      prevPositionRef.current = { lat, lng };

      setVehiclePosition({ lat, lng });
      saveToFirebase(lat, lng);
    },
    [saveToFirebase]
  );

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const direction = getMovementDirection(e.key);
      if (direction) {
        e.preventDefault();
        moveVehicle(direction);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveVehicle]);

  // Touch controls for mobile
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || e.changedTouches.length !== 1) {
        touchStartRef.current = null;
        return;
      }

      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;

      // Minimum swipe distance
      const minSwipe = 30;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (absDx > minSwipe || absDy > minSwipe) {
        if (absDx > absDy) {
          // Horizontal swipe
          moveVehicle(dx > 0 ? 'E' : 'W');
        } else {
          // Vertical swipe
          moveVehicle(dy > 0 ? 'S' : 'N');
        }
      }

      touchStartRef.current = null;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [moveVehicle]);

  // Load traffic lights from Firebase with all needed fields
  useEffect(() => {
    const trafficLightsRef = ref(database, 'teams/10/traffic_lights');

    const unsubscribe = onValue(trafficLightsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const lights: TrafficLightData[] = [];
        Object.entries(data).forEach(([key, value]: [string, any]) => {
          if (value && typeof value === 'object') {
            lights.push({
              key,
              interid: parseInt(value.interid) || 0,
              roadid: parseInt(value.roadid) || 0,
              color: parseInt(value.color) || 1,
              lat: parseFloat(value.lat) || 0,
              lng: parseFloat(value.lng) || 0,
              remaintime: parseInt(value.remaintime) || 0,
              green_duration: parseInt(value.green_duration) || 27,
              yellow_duration: parseInt(value.yellow_duration) || 3,
              emergency_override: value.emergency_override === true,
            });
          }
        });
        setTrafficLights(lights);
      }
    });

    return () => unsubscribe();
  }, []);

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
          const intersectionIds = Object.keys(data)
            .filter((key) => data[key] === true)
            .map((key) => parseInt(key));
          setStoppedIntersections(new Set(intersectionIds));
        } else {
          setStoppedIntersections(new Set());
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
      unsubscribeEmergencyMode();
      unsubscribeEmergencyControlled();
    };
  }, []);

  // Sync local controlled ref with Firebase state on load
  // This ensures page refresh doesn't lose track of controlled intersections
  useEffect(() => {
    emergencyControlledIntersections.forEach((interid) => {
      controlledIntersectionsRef.current.add(interid);
    });
  }, [emergencyControlledIntersections]);

  // Check proximity to intersections and control traffic lights
  useEffect(() => {
    if (!settings.enableTrafficControl || trafficLights.length === 0) {
      return;
    }

    // Group lights by intersection ID manually (since we have flat array)
    const grouped: Record<number, TrafficLightData[]> = {};
    trafficLights.forEach((light) => {
      if (!grouped[light.interid]) {
        grouped[light.interid] = [];
      }
      grouped[light.interid].push(light);
    });

    const nearby: Array<{
      interid: number;
      distance: number;
      lat: number;
      lng: number;
    }> = [];

    const currentControlled = new Set(controlledIntersectionsRef.current);

    // Check each intersection
    Object.entries(grouped).forEach(([interidStr, lights]) => {
      const interid = parseInt(interidStr);
      if (lights.length === 0 || interid === 0) return;

      // Calculate center of intersection (average of all light positions)
      const centerLat = lights.reduce((sum, l) => sum + l.lat, 0) / lights.length;
      const centerLng = lights.reduce((sum, l) => sum + l.lng, 0) / lights.length;

      const distance = calculateDistance(
        vehiclePosition.lat,
        vehiclePosition.lng,
        centerLat,
        centerLng
      );

      if (distance <= settings.proximityThreshold) {
        nearby.push({
          interid,
          distance,
          lat: centerLat,
          lng: centerLng,
        });

        // Control traffic light if not already controlled locally
        // Also re-control if Firebase shows controlled but local ref doesn't (page refresh scenario)
        const isControlledLocally = controlledIntersectionsRef.current.has(interid);
        const isControlledInFirebase = emergencyControlledIntersections.has(interid);

        // Always add to local ref when in range
        if (!isControlledLocally) {
          controlledIntersectionsRef.current.add(interid);
        }

        // Only send Firebase updates if not already controlled in Firebase
        // This prevents unnecessary writes and potential race conditions
        if (!isControlledInFirebase) {
          const updates: Record<string, any> = {};

          // Store emergency mode at system level (all-red mode)
          updates['teams/10/emergency-mode'] = 'all-red';
          updates[`teams/10/emergency-controlled-intersections/${interid}`] = true;

          // All-red mode: All lights go red for safety
          lights.forEach((light) => {
            updates[`teams/10/traffic_lights/${light.key}/color`] = COLOR_RED;
            updates[`teams/10/traffic_lights/${light.key}/remaintime`] = 0;
          });

          update(ref(database), updates).catch(console.error);
        }
      } else {
        // Vehicle has passed this intersection - reset and restart cycle
        // Check both local ref AND Firebase state to ensure restart happens
        const isControlledLocally = controlledIntersectionsRef.current.has(interid);
        const isControlledInFirebase = emergencyControlledIntersections.has(interid);

        if (isControlledLocally || isControlledInFirebase) {
          controlledIntersectionsRef.current.delete(interid);


          const updates: Record<string, any> = {};

          // Remove from controlled intersections
          updates[`teams/10/emergency-controlled-intersections/${interid}`] = null;

          // Check if any intersections are still controlled
          const stillControlled = Array.from(controlledIntersectionsRef.current);
          if (stillControlled.length === 0) {
            updates['teams/10/emergency-mode'] = null;
          }

          // Restart the cycle: first light goes green, others go red with proper times
          const sortedLights = [...lights].sort((a, b) => a.roadid - b.roadid);

          sortedLights.forEach((light, idx) => {
            const greenDur = light.green_duration || 27;
            const yellowDur = light.yellow_duration || 3;

            if (idx === 0) {
              // First light starts green
              updates[`teams/10/traffic_lights/${light.key}/color`] = COLOR_GREEN;
              updates[`teams/10/traffic_lights/${light.key}/remaintime`] = greenDur + yellowDur;
            } else {
              // Other lights start red, calculate wait time
              let waitTime = 0;
              for (let i = 0; i < idx; i++) {
                waitTime += (sortedLights[i].green_duration || 27) + (sortedLights[i].yellow_duration || 3);
              }
              updates[`teams/10/traffic_lights/${light.key}/color`] = COLOR_RED;
              updates[`teams/10/traffic_lights/${light.key}/remaintime`] = waitTime;
            }
          });

          update(ref(database), updates).catch(console.error);
        }
      }
    });

    setNearbyIntersections(nearby);
  }, [
    vehiclePosition,
    trafficLights,
    settings.enableTrafficControl,
    settings.proximityThreshold,
    movementDirection,
    emergencyControlledIntersections,
  ]);

  // Save settings
  const handleSaveSettings = useCallback((newSettings: EmergencySettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch {
      // ignore
    }
    setShowSettings(false);
  }, []);

  // Reset position
  const handleResetPosition = useCallback(() => {
    const defaultPos = { lat: 13.647372, lng: 100.495536 };
    setVehiclePosition(defaultPos);
    saveToFirebase(defaultPos.lat, defaultPos.lng);
    setMovementDirection(null);
    controlledIntersectionsRef.current.clear();
  }, [saveToFirebase]);

  return (
    <div className="relative h-screen w-full">
      {/* Map */}
      <APIProvider apiKey={apiKey}>
        <Map
          mapId="emergency-tracking-map"
          defaultCenter={vehiclePosition}
          defaultZoom={17}
          gestureHandling="greedy"
          disableDefaultUI={false}
          zoomControl={true}
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={false}
          className="h-full w-full"
        >
          <MapContent
            vehiclePosition={vehiclePosition}
            onVehicleMove={handleVehicleMove}
            settings={settings}
            nearbyIntersections={nearbyIntersections}
            trafficLights={trafficLights}
            movementDirection={movementDirection}
            emergencyStopAll={emergencyStopAll}
            stoppedIntersections={stoppedIntersections}
            emergencyMode={emergencyMode}
            emergencyControlledIntersections={emergencyControlledIntersections}
          />
        </Map>
      </APIProvider>

      {/* Control Panel - Bottom */}
      <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-6">
        <div className="mx-auto max-w-4xl">
          {/* Status Bar */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/90 px-3 py-2 backdrop-blur sm:px-4 sm:py-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-1 sm:gap-2">
                <MapPin className="h-3 w-3 text-gray-600 sm:h-4 sm:w-4" />
                <span className="text-xs font-medium text-gray-700 sm:text-sm">
                  {vehiclePosition.lat.toFixed(5)}, {vehiclePosition.lng.toFixed(5)}
                </span>
              </div>
              {movementDirection && (
                <div className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 sm:gap-2 sm:px-3 sm:py-1">
                  <Zap className="h-3 w-3 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700 sm:text-sm">
                    {movementDirection}
                  </span>
                </div>
              )}
              {nearbyIntersections.length > 0 && (
                <div className="flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 sm:gap-2 sm:px-3 sm:py-1">
                  <AlertTriangle className="h-3 w-3 text-orange-600" />
                  <span className="text-xs font-medium text-orange-700 sm:text-sm">
                    {nearbyIntersections.length} controlled
                  </span>
                </div>
              )}
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-xs text-gray-500">
                Step: {(settings.movementStep * 111000).toFixed(1)}m
              </span>
              <span className="text-xs text-gray-500">
                Range: {settings.proximityThreshold}m
              </span>
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between gap-4">
            {/* Mobile Controls */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={() => moveVehicle('W')}
                className="rounded-lg bg-white/90 p-3 shadow transition active:bg-gray-100"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => moveVehicle('N')}
                  className="rounded-lg bg-white/90 p-3 shadow transition active:bg-gray-100"
                >
                  <ArrowUp className="h-6 w-6" />
                </button>
                <button
                  onClick={() => moveVehicle('S')}
                  className="rounded-lg bg-white/90 p-3 shadow transition active:bg-gray-100"
                >
                  <ArrowDown className="h-6 w-6" />
                </button>
              </div>
              <button
                onClick={() => moveVehicle('E')}
                className="rounded-lg bg-white/90 p-3 shadow transition active:bg-gray-100"
              >
                <ArrowRight className="h-6 w-6" />
              </button>
            </div>

            {/* Desktop Keyboard Guide */}
            <div className="hidden items-center gap-2 rounded-lg bg-white/90 px-4 py-3 md:flex">
              <Keyboard className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Use W A S D or Arrow Keys
              </span>
              <div className="ml-2 flex gap-1">
                <kbd className="rounded bg-gray-200 px-2 py-1 text-xs font-semibold">
                  W
                </kbd>
                <kbd className="rounded bg-gray-200 px-2 py-1 text-xs font-semibold">
                  A
                </kbd>
                <kbd className="rounded bg-gray-200 px-2 py-1 text-xs font-semibold">
                  S
                </kbd>
                <kbd className="rounded bg-gray-200 px-2 py-1 text-xs font-semibold">
                  D
                </kbd>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetPosition}
                className="flex items-center gap-2 rounded-lg bg-white/90 px-4 py-3 text-sm font-medium text-gray-700 shadow transition hover:bg-white"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline">Reset</span>
              </button>
              <button
                onClick={() => setShowHelp(true)}
                className="flex items-center gap-2 rounded-lg bg-white/90 px-4 py-3 text-sm font-medium text-gray-700 shadow transition hover:bg-white"
              >
                <Info className="h-4 w-4" />
                <span className="hidden sm:inline">Help</span>
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-3 text-sm font-medium text-white shadow transition hover:bg-slate-700"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </button>
            </div>
          </div>

          {/* Mobile Tips */}
          <div className="mt-3 flex items-center justify-center gap-2 text-white/80 md:hidden">
            <Smartphone className="h-4 w-4" />
            <span className="text-sm">
              Swipe anywhere to move or drag the marker
            </span>
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      {showSettings && (
        <SettingsDialog
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Help Dialog */}
      {showHelp && <HelpDialog onClose={() => setShowHelp(false)} />}
    </div>
  );
}

interface SettingsDialogProps {
  settings: EmergencySettings;
  onSave: (settings: EmergencySettings) => void;
  onClose: () => void;
}

function SettingsDialog({ settings, onSave, onClose }: SettingsDialogProps) {
  const [localSettings, setLocalSettings] = useState(settings);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">
            Emergency Vehicle Settings
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          {/* Movement Step */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Movement Step
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0.0001"
                max="0.001"
                step="0.0001"
                value={localSettings.movementStep}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    movementStep: parseFloat(e.target.value),
                  })
                }
                className="flex-1"
              />
              <span className="w-16 text-right text-sm text-gray-600">
                ~{(localSettings.movementStep * 111000).toFixed(0)}m
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              How far to move per keypress/swipe
            </p>
          </div>

          {/* Proximity Threshold */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Proximity Threshold
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="50"
                max="500"
                step="25"
                value={localSettings.proximityThreshold}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    proximityThreshold: parseInt(e.target.value),
                  })
                }
                className="flex-1"
              />
              <span className="w-16 text-right text-sm text-gray-600">
                {localSettings.proximityThreshold}m
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Distance to trigger traffic light control
            </p>
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Enable Traffic Control
              </span>
              <input
                type="checkbox"
                checked={localSettings.enableTrafficControl}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    enableTrafficControl: e.target.checked,
                  })
                }
                className="h-5 w-5 rounded text-blue-600"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Show Proximity Circle
              </span>
              <input
                type="checkbox"
                checked={localSettings.showProximityCircle}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    showProximityCircle: e.target.checked,
                  })
                }
                className="h-5 w-5 rounded text-blue-600"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Auto-center on Vehicle
              </span>
              <input
                type="checkbox"
                checked={localSettings.autoCenter}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    autoCenter: e.target.checked,
                  })
                }
                className="h-5 w-5 rounded text-blue-600"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            onClick={() => setLocalSettings(DEFAULT_SETTINGS)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Reset to Default
          </button>
          <button
            onClick={() => onSave(localSettings)}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

function HelpDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">
            Emergency Vehicle Tracking Help
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div className="rounded-lg bg-blue-50 p-4">
            <h3 className="mb-2 flex items-center gap-2 font-semibold text-blue-800">
              <Keyboard className="h-5 w-5" />
              Desktop Controls
            </h3>
            <ul className="space-y-1 text-sm text-blue-700">
              <li>
                • <strong>W / Arrow Up</strong> - Move North
              </li>
              <li>
                • <strong>S / Arrow Down</strong> - Move South
              </li>
              <li>
                • <strong>A / Arrow Left</strong> - Move West
              </li>
              <li>
                • <strong>D / Arrow Right</strong> - Move East
              </li>
            </ul>
          </div>

          <div className="rounded-lg bg-green-50 p-4">
            <h3 className="mb-2 flex items-center gap-2 font-semibold text-green-800">
              <Smartphone className="h-5 w-5" />
              Mobile Controls
            </h3>
            <ul className="space-y-1 text-sm text-green-700">
              <li>
                • <strong>Swipe</strong> - Move in swipe direction
              </li>
              <li>
                • <strong>Drag marker</strong> - Move to any location
              </li>
              <li>
                • <strong>Tap buttons</strong> - Use on-screen controls
              </li>
            </ul>
          </div>

          <div className="rounded-lg bg-orange-50 p-4">
            <h3 className="mb-2 flex items-center gap-2 font-semibold text-orange-800">
              <Zap className="h-5 w-5" />
              Traffic Light Control
            </h3>
            <ul className="space-y-1 text-sm text-orange-700">
              <li>
                • When the emergency vehicle approaches an intersection, all
                traffic lights turn red for safety
              </li>
              <li>
                • Lights return to normal operation after the vehicle passes
              </li>
            </ul>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="mb-2 flex items-center gap-2 font-semibold text-gray-800">
              <Move className="h-5 w-5" />
              Draggable Marker
            </h3>
            <p className="text-sm text-gray-700">
              You can drag the emergency vehicle marker directly on the map to
              move it to any location. The position is synced with Firebase in
              real-time.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
