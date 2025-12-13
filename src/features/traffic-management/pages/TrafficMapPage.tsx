import { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from '@vis.gl/react-google-maps';
import { ref, onValue, off, update, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { Navigation } from 'lucide-react';
import ControlPanel from '../components/ControlPanel';
import MapSettingsDialog from '../components/MapSettingsDialog';
import TrafficNotifications from '../components/TrafficNotifications';
import EmergencyVehicleMarker from '../components/EmergencyVehicleMarker';
import TrafficLegend from '../components/TrafficLegend';
import TrafficSidebar from '../components/TrafficSidebar';
import { useEmergencyVehicles } from '../hooks/useEmergencyVehicles';
import { useEmergencyTrafficControl } from '../hooks/useEmergencyTrafficControl';
import { useTrafficLightCycle } from '../hooks/useTrafficLightCycle';
import type { trafficLight } from '../types/traffic.types';

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
  const [junctionsData, setJunctionsData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  useEffect(() => {
    const junctionsRef = ref(database, 'teams/10/junctions');
    const trafficLightsRef = ref(database, 'teams/10/traffic_lights');

    const fetchData = async () => {
      // Sync traffic_lights to junctions ONCE at startup, then only listen to junctions
      // This prevents duplicates and flickering from dual listeners

      // 1. First, sync traffic_lights to junctions (one-time operation)
      try {
        const trafficLightsSnapshot = await get(ref(database, 'teams/10/traffic_lights'));
        const trafficLightsData = trafficLightsSnapshot.val();

        if (trafficLightsData) {
          console.log('📡 Traffic_lights data received (one-time sync):', Object.keys(trafficLightsData).length, 'lights');

          // Group traffic lights by intersection ID
          const intersectionGroups: Record<string, any[]> = {};

          Object.entries(trafficLightsData).forEach(([key, signalData]: [string, any]) => {
            if (signalData && typeof signalData === 'object' && isValidSignal(signalData)) {
              const lat = parseCoordinate(signalData.lat);
              const lng = parseCoordinate(signalData.lng);

              if (lat !== null && lng !== null) {
                const colorMap: Record<number, 'red' | 'yellow' | 'green'> = {
                  1: 'red',
                  2: 'yellow',
                  3: 'green',
                };

                const color = colorMap[signalData.color] || 'red';
                const remainingTime = parseInt(signalData.remaintime) || 0;
                const interid = signalData.interid || key;
                const roadid = signalData.roadid || key;

                // Group by intersection for junction sync
                if (!intersectionGroups[interid]) {
                  intersectionGroups[interid] = [];
                }
                intersectionGroups[interid].push({
                  key,
                  color,
                  remainingTime,
                  roadid,
                  lat,
                  lng,
                  online: signalData.autoON !== false,
                });
              }
            }
          });

          // Sync traffic_lights to junctions structure for cycle controller
          const junctionUpdates: Record<string, any> = {};
          Object.entries(intersectionGroups).forEach(([interid, lights]) => {
            const junctionId = `Inter-${interid}`;

            // Find which light should be active (green or highest remainingTime)
            let activeLightIndex = 0;
            let maxRemaining = 0;
            lights.forEach((light, idx) => {
              if (light.color === 'green' || light.remainingTime > maxRemaining) {
                activeLightIndex = idx;
                maxRemaining = light.remainingTime;
              }
            });

            const activeLight = lights[activeLightIndex];
            const defaultGreenDuration = 27;
            const defaultYellowDuration = 3;

            // If active light has 0 time, start it with proper duration
            let activeRemainingTime = activeLight.remainingTime;
            let activeColor = activeLight.color;

            if (activeRemainingTime === 0 || activeColor === 'red') {
              // Start the cycle with green
              activeColor = 'green';
              activeRemainingTime = defaultGreenDuration + defaultYellowDuration;
            }

            const lightsData: Record<string, any> = {};
            lights.forEach((light, idx) => {
              const isActive = idx === activeLightIndex;
              lightsData[`Road-${light.roadid}`] = {
                color: isActive ? activeColor : 'red',
                direction: `Road-${light.roadid}`,
                lat: light.lat,
                lng: light.lng,
                online: light.online,
                remainingTime: isActive ? activeRemainingTime : 0,
                timestamp: Date.now(),
                trafficLightId: light.key, // Store mapping for cycle controller
                greenDuration: defaultGreenDuration,
                yellowDuration: defaultYellowDuration,
              };
            });

            junctionUpdates[`teams/10/junctions/${junctionId}/lights`] = lightsData;
            junctionUpdates[`teams/10/junctions/${junctionId}/currentActive`] = `Road-${lights[activeLightIndex].roadid}`;
          });

          // Apply junction updates to sync with traffic_lights
          if (Object.keys(junctionUpdates).length > 0) {
            await update(ref(database), junctionUpdates);
            console.log(`🔄 Synced ${Object.keys(intersectionGroups).length} intersections from traffic_lights to junctions`);
          }
        }
      } catch (err) {
        console.error('Failed to sync traffic_lights to junctions:', err);
      }

      // 2. Now listen ONLY to junctions (single source of truth)
      const mergeAndUpdate = (signals: SignalWithMeta[]) => {
        console.log(`🔄 Displaying ${signals.length} signals from junctions`);
        setSignals(signals);
        setError(null);
        setLastUpdate(Date.now());
        setLoading(false);
      };

      // Listen to junctions structure (teams/10/junctions)
      const unsubscribeJunctions = onValue(
        junctionsRef,
        (snapshot) => {
          try {
            const data = snapshot.val();

            if (data) {
              // Store junction data for cycle management
              setJunctionsData(data);

              const allSignals: SignalWithMeta[] = [];

              Object.entries(data).forEach(
                ([junctionId, junctionData]: [string, any]) => {
                  if (junctionData?.lights) {
                    const lights = junctionData.lights;
                    const currentActive = junctionData.currentActive;

                    // Calculate total cycle time for this junction
                    let totalCycleTime = 0;
                    Object.values(lights).forEach((light: any) => {
                      const greenDuration = parseInt(light.greenDuration) || parseInt(light.duration) || 27;
                      const yellowDuration = parseInt(light.yellowDuration) || 3;
                      totalCycleTime += greenDuration + yellowDuration;
                    });

                    // Get active light's remaining time
                    const activeLight = currentActive ? lights[currentActive] : null;
                    const activeRemainingTime = activeLight ? (parseInt(activeLight.remainingTime) || 0) : 0;

                    Object.entries(lights).forEach(
                      ([lightKey, light]: [string, any]) => {
                        if (
                          light &&
                          typeof light === 'object' &&
                          isValidSignal(light)
                        ) {
                          const lat = parseCoordinate(light.lat);
                          const lng = parseCoordinate(light.lng);

                          if (lat !== null && lng !== null) {
                            const isActive = lightKey === currentActive;
                            const lightGreenDuration = parseInt(light.greenDuration) || parseInt(light.duration) || 27;
                            const lightYellowDuration = parseInt(light.yellowDuration) || 3;
                            const lightTotalDuration = lightGreenDuration + lightYellowDuration;

                            // Calculate remaining time for red lights (time until they become green)
                            let remainingTime = parseInt(light.remainingTime) || 0;
                            if (!isActive && light.color === 'red') {
                              // Red light shows time until it becomes green
                              // = total cycle time - active light's duration - active remaining time
                              remainingTime = Math.max(0, totalCycleTime - lightTotalDuration - (lightTotalDuration - activeRemainingTime));
                            }

                            allSignals.push({
                              color: light.color || 'red',
                              direction: light.direction || lightKey,
                              lat,
                              lng,
                              online: light.online ?? true,
                              remainingTime,
                              timestamp: light.timestamp || Date.now(),
                              junctionId,
                              source: light.trafficLightId ? 'backend' : 'legacy',
                              trafficLightId: light.trafficLightId,
                            });
                          }
                        }
                      }
                    );
                  }
                }
              );

              mergeAndUpdate(allSignals);
            }
          } catch (err) {
            setError('Error processing junction data');
            setLoading(false);
          }
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        }
      );

      return () => {
        unsubscribeJunctions();
      };
    };

    let unsubscribe: (() => void) | null = null;

    fetchData().then((cleanupFn) => {
      unsubscribe = cleanupFn;
    });

    const interval = setInterval(() => {
      setLastUpdate(Date.now());
    }, refreshRate * 1000);

    return () => {
      if (unsubscribe) unsubscribe();
      clearInterval(interval);
    };
  }, [refreshRate]);

  return { signals, loading, error, lastUpdate, junctionsData };
}

interface TrafficSignalMarkerProps {
  signal: SignalWithMeta;
  isSelected: boolean;
  onClick: () => void;
  setMarkerRef?: (
    marker: google.maps.marker.AdvancedMarkerElement | null,
    key: string
  ) => void;
}

const TrafficSignalMarker = memo(function TrafficSignalMarker({
  signal,
  isSelected,
  onClick,
  setMarkerRef,
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

  return (
    <AdvancedMarker
      position={{ lat: signal.lat, lng: signal.lng }}
      title={`Junction: ${signal.junctionId} | Direction: ${signal.direction}`}
      onClick={onClick}
      ref={(marker) => setMarkerRef && setMarkerRef(marker, markerKey)}
    >
      <div className="flex cursor-pointer flex-col items-center">
        <div
          className={`flex items-center justify-center rounded-full border-4 shadow-lg ${
            isSelected ? 'border-blue-500 ring-4 ring-blue-300' : 'border-white'
          }`}
          style={{
            backgroundColor: colorMap[signal.color],
            width: '48px',
            height: '48px',
          }}
        >
          <span className="text-base font-bold text-white">
            {signal.remainingTime}
          </span>
        </div>
        <div
          className={`mt-1 rounded px-2 py-1 text-xs font-semibold shadow-md ${
            isSelected ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'
          }`}
        >
          {signal.junctionId}
        </div>
      </div>
    </AdvancedMarker>
  );
});

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
        alert('Unable to get your location. Please check location permissions.');
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
      map.panTo({ lat: selectedSignal.lat, lng: selectedSignal.lng });
      map.setZoom(18);
    }
  }, [map, selectedSignal]);

  const setMarkerRef = useCallback(
    (marker: google.maps.marker.AdvancedMarkerElement | null, key: string) => {
      if (marker) {
        markersMapRef.current[key] = marker;
      } else {
        delete markersMapRef.current[key];
      }

      // Update clusterer when markers change (if clustering is enabled)
      if (map && settings.enableClustering && clustererRef.current) {
        const markerArray = Object.values(markersMapRef.current);
        clustererRef.current.clearMarkers();
        clustererRef.current.addMarkers(markerArray);
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
      {visibleSignals.map((signal, index) => (
        <TrafficSignalMarker
          key={`${signal.junctionId}-${signal.direction}-${index}`}
          signal={signal}
          isSelected={
            selectedSignal?.junctionId === signal.junctionId &&
            selectedSignal?.direction === signal.direction
          }
          onClick={() => onSignalClick(signal)}
          setMarkerRef={setMarkerRef}
        />
      ))}

      {showBrokenLights && brokenLights.map((light) => (
        <BrokenLightMarker key={`broken-${light.id}`} light={light} />
      ))}

      {emergencyVehicles.map((vehicle) => (
        <EmergencyVehicleMarker
          key={vehicle.vehicleId}
          vehicle={vehicle}
        />
      ))}

      <TrafficLegend
        totalLights={signals.length}
        activeLights={visibleSignals.filter((s) => s.online).length}
        brokenLights={brokenLights.length}
        emergencyVehicles={emergencyVehicles.length}
        junctionsOverridden={switchedJunctions.length}
        isVisible={legendVisible}
        onToggleVisibility={onToggleLegend}
      />

      {/* Jump to Current Location Button */}
      <button
        onClick={handleJumpToLocation}
        disabled={isGettingLocation}
        className="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-lg border border-gray-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm transition hover:bg-white disabled:opacity-50"
        title="Jump to my location"
      >
        <Navigation className={`h-5 w-5 text-slate-600 ${isGettingLocation ? 'animate-pulse' : ''}`} />
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
  const [brokenLights, setBrokenLights] = useState<trafficLight[]>([]);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedSignal, setSelectedSignal] = useState<SignalWithMeta | null>(
    null
  );
  const [selectedBrokenLight, setSelectedBrokenLight] = useState<trafficLight | null>(
    null
  );

  // Load broken lights visibility from localStorage
  const BROKEN_LIGHTS_STORAGE_KEY = 'smartcity_traffic_map_show_broken_lights_v1';
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
        localStorage.setItem(BROKEN_LIGHTS_STORAGE_KEY, JSON.stringify(newValue));
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
  const { signals, loading, error, junctionsData } = useTeam10TrafficSignals(settings.refreshRate);

  // Manage traffic light cycles with Firebase sync (only one controller across all instances)
  useTrafficLightCycle(junctionsData);

  // Fetch broken traffic lights on mount
  useEffect(() => {
    const fetchBrokenLights = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? ''}/traffic-lights/status`);
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

  const handleStart = async () => {
    alert('Navigation feature is currently disabled (Geocoding API not free)');
  };

  const handleMapSettingsClick = () => {
    setShowSettings(true);
  };

  const handleEmergencyClick = () => {
    alert('Emergency request sent to traffic control center');
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

  const handleBrokenLightClick = useCallback((light: trafficLight, mapRef?: google.maps.Map | null) => {
    setSelectedBrokenLight(light);
    // Pan and zoom map to broken light location
    if (light.location?.coordinates) {
      const [lng, lat] = light.location.coordinates;

      // Pan to the location
      if (mapRef) {
        mapRef.panTo({ lat, lng });
        mapRef.setZoom(18); // Zoom in to see the light clearly
      }
    }
  }, []);

  const handleUserLocationUpdate = useCallback((location: { lat: number; lng: number }) => {
    setUserLocation(location);
  }, []);

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
    <div className="mt-24 flex h-screen w-full">
      {/* Enhanced Sidebar - Fixed width column */}
      <div className="w-96 flex-shrink-0">
        <TrafficSidebar
          signals={signals}
          brokenLights={brokenLights}
          selectedSignal={selectedSignal}
          onSignalSelect={handleSignalSelect}
          onBrokenLightClick={handleBrokenLightClick}
          mapInstance={mapInstance}
          showBrokenLights={showBrokenLights}
          onToggleBrokenLights={handleToggleBrokenLights}
          searchQuery={junctionSearchQuery}
          onSearchChange={setJunctionSearchQuery}
        />
      </div>

      <TrafficNotifications />

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
                  brokenLights={brokenLights}
                  onMapReady={setMapInstance}
                  showBrokenLights={showBrokenLights}
                  legendVisible={legendVisible}
                  onToggleLegend={handleToggleLegend}
                  onUserLocationUpdate={handleUserLocationUpdate}
                />
              </Map>
            </APIProvider>
          </div>
        </div>

        <ControlPanel
          onMapSettingsClick={handleMapSettingsClick}
          onEmergencyClick={handleEmergencyClick}
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
