import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

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

    return geolocation.watchPosition(
      (pos: GeolocationPosition) => {
        const coords = `${pos.coords.latitude}, ${pos.coords.longitude}`;
        setLocation(coords);
      },
      (err) => {
        console.error('Error getting location:', err);
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
