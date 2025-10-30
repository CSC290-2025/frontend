import * as z from 'zod';
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

const ReportFromSchema = z.object({
  title: z.string(),
  description: z.string(),
  image_url: z.string(),
  ambulance_service: z.boolean().default(false),
});
type ReportFrom = z.infer<typeof ReportFromSchema>;

type ReportFromState = {
  location: string;
  findLocation: () => void;
};

const ReportFromContext = createContext<ReportFromState | null>(null);

export function ReportFromProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState('');

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
      (pos: GeolocationPosition) => {
        const coords = `${pos.coords.latitude}, ${pos.coords.longitude}`;
        setLocation(coords);
      },
      (err) => {
        console.log('Error getting location:', err);
      }
    );
  }

  return (
    <ReportFromContext.Provider
      value={{
        location,
        findLocation,
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
