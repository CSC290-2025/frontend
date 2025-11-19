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
        <button className="ml-2 underline" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6 text-black">
      <h1 className="mb-6 text-3xl font-bold">Weather Report</h1>

      <CurrentWeatherCard data={data} />

      <HourlyForecast list={data.forecastHourly} />

      <WeeklyForecast list={data.forecastWeekly} />
    </div>
  );
}
