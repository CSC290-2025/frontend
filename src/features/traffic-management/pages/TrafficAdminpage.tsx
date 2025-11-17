import { useRef, useState, useEffect } from 'react';
import TrafficSettingPopup from '../components/TrafficSettingPopup';
import ConfirmPopup from '../components/Comfirmpopup';
import type { trafficLight, lightRequest } from '../types/traffic.types';
import { Wrapper } from '@/features/traffic-management/components/react-google-maps/wrapper.tsx';
import { useTrafficLights } from '../hooks/useTrafficLights';
import { limitTiltRange } from '@vis.gl/react-google-maps';
import { getLightrequest } from '../api/traffic-feature.api';
import { set } from 'firebase/database';

// Convert TrafficLight to TrafficSignal for UI display
{
  /*function convertTrafficLightToSignal(light: TrafficLight): TrafficLight {
  const colorMap: { [key: number]: 'red' | 'yellow' | 'green' } = {
    0: 'red',
    1: 'green',
    2: 'yellow',
  };

  return {
    status: light.current_color === 1 ? light.green_duration : light.red_duration,
    current_color: light.current_color,
    intersection_id: light.intersection_id,
    auto_mode: light.auto_mode,
  };
}*/
}

interface MapContentProps {
  refreshRateMs: number;
}

