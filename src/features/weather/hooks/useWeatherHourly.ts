import { useQuery } from '@tanstack/react-query';
import {
  fetchWeatherHourly,
  type WeatherHourlyResponse,
} from '../api/weather.api';

export const useWeatherHourly = (locationId: number) =>
  useQuery<WeatherHourlyResponse>({
    queryKey: ['weather', 'hourly', locationId],
    queryFn: () => fetchWeatherHourly(locationId),
    enabled: Number.isFinite(locationId),
    staleTime: 5 * 60 * 1000,
  });
