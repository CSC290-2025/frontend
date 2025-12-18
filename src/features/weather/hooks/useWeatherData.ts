import { useMemo } from 'react';
import { useWeatherCurrent } from './useWeatherCurrent';
import { useWeatherHourly } from './useWeatherHourly';
import { useWeatherDaily } from './useWeatherDaily';

const conditionIconMap: Record<string, { day: string; night: string }> = {
  Sunny: { day: '☀️', night: '🌕' }, // night = moonly
  'Partly Cloudy': { day: '⛅️', night: '🌕☁️' },
  Cloudy: { day: '☁️', night: '☁️' },
  Fog: { day: '🌫️', night: '🌫️' },
  Rain: { day: '🌧️', night: '🌧️' },
  Snow: { day: '❄️', night: '❄️' },
  Thunderstorm: { day: '⛈️', night: '⛈️' },
};

const determineIsNight = (time?: string | null) => {
  // try to parse provided time, fallback to local now
  const date = time ? new Date(time) : new Date();
  if (Number.isNaN(date.getTime())) {
    // fallback to local hour
    const h = new Date().getHours();
    return h >= 18 || h < 6;
  }
  const hour = date.getHours();
  return hour >= 18 || hour < 6;
};

const getConditionIcon = (condition?: string | null, isNight = false) => {
  if (!condition) return '🌡️';
  const entry = conditionIconMap[condition];
  if (!entry) return '🌡️';
  return isNight ? entry.night : entry.day;
};

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
  windDirection: string;
  pressure: number | null;
  condition: string;
  conditionIcon: string;
  forecastHourly: {
    time: string;
    temp: number;
    icon: string;
    condition: string;
    precipitationChance: number | null;
    humidity: number;
    feelLike: number;
    windSpeed: number;
  }[];
  forecastWeekly: {
    day: string;
    high: number;
    low: number;
    icon: string;
    condition: string;
    precipitationChance: number | null;
    date?: string;
    humidity: number;
    feelLike: number;
    windSpeed: number;
  }[];
  warning: string;
  warningDetail: string;
  distinctName?: string;
  location_name?: string;
  locationName?: string;
  city?: string;
  location_id?: number;
  locationId?: number;
};

export function useWeatherData(locationId?: number) {
  // prefer locationId from URL query (?locationId=...) if present (e.g. navigated from WeatherCity)
  const getLocationIdFromQuery = (): number | undefined => {
    if (typeof window === 'undefined') return undefined;
    const param = new URLSearchParams(window.location.search).get('locationId');
    if (!param) return undefined;
    const parsed = Number.parseInt(param, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  };

  // choose: query -> provided param -> fallback 1
  const effectiveLocationId = getLocationIdFromQuery() ?? locationId ?? 1;

  const current = useWeatherCurrent(effectiveLocationId);
  const hourly = useWeatherHourly(effectiveLocationId);
  const daily = useWeatherDaily(effectiveLocationId);

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
      icon: getConditionIcon(item.condition, determineIsNight(item.time)),
      condition: item.condition,
      precipitationChance: item.precipitation_chance ?? null,
      humidity: currentSnapshot.humidity,
      feelLike: Math.round(currentSnapshot.feels_like),
      windSpeed: Math.round(currentSnapshot.wind_speed),
    }));

    const forecastWeekly = dailyItems.slice(0, 7).map((item) => ({
      day: formatDay(item.date),
      high: Math.round(item.high),
      low: Math.round(item.low),
      icon: getConditionIcon(item.condition, false),
      condition: item.condition,
      precipitationChance: item.precipitation_chance ?? null,
      date: item.date,
      humidity: currentSnapshot.humidity,
      feelLike: Math.round(currentSnapshot.feels_like),
      windSpeed: Math.round(currentSnapshot.wind_speed),
    }));

    const condition = currentSnapshot.condition ?? 'Unknown';
    const currentIsNight = determineIsNight();

    // analyze precipitation chance from daily items (next 7 days)
    const precipVals = dailyItems
      .slice(0, 7)
      .map((it) => Number(it.precipitation_chance ?? 0));

    // find longest consecutive run of days with precip >= 45%
    let maxConsec = 0;
    let consec = 0;
    for (const v of precipVals) {
      if (v >= 45) {
        consec += 1;
        if (consec > maxConsec) maxConsec = consec;
      } else {
        consec = 0;
      }
    }

    // decide warning level and message
    let warningText = 'Low chance of rain';
    let warningDetail = 'Precipitation chances are low for the next 7 days.';

    if (maxConsec >= 3) {
      warningText = 'High chance of rain / Flood risk';
      warningDetail =
        'Precipitation chance is >=45% for 3 or more consecutive days. High risk of sustained rain and possible flooding — carry an umbrella and avoid flood-prone areas.';
    } else if (precipVals.some((v) => v > 20)) {
      // at least one moderate chance day
      const maxPct = Math.max(...precipVals);
      warningText = 'Moderate chance of rain';
      warningDetail = `Some days in the next 7 have moderate precipitation chance (up to ${maxPct}%). Expect intermittent showers; consider carrying rain protection.`;
    }

    return {
      temperature: Math.round(currentSnapshot.temperature),
      feelLike: Math.round(currentSnapshot.feels_like),
      humidity: currentSnapshot.humidity,
      windSpeed: Math.round(currentSnapshot.wind_speed),
      windDirection: currentSnapshot.wind_direction,
      pressure: currentSnapshot.pressure,
      condition,
      conditionIcon: getConditionIcon(condition, currentIsNight),
      forecastHourly,
      forecastWeekly,
      warning: warningText,
      warningDetail: warningDetail,
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
