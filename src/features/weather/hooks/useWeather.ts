import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  // Add other fields based on your backend response
}

export const useWeather = (city: string) => {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!city) return;

    apiClient.get(`/api/weather?city=${city}`);
    const fetchWeather = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/api/weather?city=${city}`);
        setData(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch weather data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    // Refresh every 5 minutes for real-time updates
    const interval = setInterval(fetchWeather, 300000);
    return () => clearInterval(interval);
  }, [city]);

  return { data, loading, error };
};
