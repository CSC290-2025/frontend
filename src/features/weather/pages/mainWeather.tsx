import { useWeatherData } from '../hooks/useWeatherData';
import CurrentWeatherCard from '../components/CurrentWeatherCard';
import HourlyForecast from '../components/HourlyForecast';
import WeeklyForecast from '../components/WeeklyForecast';

export default function WeatherMockPage() {
  const { data } = useWeatherData();

  if (!data) return <div>Loading...</div>;

  return (
    <div className="mx-auto max-w-5xl p-6 text-black">
      <h1 className="mb-6 text-3xl font-bold">Mock Weather</h1>

      <CurrentWeatherCard data={data} />

      <HourlyForecast list={data.forecastHourly} />

      <WeeklyForecast list={data.forecastWeekly} />
    </div>
  );
}
