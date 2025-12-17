import React, { useEffect, useMemo } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Polyline,
} from '@react-google-maps/api';

interface MapViewProps {
  origin?: { lat: number; lng: number };
  destination?: { lat: number; lng: number };
  onMapClick?: (lat: number, lng: number) => void;
  routePolyline?: string;
}

const libraries: ('places' | 'drawing' | 'geometry' | 'visualization')[] = [
  'places',
  'geometry',
];

const containerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '0.75rem',
};

const defaultCenter = {
  lat: 13.727,
  lng: 100.493,
};

const MapView = ({
  origin,
  destination,
  onMapClick,
  routePolyline,
}: MapViewProps) => {
  const [map, setMap] = React.useState<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY as string,
    libraries: libraries,
  });

  const center = useMemo(
    () => destination || origin || defaultCenter,
    [destination, origin]
  );

  const fitBounds = React.useCallback(
    (currentMap: google.maps.Map | null) => {
      if (currentMap && (origin || destination)) {
        const bounds = new window.google.maps.LatLngBounds();
        if (origin) bounds.extend(origin);
        if (destination) bounds.extend(destination);

        if (origin && destination) {
          currentMap.fitBounds(bounds);
        } else {
          currentMap.setCenter(center);
          currentMap.setZoom(13);
        }
      }
    },
    [origin, destination, center]
  );

  const onLoad = React.useCallback(
    (currentMap: google.maps.Map) => {
      setMap(currentMap);
      fitBounds(currentMap);
    },
    [fitBounds]
  );

  useEffect(() => {
    fitBounds(map);
  }, [origin, destination, map, fitBounds]);

  const onUnmount = React.useCallback(() => {
    setMap(null);
  }, []);

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (onMapClick && event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      onMapClick(lat, lng);
    }
  };

  // 🟢 แปลง Encoded Polyline เป็น Array ของ LatLng Objects
  const path = useMemo(() => {
    if (routePolyline && isLoaded && window.google?.maps?.geometry?.encoding) {
      return window.google.maps.geometry.encoding.decodePath(routePolyline);
    }
    return [];
  }, [routePolyline, isLoaded]);

  if (loadError) return <div>Map Load Error: {loadError.message}</div>;
  if (!isLoaded) return <div style={containerStyle}>Loading Map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={13}
      onClick={handleMapClick}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {origin && <Marker position={origin} label="A" />}
      {destination && <Marker position={destination} label="B" />}

      {/* 🟢 วาด Polyline */}
      {path.length > 0 && (
        <Polyline
          path={path}
          options={{
            strokeColor: '#1E90FF',
            strokeOpacity: 0.8,
            strokeWeight: 4,
          }}
        />
      )}
    </GoogleMap>
  );
};

export default React.memo(MapView);
