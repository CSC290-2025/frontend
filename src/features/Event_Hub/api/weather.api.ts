import { apiClient } from '@/lib/apiClient';

// Minimal interface for the data structure expected from the response's 'days' array
interface RainForecastItem {
  date: string;
  precipitation_probability_max: number | null;
}

export const fetchDailyRainForecast = async (
  locationId: number,
  startDate: string,
  daysAhead: number
): Promise<RainForecastItem[]> => {
  try {
    // The apiClient.get will make the actual HTTP request
    const response = await apiClient.get('/weather/external/rain/daily', {
      params: {
        location_id: locationId,
        date: startDate,
        days_ahead: daysAhead,
      },
    });

    // Assume the response structure is { data: { days: [...] } }
    const rainData = response.data;

    if (rainData && Array.isArray(rainData.days)) {
      // Map the full API response item to the minimal interface
      return rainData.days.map((item: any) => ({
        date: item.date,

        precipitation_probability_max:
          item.precipitation_probability_max !== undefined
            ? item.precipitation_probability_max
            : null,
      }));
    }

    return [];
  } catch (error) {
    console.error('API Error: Failed to fetch daily rain forecast:', error);

    return [];
  }
};
