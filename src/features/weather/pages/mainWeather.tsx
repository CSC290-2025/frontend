import { useWeatherData } from '../hooks/useWeatherData';
import CurrentWeatherCard from '../components/CurrentWeatherCard';
import HourlyForecast from '../components/HourlyForecast';
import WeeklyForecast from '../components/WeeklyForecast';

export default function WeatherMockPage() {
  const { data, isLoading, isError, refetch } = useWeatherData();

  if (isLoading) {
    return <div className="p-6">Loading weather data…</div>;
  }

  if (isError || !data) {
    return (
      <div className="p-6 text-red-600">
        Failed to load weather data.
        <button
          className="ml-2 cursor-pointer underline select-none"
          onClick={() => refetch()}
          type="button"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6 text-black select-none">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Weather Reports</h1>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="text-m ml-4 cursor-pointer rounded px-4 py-1 transition-opacity duration-150 select-none active:opacity-75"
        >
          ← back
        </button>
      </div>

      <CurrentWeatherCard data={data} />

      <HourlyForecast list={data.forecastHourly} />

      <WeeklyForecast list={data.forecastWeekly} />
    </div>
  );
}
