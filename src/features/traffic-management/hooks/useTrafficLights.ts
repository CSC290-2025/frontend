import { useEffect, useState, useRef } from 'react';
import { getTrafficLights } from '../api/traffic-feature.api';
import type { TrafficLight } from '../types/traffic.types';

export interface NetworkError extends Error {
  type: 'network' | 'timeout' | 'server' | 'unknown';
  statusCode?: number;
  retryable: boolean;
}

interface UseTrafficLightsReturn {
  trafficLights: TrafficLight[];
  total: number;
  loading: boolean;
  error: NetworkError | null;
  refetch: () => Promise<void>;
  retryCount: number;
}

const createNetworkError = (err: unknown): NetworkError => {
  const baseError =
    err instanceof Error ? err : new Error('Failed to fetch traffic lights');
  const networkError: NetworkError = {
    ...baseError,
    type: 'unknown',
    retryable: true,
  };

  if (
    baseError.message.includes('Network') ||
    baseError.message.includes('network')
  ) {
    networkError.type = 'network';
  } else if (baseError.message.includes('timeout')) {
    networkError.type = 'timeout';
  } else if ((err as any)?.response?.status) {
    networkError.type = 'server';
    networkError.statusCode = (err as any).response.status;
    networkError.retryable =
      (err as any).response.status >= 500 ||
      [408, 429].includes((err as any).response.status);
  }

  return networkError;
};

export function useTrafficLights(refreshRate?: number): UseTrafficLightsReturn {
  const [trafficLights, setTrafficLights] = useState<TrafficLight[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<NetworkError | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const fetchTrafficLights = async () => {
    try {
      if (trafficLights.length === 0) {
        setLoading(true);
      }
      setError(null);
      const response = await getTrafficLights();

      if (response.success) {
        setTrafficLights(response.data.trafficLights);
        setTotal(response.data.total);
        setRetryCount(0);
      }
    } catch (err) {
      const networkError = createNetworkError(err);
      setError(networkError);
      console.error('Failed to fetch traffic lights:', networkError);
    } finally {
      setLoading(false);
    }
  };

  const retry = async () => {
    setRetryCount((prev) => prev + 1);
    await fetchTrafficLights();
  };

  useEffect(() => {
    fetchTrafficLights();

    let interval: NodeJS.Timeout;
    if (refreshRate && refreshRate > 0) {
      interval = setInterval(fetchTrafficLights, refreshRate);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, [refreshRate]);

  return {
    trafficLights,
    total,
    loading,
    error,
    refetch: retry,
    retryCount,
  };
}
