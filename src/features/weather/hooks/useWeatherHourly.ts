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
    // transform API result: round start time to nearest :00 (round up if minutes >= 30),
    // then produce 5 hourly entries from that start
    select: (data) => {
      const src = data.hourly_forecast ?? [];
      const now = new Date();
      const minutes = now.getMinutes();

      // Determine start hour: if minutes >= 30 -> next hour, else current hour
      const start = new Date(now);
      if (minutes >= 30) {
        start.setHours(start.getHours() + 1);
      }
      start.setMinutes(0, 0, 0);

      const formatted: typeof src = Array.from({ length: 5 }).map((_, i) => {
        const d = new Date(start);
        d.setHours(start.getHours() + i);
        // ensure format ends with ":00"
        const timeLabel = d.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });

        const srcItem = src[i];
        if (srcItem) {
          return {
            ...srcItem,
            time: timeLabel,
          };
        }

        // fallback if API doesn't have this index
        return {
          time: timeLabel,
          temperature: 0,
          condition: '',
          precipitation_chance: null,
        };
      });

      return { ...data, hourly_forecast: formatted };
    },
  });
