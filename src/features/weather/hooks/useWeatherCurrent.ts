import { useQuery } from '@tanstack/react-query';
import {
  fetchWeatherCurrent,
  type WeatherCurrentResponse,
} from '../api/weather.api';

export const useWeatherCurrent = (locationId: number) =>
  useQuery<WeatherCurrentResponse>({
    queryKey: ['weather', 'current', locationId],
    queryFn: () => fetchWeatherCurrent(locationId),
    enabled: Number.isFinite(locationId),
    staleTime: 5 * 60 * 1000,
  });
