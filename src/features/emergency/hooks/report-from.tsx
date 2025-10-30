import * as z from 'zod';
import axios from 'axios';
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import config from '@/features/emergency/config/env.ts';

const ReportFromSchema = z.object({
  title: z.string(),
  description: z.string(),
  image_url: z.string(),
  ambulance_service: z.boolean().default(false),
});
type ReportFrom = z.infer<typeof ReportFromSchema>;

type ReportFromState = {
  location: Location;
  address: string;
  findLocation: () => void;
};

type Location = {
  lat: string;
  long: string;
};

const ReportFromContext = createContext<ReportFromState | null>(null);

export function ReportFromProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<Location>({
    lat: '',
    long: '',
  });
  const [address, setAddress] = useState<string>('');

  useEffect(() => {
    const unsubscribe = findLocation();

    return () => {
      if (unsubscribe) navigator?.geolocation?.clearWatch(unsubscribe);
    };
  }, []);

  function findLocation() {
    const geolocation = window.navigator.geolocation;
    if (!geolocation) {
      console.log('Geolocation is not supported');
      return;
    }

    return navigator.geolocation.watchPosition(
      async (pos: GeolocationPosition) => {
        const lat = pos.coords.latitude;
        const long = pos.coords.longitude;
        console.log(pos.coords.latitude, pos.coords.longitude);

        setLocation((prev) => ({
          ...prev,
          lat: lat.toString(),
          long: long.toString(),
        }));
        try {
          const geoApiKay = config.GEO_API_KEY;
          const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${long}&apiKey=${geoApiKay}`;

          const res = await axios.get(url);
          const address = res.data?.features?.[0]?.properties?.formatted ?? '';
          setAddress(address);
          console.log(address);
        } catch (error) {
          console.log(error);
        }
      },
      (err) => {
        console.log('Error getting location:', err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  return (
    <ReportFromContext.Provider
      value={{
        location,
        findLocation,
        address,
      }}
    >
      {children}
    </ReportFromContext.Provider>
  );
}

export const useReportFrom = () => {
  const context = useContext(ReportFromContext);

  if (!context) {
    throw new Error('useReportFrom must be used within the ReportProvider');
  }
  return context;
};
