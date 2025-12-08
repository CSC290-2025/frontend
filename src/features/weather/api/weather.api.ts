import { apiClient } from '@/lib/apiClient';

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    name: string;
    message: string;
    statusCode: number;
  };
  timestamp: string;
};

const unwrapResponse = <T>(payload: ApiResponse<T>) => {
  if (!payload.success) {
    throw new Error(payload.error?.message ?? 'Unknown API error');
  }
  return payload.data;
};

export type WeatherLocation = {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
};

export type WeatherCurrent = {
  temperature: number;
  feels_like: number;
  condition: string;
  humidity: number;
  wind_speed: number;
  wind_direction: string;
  pressure: number | null;
  last_updated: string;
};

export type WeatherHourlyItem = {
  time: string;
  temperature: number;
  condition: string;
  precipitation_chance: number | null;
};

export type WeatherDailyItem = {
  date: string;
  high: number;
  low: number;
  condition: string;
  precipitation_chance: number | null;
};

export type WeatherCurrentResponse = {
  location: WeatherLocation;
  current: WeatherCurrent;
};

export type WeatherHourlyResponse = {
  location: WeatherLocation;
  hourly_forecast: WeatherHourlyItem[];
};

export type WeatherDailyResponse = {
  location: WeatherLocation;
  daily_forecast: WeatherDailyItem[];
};

export type WeatherRatingRecord = {
  id: number;
  location_id: number | null;
  date: string;
  rating: number;
  district: string | null;
};

export type CreateWeatherRatingPayload = {
  location_id: number;
  rating: number;
};

const basePath = '/weather/external';

const buildParams = (locationId: number) => ({
  params: { location_id: locationId },
});

export const fetchWeatherCurrent = async (locationId: number) => {
  const response = await apiClient.get<ApiResponse<WeatherCurrentResponse>>(
    `${basePath}/current`,
    buildParams(locationId)
  );
  return unwrapResponse(response.data);
};

export const fetchWeatherHourly = async (locationId: number) => {
  const response = await apiClient.get<ApiResponse<WeatherHourlyResponse>>(
    `${basePath}/hourly`,
    buildParams(locationId)
  );
  return unwrapResponse(response.data);
};

export const fetchWeatherDaily = async (locationId: number) => {
  const response = await apiClient.get<ApiResponse<WeatherDailyResponse>>(
    `${basePath}/daily`,
    buildParams(locationId)
  );
  return unwrapResponse(response.data);
};

export const createWeatherRating = async (
  payload: CreateWeatherRatingPayload
) => {
  const response = await apiClient.post<
    ApiResponse<{ data: WeatherRatingRecord }>
  >('/weather/ratings', payload);
  const wrapped = unwrapResponse(response.data);
  return wrapped.data;
};
