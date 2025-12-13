import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from '@vis.gl/react-google-maps';
import { ref, onValue, off, update, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useEmergencyVehicles } from '../hooks/useEmergencyVehicles';
import { useTrafficLightCycle } from '../hooks/useTrafficLightCycle';
import EmergencyVehicleMarker from '../components/EmergencyVehicleMarker';
import TrafficLightControlPopup from '../components/TrafficLightControlPopup';
import MapSettingsDialog from '../components/MapSettingsDialog';
import { Activity, AlertTriangle, Settings, MapPin, Search, Eye, EyeOff, Power, PlayCircle, StopCircle, Navigation } from 'lucide-react';
import type { trafficLight } from '../types/traffic.types';

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
  brokenLights?: trafficLight[];
  showBrokenLights?: boolean;
  onMapReady?: (map: google.maps.Map | null) => void;
  onBrokenLightClick?: (light: trafficLight) => void;
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
  const [junctionsData, setJunctionsData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          console.log('📡 [Control] Traffic_lights data received (one-time sync):', Object.keys(trafficLightsData).length, 'lights');

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
            console.log(`🔄 [Control] Synced ${Object.keys(intersectionGroups).length} intersections from traffic_lights to junctions`);
          }
        }
      } catch (err) {
        console.error('Failed to sync traffic_lights to junctions:', err);
      }

      // 2. Now listen ONLY to junctions (single source of truth)
      const mergeAndUpdate = (signals: TrafficSignal[]) => {
        console.log(`🔄 [Control] Displaying ${signals.length} signals from junctions`);
        setSignals(signals);
        setError(null);
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

              const allSignals: TrafficSignal[] = [];

              Object.entries(data).forEach(([junctionId, junctionData]: [string, any]) => {
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

                  Object.entries(lights).forEach(([lightKey, light]: [string, any]) => {
                    if (light && typeof light === 'object' && isValidSignal(light)) {
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
                  });
                }
              });

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

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return { signals, loading, error, junctionsData };
}

function TrafficSignalMarker({
  signal,
  isSelected,
  onClick,
}: {
  signal: TrafficSignal;
  isSelected: boolean;
  onClick: () => void;
}) {
  const colorMap = {
    red: '#ef4444',
    yellow: '#fbbf24',
    green: '#22c55e',
  };

  if (!signal.online) return null;

  return (
    <AdvancedMarker
      position={{ lat: signal.lat, lng: signal.lng }}
      title={`Junction: ${signal.junctionId} | Direction: ${signal.direction}`}
      onClick={onClick}
    >
      <div className="flex cursor-pointer flex-col items-center">
        <div
          className={`flex items-center justify-center rounded-full border-4 shadow-lg ${
            isSelected ? 'border-slate-700 ring-4 ring-slate-300' : 'border-white'
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
            isSelected ? 'bg-slate-800 text-white' : 'bg-white text-gray-800'
          }`}
        >
          {signal.junctionId}
        </div>
      </div>
    </AdvancedMarker>
  );
}

function BrokenLightMarker({ light, onClick }: { light: trafficLight; onClick?: () => void }) {
  if (!light.location?.coordinates || light.location.coordinates.length !== 2) {
    return null;
  }

  const [lng, lat] = light.location.coordinates;

  return (
    <AdvancedMarker
      position={{ lat, lng }}
      title={`Broken Light | ID: ${light.id} | Intersection: ${light.intersection_id}`}
      onClick={onClick}
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
          <AlertTriangle className="h-6 w-6 text-gray-200" />
        </div>
        <div className="mt-1 rounded bg-gray-600 px-2 py-1 text-xs font-semibold text-white shadow-md">
          BROKEN
        </div>
      </div>
    </AdvancedMarker>
  );
}

