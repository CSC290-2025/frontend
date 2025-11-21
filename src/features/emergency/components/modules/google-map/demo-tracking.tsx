import React, {
  type FC,
  type ReactNode,
  useEffect,
  useCallback,
  useState,
} from 'react';
import { cn } from '@/lib/utils.ts';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import config from '@/features/emergency/config/env';
import { ref, set, remove } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Crosshair } from 'lucide-react';

type DemoTrackingProps = {
  children?: ReactNode;
  classname?: string;
};

type MoveTypes = {
  lat: number;
  lng: number;
};

const DemoTracking: FC<DemoTrackingProps> = ({ classname, children }) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [move, setMove] = useState<MoveTypes>({
    lat: 13.736717,
    lng: 100.523186,
  });

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: config.GOOGLE_API_KEY,
  });

  const start = { lat: 13.736717, lng: 100.523186 };
  const stop = { lat: 13.745, lng: 100.53 };
  const STEP = 0.0005;
  const teamId = '13';
  const path = ref(database, `teams/${teamId}/ambulance_car `);
  const saveMoveToDB = useCallback(async (lat: number, lng: number) => {
    try {
      await set(path, {
        lat,
        lng,
        updatedAt: Date.now(),
      });
      console.log('Saved data to Firebase:', { lat, lng });

      // setTimeout(async () => {
      //     await remove(ref(database, `teams/${teamId}`))
      // }, 5000)
    } catch (err) {
      console.error('Firebase error:', err);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setMove((prev) => {
        let { lat, lng } = prev;

        switch (e.key.toLowerCase()) {
          case 'w':
            lat += STEP;
            break;
          case 's':
            lat -= STEP;
            break;
          case 'a':
            lng -= STEP;
            break;
          case 'd':
            lng += STEP;
            break;
          default:
            return prev;
        }
        map?.panTo({ lat, lng });
        saveMoveToDB(lat, lng);

        return { lat, lng };
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [map, saveMoveToDB]);

  const onLoad = useCallback((map: google.maps.Map) => setMap(map), []);
  const onUnmount = useCallback(() => setMap(null), []);

  return isLoaded ? (
    <div
      className={cn(
        'relative justify-end overflow-hidden shadow-lg',
        classname
      )}
    >
      <Crosshair
        className="bg-secondary text-secondary-foreground hover:bg-secondary/80 absolute right-0 z-20 m-4 cursor-pointer rounded-full border-4"
        size={30}
        onClick={() => map?.panTo(move)}
      />
      <GoogleMap
        mapContainerClassName="w-full h-full"
        center={move}
        zoom={15}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          cameraControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        <MarkerF position={start} label="Start" />
        <MarkerF position={stop} label="Stop" />
        <MarkerF
          position={move}
          draggable
          label="Move"
          onDragEnd={(e) => {
            const lat = e.latLng?.lat();
            const lng = e.latLng?.lng();
            if (lat !== undefined && lng !== undefined) {
              setMove({ lat, lng });
              saveMoveToDB(lat, lng);
              map?.panTo({ lat, lng });
            }
          }}
        />
        {children}
      </GoogleMap>
    </div>
  ) : null;
};

export default React.memo(DemoTracking);
