import React, { type FC, type ReactNode } from 'react';
import { cn } from '@/lib/utils.ts';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import config from '@/features/emergency/config/env';
import { useGeoLocation } from '@/features/emergency/hooks/geo-location.tsx';
import { Button } from '@/features/emergency/components/ui/button.tsx';
import { Crosshair } from 'lucide-react';

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
    <div
      className={cn(
        'relative justify-end overflow-hidden shadow-lg',
        classname
      )}
    >
      <Crosshair
        className="bg-secondary text-secondary-foreground hover:bg-secondary/80 absolute right-0 z-20 z-50 m-4 cursor-pointer rounded-full border-4"
        size={30}
        onClick={() => {
          if (map) {
            map.panTo(markerPosition);
            map.setZoom(18);
          }
        }}
      />
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
        <MarkerF position={markerPosition} />
        {children}
        {/* Child components, such as markers, info windows, etc. */}
      </GoogleMap>
    </div>
  ) : (
    <></>
  );
};

export default React.memo(MapInit);
