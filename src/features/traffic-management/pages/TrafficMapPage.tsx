import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from '@vis.gl/react-google-maps';
import { ref, onValue, off } from 'firebase/database';
import { database } from '@/lib/firebase';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import ControlPanel from '../components/ControlPanel';
import LocationInput from '../components/LocationInput';
import MapSettingsDialog from '../components/MapSettingsDialog';
import TrafficLightsList from '../components/TrafficLightsList';
import TrafficNotifications from '../components/TrafficNotifications';
import BrokenLightsModal from '../components/BrokenLightsModal';
import { getTrafficLightsByStatus } from '../api/traffic-feature.api';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  useEffect(() => {
    const team10Ref = ref(database, 'teams/10/junctions');

    const fetchData = () => {
      const unsubscribe = onValue(
        team10Ref,
        (snapshot) => {
          try {
            const data = snapshot.val();

            if (!data) {
              setSignals([]);
              setError('No traffic data available for team 10');
              setLoading(false);
              return;
            }

            const allSignals: SignalWithMeta[] = [];

            Object.entries(data).forEach(
              ([junctionId, junctionData]: [string, any]) => {
                if (junctionData?.lights) {
                  Object.entries(junctionData.lights).forEach(
                    ([lightKey, light]: [string, any]) => {
                      if (
                        light &&
                        typeof light === 'object' &&
                        isValidSignal(light)
                      ) {
                        const lat = parseCoordinate(light.lat);
                        const lng = parseCoordinate(light.lng);

                        if (lat !== null && lng !== null) {
                          allSignals.push({
                            color: light.color || 'red',
                            direction: light.direction || lightKey,
                            lat,
                            lng,
                            online: light.online ?? true,
                            remainingTime: parseInt(light.remainingTime) || 0,
                            timestamp: light.timestamp || Date.now(),
                            junctionId,
                          });
                        }
                      }
                    }
                  );
                }
              }
            );

            setSignals(allSignals);
            setError(null);
            setLastUpdate(Date.now());
          } catch (err) {
            setError('Error processing traffic light data');
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        }
      );

      return unsubscribe;
    };

    const unsubscribe = fetchData();

    const interval = setInterval(() => {
      setLastUpdate(Date.now());
    }, refreshRate * 1000);

    return () => {
      off(team10Ref);
      clearInterval(interval);
    };
  }, [refreshRate]);

  return { signals, loading, error, lastUpdate };
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

function TrafficSignalMarker({
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
}

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
}

function MapContent({
  settings,
  userLocation,
  selectedSignal,
  onSignalClick,
}: MapContentProps) {
  const map = useMap();
  const { signals, loading, error } = useTeam10TrafficSignals(
    settings.refreshRate
  );
  const [brokenLights, setBrokenLights] = useState<trafficLight[]>([]);
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

  // Fetch broken traffic lights on mount
  useEffect(() => {
    const fetchBrokenLights = async () => {
      try {
        const broken = await getTrafficLightsByStatus('broken');
        setBrokenLights(broken);
      } catch (err) {
        console.error('Failed to fetch broken traffic lights:', err);
      }
    };

    fetchBrokenLights();
  }, []);

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

  // Handle marker clustering
  useEffect(() => {
    if (!map) return;

    const markerArray = Object.values(markersMapRef.current);

    if (settings.enableClustering && markerArray.length > 0) {
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
        clustererRef.current.addMarkers(markerArray);
      } else {
        clustererRef.current = new MarkerClusterer({
          map,
          markers: markerArray,
        });
      }
    } else if (clustererRef.current) {
      clustererRef.current.clearMarkers();
      clustererRef.current = null;
    }

    return () => {
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
        clustererRef.current = null;
      }
    };
  }, [map, settings.enableClustering, visibleSignals.length]);

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

      // Update clusterer when markers change
      if (map && settings.enableClustering && clustererRef.current) {
        const markerArray = Object.values(markersMapRef.current);
        clustererRef.current.clearMarkers();
        clustererRef.current.addMarkers(markerArray);
      }
    },
    [map, settings.enableClustering]
  );

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600">Loading traffic signals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="mb-2 text-red-600">Error: {error}</p>
          <p className="text-sm text-gray-500">Check console for details</p>
        </div>
      </div>
    );
  }

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

      {brokenLights.map((light) => (
        <BrokenLightMarker key={`broken-${light.id}`} light={light} />
      ))}

      <div className="absolute bottom-4 left-4 rounded-lg bg-white px-4 py-2 shadow-lg">
        <p className="text-sm font-semibold text-gray-800">
          {visibleSignals.filter((s) => s.online).length} Active Signals
        </p>
        <p className="text-xs text-gray-600">
          {new Set(visibleSignals.map((s) => s.junctionId)).size} Junctions
        </p>
        {brokenLights.length > 0 && (
          <p className="mt-1 text-xs text-red-600">
            {brokenLights.length} Broken Light
            {brokenLights.length !== 1 ? 's' : ''}
          </p>
        )}
        {settings.visibilityRange > 0 && userLocation && (
          <p className="mt-1 text-xs text-gray-500">
            Within {settings.visibilityRange}m
          </p>
        )}
        {settings.enableClustering && (
          <p className="mt-1 text-xs text-blue-600">Clustering enabled</p>
        )}
      </div>
    </>
  );
}

export default function TrafficMapPage() {
  const apiKey = import.meta.env.VITE_G10_GOOGLE_MAPS_API_KEY;
  const [currentLocation, setCurrentLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showBrokenLightsModal, setShowBrokenLightsModal] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedSignal, setSelectedSignal] = useState<SignalWithMeta | null>(
    null
  );
  const [settings, setSettings] = useState<MapSettings>({
    refreshRate: 5,
    visibilityRange: 0,
    mapType: 'roadmap',
    showTraffic: false,
    showTransit: false,
    showBicycling: false,
    gestureHandling: 'greedy',
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    scaleControl: false,
    rotateControl: false,
    minZoom: 3,
    maxZoom: 21,
    enableClustering: true,
  });

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

  const initialCenter = { lat: 13.647372072504554, lng: 100.49553588244684 };

  return (
    <div className="relative mt-24 flex h-screen w-full gap-4">
      <TrafficLightsList
        onSignalSelect={handleSignalSelect}
        selectedSignal={selectedSignal}
      />

      <TrafficNotifications />

      <div className="flex flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-[1100px] flex-col items-center rounded-xl border-2 border-gray-200 bg-white p-6 shadow-md">
          <div className="relative h-[600px] w-full overflow-hidden rounded-lg">
            <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowBrokenLightsModal(true)}
                className="z-50 rounded bg-red-600 px-3 py-1 text-sm font-semibold text-white hover:bg-red-700"
              >
                View Broken / Maintenance Lights
              </button>
            </div>
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
        <BrokenLightsModal
          isOpen={showBrokenLightsModal}
          onClose={() => setShowBrokenLightsModal(false)}
        />
      </div>
    </div>
  );
}
