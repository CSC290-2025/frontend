import { useRef, useState, useEffect } from 'react';
import TrafficSettingPopup from '../components/TrafficSettingPopup';
import type { TrafficSignal } from '../types/traffic.types';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

// Standalone traffic signal simulation
function useStandaloneTrafficSignal() {
  const [signal, setSignal] = useState({
    lat: 13.647372072504554,
    lng: 100.49553588244684,
    duration: 45,
    color: 'red' as 'red' | 'yellow' | 'green',
    intersectionId: 'INT-001',
  });

  // Simulate traffic light countdown
  useEffect(() => {
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
  }, []);

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
      scale: 24,
    };

    if (!markerRef.current) {
      // Create marker first time
      const marker = new google.maps.Marker({
        map,
        position: { lat: signal.lat, lng: signal.lng },
        icon: svgMarker,
        title: signal.intersectionId,
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

  const handleStart = () => {
    console.log('Start navigation:', { currentLocation, destination });
  };

  return (
    <div className="relative h-screen w-full">
      {/* Location Input */}
      <div className="absolute top-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-full bg-white px-4 py-2 shadow-lg">
        <input
          type="text"
          placeholder="Current Location"
          value={currentLocation}
          onChange={(e) => setCurrentLocation(e.target.value)}
          className="min-w-[200px] rounded-full border-none px-3 py-2 outline-none"
        />

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
            d="M14 5l7 7m0 0l-7 7m7-7H3"
          />
        </svg>

        <input
          type="text"
          placeholder="Destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="min-w-[200px] rounded-full border-none px-3 py-2 outline-none"
        />

        <button
          onClick={handleStart}
          className="rounded-full bg-blue-600 px-8 py-2 font-medium text-white transition hover:bg-blue-700"
        >
          Start
        </button>
      </div>

      {/* Control Panel */}
      <div className="absolute top-4 right-4 z-10 mt-12 flex flex-col gap-2">
        <button className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-white shadow-lg hover:bg-blue-700">
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

        <button className="flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-white shadow-lg hover:bg-red-700">
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
      </div>

      {/* Info Box */}
      <div className="absolute top-4 left-4 z-10 min-w-[200px] rounded-lg bg-white p-4 shadow-lg">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="font-semibold">Location: INT-001</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-medium text-green-600">Simulation Mode</span>
          </div>
          <div className="mt-2 border-t pt-2 text-xs text-gray-500">
            bruh admin
          </div>
        </div>
      </div>

      {/* Note for ESP32 connection */}
      <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-lg border border-yellow-400 bg-yellow-100 px-4 py-2 text-sm">
        <p className="text-yellow-800">
          <strong>Note:</strong>
          Now you are on TrafficAdminpage
        </p>
      </div>

      <Wrapper apiKey={apiKey} render={render}>
        <MapContent />
      </Wrapper>
    </div>
  );
}
