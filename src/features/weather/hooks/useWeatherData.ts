import { useMemo } from 'react';
import { useWeatherCurrent } from './useWeatherCurrent';
import { useWeatherHourly } from './useWeatherHourly';
import { useWeatherDaily } from './useWeatherDaily';

const conditionIconMap: Record<string, string> = {
  Sunny: '☀️',
  'Partly Cloudy': '⛅️',
  Cloudy: '☁️',
  Fog: '🌫️',
  Rain: '🌧️',
  Snow: '❄️',
  Thunderstorm: '⛈️',
};

const getConditionIcon = (condition?: string | null) =>
  condition ? (conditionIconMap[condition] ?? '🌡️') : '🌡️';

const formatHour = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const formatDay = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
};

export type WeatherUIData = {
  temperature: number;
  feelLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  conditionIcon: string;
  forecastHourly: { time: string; temp: number; icon: string }[];
  forecastWeekly: { day: string; temp: number; icon: string }[];
  warning: string;
  warningDetail: string;
};

export function useWeatherData(locationId = 1) {
  const current = useWeatherCurrent(locationId);
  const hourly = useWeatherHourly(locationId);
  const daily = useWeatherDaily(locationId);

  const data = useMemo<WeatherUIData | undefined>(() => {
    if (!current.data || !current.data.current) {
      return undefined;
    }

    const currentSnapshot = current.data.current;

    const hourlyItems = hourly.data?.hourly_forecast ?? [];
    const dailyItems = daily.data?.daily_forecast ?? [];

    const forecastHourly = hourlyItems.slice(0, 5).map((item) => ({
      time: formatHour(item.time),
      temp: Math.round(item.temperature),
      icon: getConditionIcon(item.condition),
    }));

    const forecastWeekly = dailyItems.slice(0, 7).map((item) => ({
      day: formatDay(item.date),
      temp: Math.round(item.high),
      icon: getConditionIcon(item.condition),
    }));

    const condition = currentSnapshot.condition ?? 'Unknown';

    return {
      temperature: Math.round(currentSnapshot.temperature),
      feelLike: Math.round(currentSnapshot.feels_like),
      humidity: currentSnapshot.humidity,
      windSpeed: Math.round(currentSnapshot.wind_speed),
      condition,
      conditionIcon: getConditionIcon(condition),
      forecastHourly,
      forecastWeekly,
      warning: condition.includes('Rain') ? 'Rain Alert' : 'No Weather Warning',
      warningDetail: condition.includes('Rain')
        ? 'Carry an umbrella. Showers expected in the next few hours.'
        : 'Conditions are calm. No severe alerts at this time.',
    };
  }, [current.data, daily.data, hourly.data]);

  const isLoading = current.isLoading;
  const isError = current.isError;
  const isForecastLoading = hourly.isLoading || daily.isLoading;
  const isForecastError = hourly.isError || daily.isError;

  return {
    data,
    isLoading,
    isError,
    isForecastLoading,
    isForecastError,
    error: current.error || hourly.error || daily.error,
    refetch: () => {
      current.refetch();
      hourly.refetch();
      daily.refetch();
    },
  };
}
