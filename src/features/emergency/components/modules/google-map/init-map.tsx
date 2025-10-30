import React, { type FC, type ReactNode } from 'react';
import { cn } from '@/lib/utils.ts';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';

type MapInitProps = {
  children: ReactNode;
  classname?: string;
};

const center = {
  lat: -3.745,
  lng: -38.523,
};

const MapInit: FC<MapInitProps> = ({ classname, children }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyCSfRzShn1CNQhK1WRbcBYao-veqTr201w',
    libraries: ['marker'],
  });

  const [map, setMap] = React.useState<google.maps.Map | null>(null);

  const onLoad = React.useCallback(function callback(map: google.maps.Map) {
    // This is just an example of getting and using the map instance!!! don't just blindly copy!
    // const bounds = new window.google.maps.LatLngBounds(center)
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
        center={center}
        zoom={10}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {children}
        {/* Child components, such as markers, info windows, etc. */}
      </GoogleMap>
    </div>
  ) : (
    <></>
  );
};

export default React.memo(MapInit);
