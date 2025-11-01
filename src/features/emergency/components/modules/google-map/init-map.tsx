import React, { type FC, type ReactNode } from 'react';
import { cn } from '@/lib/utils.ts';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import config from '@/features/emergency/config/env';
import { useGeoLocation } from '@/features/emergency/hooks/geo-location.tsx';

type MapInitProps = {
  children: ReactNode;
  classname?: string;
};

const MapInit: FC<MapInitProps> = ({ classname, children }) => {
  const { location } = useGeoLocation();

  const markerPosition = {
    lat: Number(location.lat) || 0,
    lng: Number(location.long) || 0,
  };
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: config.GOOGLE_API_KEY,
    // libraries: [],
  });

  const [map, setMap] = React.useState<google.maps.Map | null>(null);

  const onLoad = React.useCallback(function callback(map: google.maps.Map) {
    // This is just an example of getting and using the map instance!!! don't just blindly copy!
    // const bounds = new window.google.maps.LatLngBounds(markerPosition)
    // map.fitBounds(bounds)

    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  return isLoaded ? (
    <div className={cn('overflow-hidden shadow-lg', classname)}>
      <GoogleMap
        mapContainerClassName="w-full h-full"
        center={markerPosition}
        zoom={location ? 15 : 10}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          cameraControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        <Marker position={markerPosition} />
        {children}
        {/* Child components, such as markers, info windows, etc. */}
      </GoogleMap>
    </div>
  ) : (
    <></>
  );
};

export default React.memo(MapInit);