function MapContent({ refreshRateMs }: MapContentProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const markersRef = useRef<Map<number, google.maps.Marker>>(new Map());
  // popup control
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState<trafficLight | null>(
    null
  );
  const [showDebug, setShowDebug] = useState(false);

  // Fetch traffic lights with configurable refresh rate
  const { trafficLights, loading, error, refetch, retryCount } =
    useTrafficLights(refreshRateMs);

  // Initialize Map with first traffic light as center
  useEffect(() => {
    if (ref.current && !map && trafficLights.length > 0) {
      const firstLight = trafficLights[0];
      const [lng, lat] = firstLight.location.coordinates;

      const initialMap = new window.google.maps.Map(ref.current, {
        center: { lat, lng },
        zoom: 15,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });
      setMap(initialMap);
    }
  }, [map, trafficLights]);

  // Create and update markers for all traffic lights
  useEffect(() => {
    if (!map) return;

    const currentMarkerIds = new Set(markersRef.current.keys());
    const newMarkerIds = new Set(trafficLights.map((light) => light.id));

    // Remove markers that are no longer in the data
    currentMarkerIds.forEach((id) => {
      if (!newMarkerIds.has(id)) {
        const marker = markersRef.current.get(id);
        if (marker) {
          marker.setMap(null);
          markersRef.current.delete(id);
        }
      }
    });

    // Create or update markers for all traffic lights
    trafficLights.forEach((light) => {
      const [lng, lat] = light.location.coordinates;

      const colorMap = {
        red: '#ef4444',
        yellow: '#fbbf24',
        green: '#22c55e',
      };

      const svgMarker = {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor:
          colorMap[
            light.current_color === 1
              ? 'red'
              : light.current_color === 2
                ? 'yellow'
                : 'green'
          ],
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
        scale: 20,
      };

      const existingMarker = markersRef.current.get(light.id);

      if (!existingMarker) {
        // Create new marker
        const marker = new google.maps.Marker({
          map,
          position: { lat, lng },
          icon: svgMarker,
          title: `INT-${light.intersection_id} (Road ${light.road_id})`,
          label: {
            text: String(light.status),
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 'bold',
          },
        });

        marker.addListener('click', () => {
          setSelectedSignal(light);
          setPopupOpen(true);
        });

        markersRef.current.set(light.id, marker);
      } else {
        // Update existing marker
        existingMarker.setIcon(svgMarker);
        existingMarker.setLabel({
          text: String(light.status),
          color: '#ffffff',
          fontSize: '14px',
          fontWeight: 'bold',
        });
        existingMarker.setPosition({ lat, lng });
      }
    });
  }, [map, trafficLights]);

  if (error) {
    const apiBaseUrl =
      import.meta.env.VITE_API_BASE_URL || 'http://localhost:3333';

    return (
      <>
        <div ref={ref} className="h-screen w-full bg-gray-100" />
        <div className="absolute top-20 left-1/2 z-10 max-w-lg -translate-x-1/2 rounded-lg border border-red-400 bg-red-50 p-4 shadow-lg">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-red-800">Connection Error</p>
                <p className="mt-1 text-sm text-red-700">{error.message}</p>
                {error.type && (
                  <p className="mt-1 text-xs text-red-600">
                    Type: <span className="font-mono">{error.type}</span>
                    {error.statusCode && ` (HTTP ${error.statusCode})`}
                  </p>
                )}
                {retryCount > 0 && (
                  <p className="mt-1 text-xs text-red-600">
                    Retry attempts: {retryCount}
                  </p>
                )}
              </div>
            </div>

            {/* Troubleshooting tips */}
            <div className="mt-3 border-t border-red-200 pt-3">
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
              >
                <span>{showDebug ? '▼' : '▶'}</span>
                Troubleshooting Tips
              </button>

              {showDebug && (
                <div className="mt-2 space-y-2 rounded bg-red-100 p-2 text-xs text-red-700">
                  <p>
                    <strong>API URL:</strong>{' '}
                    <span className="font-mono break-all">{apiBaseUrl}</span>
                  </p>
                  <p>
                    <strong>Endpoint:</strong>{' '}
                    <span className="font-mono">
                      {apiBaseUrl}/traffic-lights
                    </span>
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="font-semibold">Possible Issues:</p>
                    <ul className="list-inside list-disc space-y-1">
                      {error.type === 'network' && (
                        <>
                          <li>Backend server is not running</li>
                          <li>Wrong API URL: check .env file</li>
                          <li>Network/firewall blocking the connection</li>
                        </>
                      )}
                      {error.type === 'timeout' && (
                        <>
                          <li>Backend server is slow or unresponsive</li>
                          <li>Network connection is slow</li>
                        </>
                      )}
                      {error.type === 'server' && error.statusCode === 404 && (
                        <>
                          <li>API endpoint /traffic-lights not found</li>
                          <li>Backend routing may be incorrect</li>
                        </>
                      )}
                      {(error.type === 'unknown' || !error.type) && (
                        <>
                          <li>Check browser console for more details</li>
                          <li>
                            Verify backend is running:{' '}
                            <span className="font-mono">pnpm run dev</span>
                          </li>
                          <li>
                            Check .env configuration in frontend/.env or
                            .env.local
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Retry button */}
            {error.retryable && (
              <button
                onClick={() => refetch()}
                className="w-full rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700 active:bg-red-800"
              >
                {retryCount > 0
                  ? `Retry (Attempt ${retryCount + 1})`
                  : 'Retry Connection'}
              </button>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div ref={ref} className="h-screen w-full" />
      {loading && trafficLights.length === 0 && (
        <div className="absolute top-20 left-1/2 z-10 -translate-x-1/2 rounded-lg bg-blue-100 px-4 py-2 text-sm">
          <p className="text-blue-800">Loading traffic lights...</p>
        </div>
      )}
      <TrafficSettingPopup
        open={popupOpen}
        onOpenChange={(v) => setPopupOpen(v)}
        trafficLight={selectedSignal}
        onSave={(updated) => {
          setSelectedSignal((prev) => (prev ? { ...prev, ...updated } : null));
          setPopupOpen(false);
        }}
      />
    </>
  );
}

export default function TrafficAdminpage() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const [currentLocation, setCurrentLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [requestOpen, setrequestOpen] = useState(false);
  const [signalOpen, setsignalOpen] = useState(false);
  const [refreshrate, setrefreshrate] = useState(1);
  const [rrunit, setrrunit] = useState('sec');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [LightRequest, setLightRequest] = useState<lightRequest[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const base = import.meta.env.VITE_API_BASE_URL ?? '';
        const url = `http://localhost:3333/api/light-requests`;
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

  // Sample emergency requests
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

  const emptyemergencyRequests = [];

  // Sample offline signals
  const offlineSignals = [
    { id: 1, location: 'INT-002', lastSeen: '14:45', reason: 'Network Error' },
    { id: 2, location: 'INT-007', lastSeen: '14:30', reason: 'Power Loss' },
    {
      id: 3,
      location: 'INT-010',
      lastSeen: '13:50',
      reason: 'Device Malfunction',
    },
  ];

  const handleStart = () => {
    console.log('Start navigation:', { currentLocation, destination });
  };

  const refreshrange = (e: number) => {
    let sum = 0;
    const MIN_REFRESH_MS = 500; // Minimum 0.5 seconds
    const MAX_REFRESH_MS = 20000; // Maximum 20 seconds

    if (rrunit === 'sec') {
      sum = e * 1000;
    } else if (rrunit === 'milisec') {
      sum = e;
    }

    if (sum > MAX_REFRESH_MS) {
      if (rrunit === 'sec') setrefreshrate(20);
      else if (rrunit === 'milisec') setrefreshrate(MAX_REFRESH_MS);
    } else if (sum < MIN_REFRESH_MS) {
      if (rrunit === 'sec') {
        setrefreshrate(0.5);
      } else if (rrunit === 'milisec') {
        setrefreshrate(MIN_REFRESH_MS);
      }
    } else if (sum >= MIN_REFRESH_MS && sum <= MAX_REFRESH_MS) {
      setrefreshrate(e);
    }
  };

  const handleMapsetting = () => {
    setSettingsOpen(!settingsOpen);
    refreshrange(refreshrate);
  };

  return (
    <div className="relative h-screen w-full">
      {/* Location Input */}
      <div className="absolute top-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-full bg-white px-4 py-2 shadow-lg">
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

      {/* Control Panel */}

      <div className="absolute top-10 right-6 z-10 mt-12 flex flex-col gap-2">
        {!requestOpen && !signalOpen && (
          <button
            onClick={() => handleMapsetting()}
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
            {offlineSignals.length > 0 && (
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

        {/*Map Setting*/}
        {settingsOpen && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="pr-20 text-lg font-bold text-gray-800">
                  Admin setting{' '}
                </h3>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="text-xl text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              {/* refresh rate */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Map Refresh Rate
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="refresh rate"
                    value={refreshrate}
                    onChange={(e) => setrefreshrate(Number(e.target.value))}
                    min={rrunit === 'sec' ? 0.5 : 500}
                    max={rrunit === 'sec' ? 20 : 20000}
                    step={rrunit === 'sec' ? 1 : 1000}
                    className="w-32 rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                  />

                  <select
                    value={rrunit}
                    onChange={(e) => setrrunit(e.target.value)}
                    className="rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                  >
                    <option value="sec">seconds</option>
                    <option value="milisec">milliseconds</option>
                  </select>
                </div>
                <p className="mt-2 text-xs text-gray-600">
                  {rrunit === 'sec'
                    ? 'Valid range: 0.5 - 20 seconds'
                    : 'Valid range: 500 - 20000 milliseconds'}
                </p>
              </div>

              {/*sample setting */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Zoom Level
                </label>
                <input
                  type="range"
                  min="10"
                  max="20"
                  defaultValue="18"
                  className="w-full"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Map Type
                </label>
                <select className="w-full rounded-md border border-gray-300 px-3 py-2">
                  <option>Roadmap</option>
                  <option>Satellite</option>
                  <option>Terrain</option>
                  <option>Hybrid</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/*Emer re*/}
        {requestOpen && (
          <div className="max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
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
                        <strong>Reason:</strong> {request.reason}
                      </p>
                      <p>
                        <strong>Time:</strong> {request.time}
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
          <div className="max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  Offline Signals
                </h3>
                <button
                  onClick={() => setsignalOpen(false)}
                  className="text-xl text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
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
                          Traffic Light NO. {LR.traffic_light_id}
                        </div>
                        <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-bold text-yellow-700">
                          Offline
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>
                          <strong>Reason:</strong> {LR.reason}
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
      <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-lg border border-yellow-400 bg-yellow-100 px-4 py-2 text-sm">
        <p className="text-yellow-800">
          <strong>Note : </strong>
          Now you are on Traffic Admin page
        </p>
      </div>

      <ConfirmPopup
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm Settings"
        description={`Are you sure you want to save these settings? Refresh rate will be set to ${refreshrate} ${rrunit}.`}
        confirmText="Save"
        cancelText="Cancel"
        onConfirm={() => {
          console.log('Settings saved:', { refreshrate, rrunit });
          setSettingsOpen(false);
        }}
      />

      <Wrapper apiKey={apiKey}>
        {(() => {
          let refreshRateMs = 0;
          if (refreshrate && refreshrate > 0) {
            refreshRateMs = rrunit === 'sec' ? refreshrate * 1000 : refreshrate;
          }
          return <MapContent refreshRateMs={refreshRateMs} />;
        })()}
      </Wrapper>
    </div>
  );
}
