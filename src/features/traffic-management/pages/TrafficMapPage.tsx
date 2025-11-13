import { useRef, useState, useEffect } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import ControlPanel from '../components/ControlPanel';
import LocationInput from '../components/LocationInput';
import { MapSettingsPanel } from '@/features/traffic-management';

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

  return { signal, loading: false, error: null };
}

function MapContent() {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  const { signal } = useStandaloneTrafficSignal();

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
    }
  }, [map, signal]);

  return <div ref={ref} className="h-screen w-full" />;
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

export default function TrafficMapPage() {
  const apiKey = 'AIzaSyCSfRzShn1CNQhK1WRbcBYao-veqTr201w';
  const [currentLocation, setCurrentLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const handleStart = () => {
    console.log('Start navigation:', { currentLocation, destination });
  };

  const handleMapSettingsClick = () => {
    setShowSettings(true);
  };

  const handleEmergencyClick = () => {
    console.log('Emergency request triggered');
    // Add your emergency logic here
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  const handleSaveSettings = (settings: object) => {
    console.log('Settings saved:', settings);
    // You can use these settings to:
    // - Update map refresh rate
    // - Update traffic light detection distance
    // - Apply other map configurations
  };

  return (
    <div className="relative mt-24 h-screen w-full">
      {/* Border container */}
      <div className="mx-auto flex max-w-[1100px] flex-col items-center rounded-xl border-2 border-gray-200 bg-white p-6 shadow-md">
        {/* Location Input Section */}
        <div className="mb-16 w-full">
          <LocationInput
            currentLocation={currentLocation}
            destination={destination}
            onCurrentLocationChange={setCurrentLocation}
            onDestinationChange={setDestination}
            onStart={handleStart}
          />
        </div>

        {/* Divider line */}
        <div className="mb-6 w-full border-t-2 border-gray-200 shadow-md" />

        {/* Map Section */}
        <div className="relative h-[600px] w-full overflow-hidden rounded-lg">
          <Wrapper apiKey={apiKey} render={render}>
            <MapContent />
          </Wrapper>
        </div>
      </div>

      {/* Control Panel Component */}
      <ControlPanel
        onMapSettingsClick={handleMapSettingsClick}
        onEmergencyClick={handleEmergencyClick}
      />

      {/* Map Settings Panel Component */}
      <MapSettingsPanel
        isOpen={showSettings}
        onClose={handleCloseSettings}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
