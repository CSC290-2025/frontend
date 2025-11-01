import axios from 'axios';
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import config from '@/features/emergency/config/env.ts';

type Location = { lat: string; long: string };

type GeoLocationState = {
  location: Location;
  address: string;
  findLocation: () => number | undefined;
  isLoading: boolean;
};

const GeoLocationContext = createContext<GeoLocationState | null>(null);

export function GeoLocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<Location>({ lat: '', long: '' });
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const watchId = findLocation();

    return () => {
      if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  function findLocation(): number | undefined {
    const geolocation = navigator.geolocation;
    if (!geolocation) {
      console.warn('Geolocation is not supported');
      return;
    }

    return geolocation.watchPosition(
      async (pos) => {
        const lat = pos.coords.latitude.toString();
        const long = pos.coords.longitude.toString();

        setLocation({ lat, long });

        if (!isLoading && !address) {
          setIsLoading(true);
          try {
            const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${long}&apiKey=${config.GEO_API_KEY}`;
            const res = await axios.get(url);
            const formatted =
              res.data?.features?.[0]?.properties?.formatted ?? '';
            setAddress(formatted);
          } catch (err) {
            console.error(err);
          } finally {
            setIsLoading(false);
          }
        }
      },
      (err) => console.error('Error getting location:', err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  return (
    <GeoLocationContext.Provider
      value={{ location, address, findLocation, isLoading }}
    >
      {children}
    </GeoLocationContext.Provider>
  );
}

export const useGeoLocation = () => {
  const context = useContext(GeoLocationContext);
  if (!context)
    throw new Error('useGeoLocation must be used within GeoLocationProvider');
  return context;
};
