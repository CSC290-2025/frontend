import { useRef, useState, useEffect } from 'react';
import TrafficSettingPopup from '../components/TrafficSettingPopup';
import ConfirmPopup from '../components/Comfirmpopup';
import type { TrafficSignal } from '../types/traffic.types';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { set } from 'firebase/database';

// Standalone traffic signal simulation
function useStandaloneTrafficSignal() {
  const [signal, setSignal] = useState({
    lat: 13.647372072504554,
    lng: 100.49553588244684,
    duration: 45,
    color: 'red' as 'red' | 'yellow' | 'green',
    intersectionId: 1,
  });

  // Simulate traffic light countdown
  {
    /*useEffect(() => {
    const timer = setInterval(() => {
      setSignal((prev) => {
        if (prev.duration <= 1) {
          // Switch to next color
          const nextColor =
            prev.color === 'red'
              ? 'green'
              : prev.color === 'green'
                ? 'yellow'
                : 'red';

          const nextDuration =
            nextColor === 'red' ? 45 : nextColor === 'green' ? 30 : 5;

          return {
            ...prev,
            color: nextColor,
            duration: nextDuration,
          };
        }
        return { ...prev, duration: prev.duration - 1 };
      });
  }, 1000);

    return () => clearInterval(timer);
  }, []);*/
  }

  return { signal, setSignal, loading: false, error: null };
}

function MapContent() {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  // popup control
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState<TrafficSignal | null>(
    null
  );
  const signalRef = useRef<typeof signal | null>(null);

  const { signal, setSignal } = useStandaloneTrafficSignal();

  // keep a ref to latest signal so marker click handlers can read current value
  useEffect(() => {
    signalRef.current = signal as any;
  }, [signal]);

  // Initialize Map
  useEffect(() => {
    if (ref.current && !map && signal) {
      const initialMap = new window.google.maps.Map(ref.current, {
        center: { lat: signal.lat, lng: signal.lng },
        zoom: 18,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });
      setMap(initialMap);
    }
  }, [map, signal]);

  // Create and update marker with label
  useEffect(() => {
    if (!map || !signal) return;

    const colorMap = {
      red: '#ef4444',
      yellow: '#fbbf24',
      green: '#22c55e',
    };

    // Create SVG marker with duration text
    const svgMarker = {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: colorMap[signal.color],
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 3,
      scale: 20,
    };

    if (!markerRef.current) {
      // Create marker first time
      const marker = new google.maps.Marker({
        map,
        position: { lat: signal.lat, lng: signal.lng },
        icon: svgMarker,
        title: String(signal.intersectionId),
        label: {
          text: String(signal.duration),
          color: '#ffffff',
          fontSize: '16px',
          fontWeight: 'bold',
        },
      });
      markerRef.current = marker;
    } else {
      // Update existing marker icon and label
      markerRef.current.setIcon(svgMarker);
      markerRef.current.setLabel({
        text: String(signal.duration),
        color: '#ffffff',
        fontSize: '16px',
        fontWeight: 'bold',
      });
      // nothing else needed here; popup is handled by React
    }
    // Attach marker click handler once (safe-guard using flag)
    if (markerRef.current && !(markerRef.current as any)._reactClickAttached) {
      markerRef.current.addListener('click', () => {
        // use latest signal from ref
        const latest = signalRef.current as any;
        setSelectedSignal(latest ?? signal);
        setPopupOpen(true);
      });
      (markerRef.current as any)._reactClickAttached = true;
    }

    // cleanup no-op
    return () => undefined;
  }, [map, signal]);

  // end MapContent

  return (
    <>
      <div ref={ref} className="h-screen w-full" />
      <TrafficSettingPopup
        open={popupOpen}
        onOpenChange={(v) => setPopupOpen(v)}
        signal={selectedSignal}
        onSave={(updated) => {
          // update the underlying signal state so marker updates
          setSignal((prev: any) => ({ ...prev, ...updated }));
          setPopupOpen(false);
        }}
      />
    </>
  );
}

const render = (status: Status) => {
  if (status === Status.FAILURE)
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Error loading map.
      </div>
    );
  if (status === Status.LOADING)
    return (
      <div className="flex h-screen items-center justify-center">
        Loading Map...
      </div>
    );
  return (
    <div className="flex h-screen items-center justify-center">
      Initializing map...
    </div>
  );
};

export default function TrafficAdminpage() {
  const apiKey = 'AIzaSyCSfRzShn1CNQhK1WRbcBYao-veqTr201w';
  const [currentLocation, setCurrentLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [requestOpen, setrequestOpen] = useState(false);
  const [signalOpen, setsignalOpen] = useState(false);
  const [refreshrate, setrefreshrate] = useState(1);
  const [rrunit, setrrunit] = useState('sec');
  const [confirmOpen, setConfirmOpen] = useState(false);

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

  const refreshrange = (e) => {
    let sum = 0;
    if (rrunit === 'sec') {
      sum = e * 1000;
    } else if (rrunit === 'milisec') {
      sum = e;
    }

    if (sum > 20000) {
      if (rrunit === 'sec') setrefreshrate(20);
      else if (rrunit === 'milisec') setrefreshrate(20000);
    } else if (sum < 500) {
      if (rrunit === 'sec') {
        setrefreshrate(0.5);
      } else if (rrunit === 'milisec') {
        setrefreshrate(500);
      }
    } else if (sum >= 500 && sum <= 20000) {
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
              <label className="text-sm">Map Refresh rate</label>
              <div>
                <input
                  type="number"
                  placeholder="refresh rate (s)"
                  value={refreshrate}
                  onChange={(e) => setrefreshrate(Number(e.target.value))}
                  className="mr-2 w-40 rounded-md px-3 py-2 outline-1"
                />

                <select
                  value={rrunit}
                  onChange={(e) => setrrunit(e.target.value)}
                  className="w-25 rounded-md border border-gray-300 px-3 py-2"
                >
                  <option>sec</option>
                  <option>milisec</option>
                </select>
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
                {offlineSignals.length > 0 ? (
                  offlineSignals.map((signal) => (
                    <div
                      key={signal.id}
                      className="rounded-md border border-yellow-200 bg-yellow-50 p-3 hover:bg-yellow-100"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <div className="font-semibold text-gray-800">
                          {signal.location}
                        </div>
                        <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-bold text-yellow-700">
                          Offline
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>
                          <strong>Reason:</strong> {signal.reason}
                        </p>
                        <p>
                          <strong>Last Seen:</strong> {signal.lastSeen}
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

      <Wrapper apiKey={apiKey} render={render}>
        <MapContent />
      </Wrapper>
    </div>
  );
}
