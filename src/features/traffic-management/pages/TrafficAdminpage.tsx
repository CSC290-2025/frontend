//Adminpage

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from '@vis.gl/react-google-maps';
import { ref, onValue, off } from 'firebase/database';
import TrafficSettingPopup from '../components/TrafficSettingPopup';
import { database } from '@/lib/firebase';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import ConfirmPopup from '../components/Comfirmpopup';
import MapSettingsDialog from '../components/MapSettingsDialog';
import type { lightRequest } from '../types/traffic.types';
import { getBaseAPIURL } from '@/lib/apiClient.ts';

interface TrafficData {
  interid: number;
  roadid: number;
  lat: number;
  lng: number;
  autoON: boolean;
  color: number;
  remaintime: number;
  timestamp: string;
}

interface TrafficRecord extends TrafficData {
  key: string;
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
  const [TrafficLight, setTrafficLight] = useState<TrafficRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  useEffect(() => {
    const team10Ref = ref(database, 'teams/10/traffic_lights');

    const fetchData = () => {
      const unsubscribe = onValue(
        team10Ref,
        (snapshot) => {
          try {
            const data = snapshot.val();

            if (!data) {
              setTrafficLight([]);
              setError('No traffic data available for team 10');
              setLoading(false);
              return;
            }

            const allTraffic: TrafficRecord[] = [];

            Object.entries(data).forEach(([key, signalData]: [string, any]) => {
              // 1. Check if the signalData itself is a valid signal object
              if (
                signalData &&
                typeof signalData === 'object' &&
                isValidSignal(signalData)
              ) {
                const lat = parseCoordinate(signalData.lat);
                const lng = parseCoordinate(signalData.lng);

                if (lat !== null && lng !== null) {
                  allTraffic.push({
                    interid: signalData.interid,
                    roadid: signalData.roadid,
                    color: signalData.color,
                    lat: lat, // Use parsed coordinates
                    lng: lng, // Use parsed coordinates
                    autoON: signalData.autoON ?? false,
                    remaintime: parseInt(signalData.remaintime) || 0,
                    timestamp: signalData.timestamp || new Date().toISOString(),
                    key, // Use the Firebase key for unique identification
                  } as TrafficRecord); // Cast for type safety
                }
              }
            });
            console.log('Data ->', data);
            console.log('All traffic ->', allTraffic);

            setTrafficLight(allTraffic);
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

  return { TrafficLight, loading, error, lastUpdate };
}

interface TrafficSignalMarkerProps {
  Trafficlight: TrafficRecord;
  isSelected: boolean;
  onClick: () => void;
  setMarkerRef?: (
    marker: google.maps.marker.AdvancedMarkerElement | null,
    key: string
  ) => void;
}

function TrafficSignalMarker({
  Trafficlight,
  isSelected,
  onClick,
  setMarkerRef,
}: TrafficSignalMarkerProps) {
  const colorMap = {
    red: '#ef4444',
    yellow: '#fbbf24',
    green: '#22c55e',
  };

  const markerKey = `Intersection : ${Trafficlight.interid} - road : ${Trafficlight.roadid}`;

  if (!Trafficlight.autoON) {
    return null;
  }

  return (
    <AdvancedMarker
      position={{ lat: Trafficlight.lat, lng: Trafficlight.lng }}
      title={`Intersection : ${Trafficlight.interid} | Road : ${Trafficlight.roadid}`}
      onClick={onClick}
      ref={(marker) => setMarkerRef && setMarkerRef(marker, markerKey)}
    >
         
      <div className="flex cursor-pointer flex-col items-center">
           
        <div
          className={`flex items-center justify-center rounded-full border-4 shadow-lg ${
            isSelected ? 'border-blue-500 ring-4 ring-blue-300' : 'border-white'
          }`}
          style={{
            backgroundColor:
              colorMap[
                Trafficlight.color == 1
                  ? 'red'
                  : Trafficlight.color == 3
                    ? 'green'
                    : 'yellow'
              ],
            width: '48px',
            height: '48px',
          }}
        >
             
          <span className="text-base font-bold text-white">
                        {Trafficlight.remaintime}     
          </span>
        </div>
        <div
          className={`mt-1 rounded px-2 py-1 text-xs font-semibold shadow-md ${
            isSelected ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'
          }`}
        >
                    {Trafficlight.interid}   
        </div>
      </div>
    </AdvancedMarker>
  );
}

interface MapContentProps {
  settings: MapSettings;
  userLocation: { lat: number; lng: number } | null;
  selectedSignal: TrafficRecord | null;
  onSignalClick: (Traffic: TrafficRecord) => void;
}

function MapContent({
  settings,
  userLocation,
  selectedSignal,
  onSignalClick,
}: MapContentProps) {
  const map = useMap();
  const { TrafficLight, loading, error } = useTeam10TrafficSignals(
    settings.refreshRate
  );
  const [selectedlight, setSelectedlight] = useState<TrafficRecord>(
    {} as TrafficRecord
  );
  const [popupOpen, setPopupOpen] = useState(false);
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

  const visibleSignals = useMemo(() => {
    if (!userLocation || settings.visibilityRange === 0) {
      return TrafficLight;
    }

    return TrafficLight.filter((Traffic) => {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        Traffic.lat,
        Traffic.lng
      );
      return distance <= settings.visibilityRange;
    });
  }, [TrafficLight, userLocation, settings.visibilityRange]); // Handle traffic layer

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
  }, [map, settings.showTraffic, trafficLayer]); // Handle transit layer

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
  }, [map, settings.showTransit, transitLayer]); // Handle bicycling layer

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
  }, [map, settings.showBicycling, bicyclingLayer]); // Handle marker clustering

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
  }, [map, settings.enableClustering, visibleSignals.length]); // Jump to selected signal

  useEffect(() => {
    if (map && selectedSignal) {
      setPopupOpen(true);
      console.log('Selected Signal:', selectedSignal.key);
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
      } // Update clusterer when markers change

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

  if (TrafficLight.length === 0) {
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
      {visibleSignals.map((Traffic, index) => (
        <TrafficSignalMarker
          key={`${Traffic.interid}-${Traffic.roadid}-${index}`}
          Trafficlight={Traffic}
          isSelected={selectedSignal?.interid === Traffic.interid}
          onClick={() => onSignalClick(Traffic)}
          setMarkerRef={setMarkerRef}
        />
      ))}
       
      <div className="absolute bottom-4 left-4 rounded-lg bg-white px-4 py-2 shadow-lg">
             
        <p className="text-sm font-semibold text-gray-800">
                    {visibleSignals.filter((s) => s.autoON).length} Active
          Signals      
        </p>
         
        <p className="text-xs text-gray-600">
                    {new Set(visibleSignals.map((s) => s.interid)).size}{' '}
          Junctions      
        </p>
             
        {settings.visibilityRange > 0 && userLocation && (
          <p className="mt-1 text-xs text-gray-500">
                        Within {settings.visibilityRange}m      
          </p>
        )}
             
        {settings.enableClustering && (
          <p className="mt-1 text-xs text-blue-600">Clustering enabled</p>
        )}
           
      </div>
       
      <TrafficSettingPopup
        open={popupOpen}
        onOpenChange={(v) => setPopupOpen(v)}
        Traffickey={String(selectedSignal?.key)}
      />
    </>
  );
}

export default function TrafficAdminpage() {
  const apiKey = import.meta.env.VITE_G10_GOOGLE_MAPS_API_KEY;
  const [currentLocation, setCurrentLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [requestOpen, setrequestOpen] = useState(false);
  const [signalOpen, setsignalOpen] = useState(false);
  const [refreshrate, setrefreshrate] = useState(1);
  const [rrunit, setrrunit] = useState('sec');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [LightRequest, setLightRequest] = useState<lightRequest[]>([]);

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

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedSignal, setSelectedSignal] = useState<TrafficRecord | null>(
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
  };

  const handleSignalSelect = useCallback((signal: TrafficRecord) => {
    setSelectedSignal((prev) => {
      if (prev?.interid === signal.interid && prev?.roadid === signal.roadid) {
        return null;
      }
      return signal;
    });
  }, []);

  const initialCenter = { lat: 13.647372072504554, lng: 100.49553588244684 };

  return (
    <div className="relative mt-5 flex h-screen w-full gap-4">
            {/* Location Input */}   
      <div className="absolute top-10 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-full bg-white px-4 py-2 shadow-lg">
             
        <svg
          className="h-6 w-6 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
               
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
           
        </svg>
             
        <input
          type="text"
          placeholder="Search your destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="min-w-[250px] rounded-full border-none px-3 py-2 outline-none"
        />
           
        <button
          onClick={handleStart}
          className="rounded-full bg-blue-600 px-8 py-2 font-medium text-white transition hover:bg-blue-700"
        >
                    search      
        </button>
         
      </div>
           {/*<TrafficDashboard/>*/}
      <div className="flex flex-1 flex-row">
               
        <div className="mx-auto flex w-full max-w-[1100px] flex-col items-center rounded-xl border-2 border-gray-200 bg-white p-6 shadow-md">
             
          <div className="relative h-[600px] w-full overflow-hidden rounded-lg">
                 
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
                />{' '}
                 
              </Map>
            </APIProvider>
          </div>
        </div>
                {/* Control Panel */}     
        <div className="absolute top-15 right-8 z-10 mt-12 flex flex-col gap-2">
          {!requestOpen && !signalOpen && (
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
                  Map Settings
            </button>
          )}
                    {/*Emer*/}   
          {!settingsOpen && !signalOpen && (
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
                  Emergency Request
            </button>
          )}
                    {/*Signal*/} 
          {!settingsOpen && !requestOpen && (
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
                            Signal offline  
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
                {/*Note*/} 
        <div className="absolute bottom-10 left-1/2 z-10 w-65 -translate-x-1/2 rounded-lg border border-yellow-400 bg-yellow-100 px-4 py-2 text-sm">
          <p className="text-xs text-yellow-800">
                  <strong>Note : </strong>Now you are on Traffic Admin page    
             
          </p>
        </div>
        <ConfirmPopup
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Confirm Settings"
          description={`Are you sure you want to save these settings? Refresh rate will be set to bababa ${refreshrate}.`}
          confirmText="Save"
          cancelText="Cancel"
          onConfirm={() => {
            setSettingsOpen(false);
          }}
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

/*<ControlPanel
          onMapSettingsClick={handleMapSettingsClick}
          onEmergencyClick={handleEmergencyClick}
        /> */