function MapContent({ signals, emergencyVehicles, onSignalClick, selectedSignal, brokenLights = [], showBrokenLights = true, onMapReady, onBrokenLightClick }: MapContentProps) {
  const map = useMap();
  const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false);

  // Notify parent when map is ready
  useEffect(() => {
    if (map && onMapReady) {
      onMapReady(map);
    }
  }, [map, onMapReady]);

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
        alert('Unable to get your location. Please check location permissions.');
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
      {signals.map((signal, index) => (
        <TrafficSignalMarker
          key={`${signal.junctionId}-${signal.direction}-${index}`}
          signal={signal}
          isSelected={
            selectedSignal?.junctionId === signal.junctionId &&
            selectedSignal?.direction === signal.direction
          }
          onClick={() => onSignalClick(signal)}
        />
      ))}

      {/* Emergency Vehicle Markers */}
      {emergencyVehicles.map((vehicle) => (
        <EmergencyVehicleMarker key={vehicle.vehicleId} vehicle={vehicle} />
      ))}

      {/* Broken Light Markers */}
      {showBrokenLights && brokenLights.map((light) => (
        <BrokenLightMarker
          key={`broken-${light.id}`}
          light={light}
          onClick={() => onBrokenLightClick && onBrokenLightClick(light)}
        />
      ))}

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

