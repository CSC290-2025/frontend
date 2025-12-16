import { useQuery } from '@tanstack/react-query';
import {
  fetchWeatherDaily,
  type WeatherDailyResponse,
} from '../api/weather.api';

export const useWeatherDaily = (locationId: number) =>
  useQuery<WeatherDailyResponse>({
    queryKey: ['weather', 'daily', locationId],
    queryFn: () => fetchWeatherDaily(locationId),
    enabled: Number.isFinite(locationId),
    staleTime: 15 * 60 * 1000,
  });
