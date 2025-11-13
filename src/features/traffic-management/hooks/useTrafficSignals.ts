import { useEffect, useState } from 'react';
import { subscribeToTrafficSignal } from '../api/signal.api';
import type { TrafficLight } from '../types/traffic.types';
import type { TrafficSignal } from '../types/traffic.types';

export function useTrafficSignals() {
  const [signal, setSignal] = useState<TrafficSignal | null>(null);
  const [light, setLight] = useState<TrafficLight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);

    const unsubscribe = subscribeToTrafficSignal((data) => {
      setSignal(data);

      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { signal, loading, error };
}