export default function TrafficControlPage() {
  const apiKey = import.meta.env.VITE_G10_GOOGLE_MAPS_API_KEY;
  const { signals, loading, error, junctionsData } = useTeam10TrafficSignals();
  const { vehicles: emergencyVehicles } = useEmergencyVehicles();

  // Manage traffic light cycles with Firebase sync (only one controller across all instances)
  useTrafficLightCycle(junctionsData);

  const [selectedSignal, setSelectedSignal] = useState<TrafficSignal | null>(null);
  const [showControlPopup, setShowControlPopup] = useState(false);
  const [filter, setFilter] = useState<'all' | 'red' | 'yellow' | 'green'>('all');
  const [activeTab, setActiveTab] = useState<'signals' | 'broken'>('signals');
  const [brokenLights, setBrokenLights] = useState<trafficLight[]>([]);

  // Load broken lights visibility from localStorage
  const BROKEN_LIGHTS_STORAGE_KEY = 'smartcity_traffic_control_show_broken_lights_v1';
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
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [emergencyStopAll, setEmergencyStopAll] = useState(false);
  const [stoppedJunctions, setStoppedJunctions] = useState<Set<string>>(new Set());

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

  // Fetch broken traffic lights
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

    // Refresh every 30 seconds
    const interval = setInterval(fetchBrokenLights, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSignalClick = useCallback((signal: TrafficSignal) => {
    setSelectedSignal(signal);

    // Pan to the signal location
    if (mapInstance) {
      mapInstance.panTo({ lat: signal.lat, lng: signal.lng });
      mapInstance.setZoom(18);
    }

    // Don't auto-open dialog - user must click control button
  }, [mapInstance]);

  const handleOpenControl = useCallback(() => {
    if (selectedSignal) {
      setShowControlPopup(true);
    }
  }, [selectedSignal]);

  const handleBrokenLightClick = useCallback((light: trafficLight) => {
    if (light.location?.coordinates && mapInstance) {
      const [lng, lat] = light.location.coordinates;
      mapInstance.panTo({ lat, lng });
      mapInstance.setZoom(18);
    }
  }, [mapInstance]);

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
    setEmergencyStopAll(true);
    // TODO: Implement Firebase update to stop all traffic light cycles
    console.log('🛑 EMERGENCY STOP - All junctions stopped');
  }, []);

  const handleStartAll = useCallback(async () => {
    setEmergencyStopAll(false);
    setStoppedJunctions(new Set());
    // TODO: Implement Firebase update to resume all traffic light cycles
    console.log('▶️ SYSTEM START - All junctions resumed');
  }, []);

  const handleStopJunction = useCallback(async (junctionId: string) => {
    setStoppedJunctions(prev => new Set(prev).add(junctionId));
    // TODO: Implement Firebase update to stop this junction's cycle
    console.log(`🛑 Junction ${junctionId} stopped`);
  }, []);

  const handleStartJunction = useCallback(async (junctionId: string) => {
    setStoppedJunctions(prev => {
      const newSet = new Set(prev);
      newSet.delete(junctionId);
      return newSet;
    });
    // TODO: Implement Firebase update to resume this junction's cycle
    console.log(`▶️ Junction ${junctionId} started`);
  }, []);

  const stats = useMemo(() => {
    const total = signals.length;
    const red = signals.filter((s) => s.color === 'red').length;
    const yellow = signals.filter((s) => s.color === 'yellow').length;
    const green = signals.filter((s) => s.color === 'green').length;
    const offline = signals.filter((s) => !s.online).length;

    return { total, red, yellow, green, offline };
  }, [signals]);

  const filteredSignals = useMemo(() => {
    let filtered = signals;

    if (filter !== 'all') {
      filtered = filtered.filter((s) => s.color === filter);
    }

    // Apply search query
    if (junctionSearchQuery.trim()) {
      const query = junctionSearchQuery.toLowerCase();
      filtered = filtered.filter((s) =>
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
            <button
              onClick={() => setShowSettings(true)}
              className="rounded-lg p-2 transition hover:bg-slate-800"
              title="Map Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-slate-300">Manage traffic lights in real-time</p>

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
          <h2 className="mb-3 text-sm font-semibold text-gray-700">System Status</h2>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <Activity className="h-4 w-4 text-slate-600" />
                <span className="text-2xl font-bold text-gray-800">{stats.total}</span>
              </div>
              <p className="mt-1 text-xs text-gray-600">Total Lights</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <span className="text-2xl font-bold text-gray-800">{stats.red}</span>
              </div>
              <p className="mt-1 text-xs text-gray-600">Red</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <span className="text-2xl font-bold text-gray-800">{stats.yellow}</span>
              </div>
              <p className="mt-1 text-xs text-gray-600">Yellow</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-2xl font-bold text-gray-800">{stats.green}</span>
              </div>
              <p className="mt-1 text-xs text-gray-600">Green</p>
            </div>
            <div className="col-span-2 rounded-lg bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <AlertTriangle className="h-4 w-4 text-slate-600" />
                <span className="text-2xl font-bold text-gray-800">{brokenLights.length}</span>
              </div>
              <p className="mt-1 text-xs text-gray-600">Broken / Maintenance</p>
            </div>
          </div>

          {/* Emergency Vehicles */}
          {emergencyVehicles.length > 0 && (
            <div className="mt-3 rounded-lg border-2 border-red-200 bg-red-50 p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="font-semibold text-red-800">
                  {emergencyVehicles.length} Emergency Vehicle{emergencyVehicles.length !== 1 ? 's' : ''} Active
                </span>
              </div>
              <p className="mt-1 text-xs text-red-600">Automatic green light override enabled</p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-white">
          <button
            onClick={() => setActiveTab('signals')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition ${
              activeTab === 'signals'
                ? 'border-b-2 border-slate-900 bg-slate-50 text-slate-900'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Traffic Signals ({filteredSignals.length})
          </button>
          <button
            onClick={() => setActiveTab('broken')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition ${
              activeTab === 'broken'
                ? 'border-b-2 border-slate-900 bg-slate-50 text-slate-900'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Broken Lights ({brokenLights.length})
          </button>
        </div>

        {/* Search Bar */}
        <div className="border-b border-gray-200 bg-white p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search junction..."
              value={junctionSearchQuery}
              onChange={(e) => setJunctionSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
        </div>

        {/* Filter - Only show for signals tab */}
        {activeTab === 'signals' && (
          <div className="border-b border-gray-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">Filter by Status</h2>
              <button
                onClick={handleToggleBrokenLights}
                className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition ${
                  showBrokenLights
                    ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {showBrokenLights ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
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
        )}

        {/* Control Button - Shows when signal selected */}
        {selectedSignal && activeTab === 'signals' && (
          <div className="border-b border-gray-200 bg-slate-50 p-4">
            <div className="mb-2 text-xs font-medium text-gray-600">
              Selected: {selectedSignal.junctionId} - {selectedSignal.direction}
            </div>
            <button
              onClick={handleOpenControl}
              className="w-full rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Open Control Panel
            </button>
          </div>
        )}

        {/* Content - Junctions or Broken Lights */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'signals' ? (
            <>
              <h2 className="mb-3 text-sm font-semibold text-gray-700">
                Junctions ({junctions.length})
              </h2>
              <div className="space-y-2">
            {junctions.map(([junctionId, junctionSignals]) => {
              const isJunctionStopped = emergencyStopAll || stoppedJunctions.has(junctionId);

              return (
              <div
                key={junctionId}
                className={`rounded-lg border p-3 shadow-sm transition ${
                  isJunctionStopped
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200 bg-white hover:shadow-md'
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-600" />
                    <span className="font-semibold text-gray-800">{junctionId}</span>
                    {isJunctionStopped && (
                      <span className="rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                        STOPPED
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {junctionSignals.length} light{junctionSignals.length !== 1 ? 's' : ''}
                    </span>
                    {!emergencyStopAll && (
                      isJunctionStopped ? (
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
                      )
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {junctionSignals
                    .filter((s) => filter === 'all' || s.color === filter)
                    .map((signal, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSignalClick(signal)}
                        className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 p-2 text-left transition hover:bg-gray-100"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-3 w-3 rounded-full ${
                              signal.color === 'red'
                                ? 'bg-red-500'
                                : signal.color === 'yellow'
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                            }`}
                          />
                          <span className="text-xs font-medium text-gray-700">
                            {signal.direction}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-gray-800">
                          {signal.remainingTime}s
                        </span>
                      </button>
                    ))}
                </div>
              </div>
              );
            })}
              </div>
            </>
          ) : (
            <>
              <h2 className="mb-3 text-sm font-semibold text-gray-700">
                Broken / Maintenance Lights ({brokenLights.length})
              </h2>
              <div className="space-y-2">
                {brokenLights.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    <AlertTriangle className="mx-auto mb-2 h-8 w-8 opacity-50" />
                    <p className="text-sm">No broken or maintenance lights</p>
                  </div>
                ) : (
                  brokenLights.map((light) => (
                    <button
                      key={light.id}
                      onClick={() => handleBrokenLightClick(light)}
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-left shadow-sm transition hover:bg-gray-100"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-gray-600" />
                          <span className="font-semibold text-gray-800">
                            Light #{light.id}
                          </span>
                        </div>
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-bold ${
                            light.status === 1
                              ? 'bg-gray-200 text-gray-700'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {light.status === 1 ? 'BROKEN' : 'MAINTENANCE'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-700">
                        <p className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          <span className="font-medium">Intersection:</span> {light.intersection_id}
                        </p>
                        <p className="mt-1">
                          <span className="font-medium">Road:</span> {light.road_id}
                        </p>
                        {light.location?.coordinates && (
                          <p className="mt-1 text-xs text-gray-500">
                            {light.location.coordinates[1].toFixed(6)}, {light.location.coordinates[0].toFixed(6)}
                          </p>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
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
              brokenLights={brokenLights}
              showBrokenLights={showBrokenLights}
              onMapReady={setMapInstance}
              onBrokenLightClick={handleBrokenLightClick}
            />
          </Map>
        </APIProvider>
      </div>

      {/* Control Popup */}
      <TrafficLightControlPopup
        open={showControlPopup}
        signal={selectedSignal}
        onOpenChange={setShowControlPopup}
        onUpdate={() => {
          console.log('Traffic light updated successfully');
        }}
      />

      {/* Map Settings Dialog */}
      <MapSettingsDialog
        open={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={handleSaveSettings}
        currentSettings={settings}
      />
    </div>
  );
}
