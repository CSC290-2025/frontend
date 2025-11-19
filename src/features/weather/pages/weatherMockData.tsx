import TopNavigation from '../components/TopNavigation';
import CurrentWeatherCard from '../components/CurrentWeatherCard';
import HourlyForecast from '../components/HourlyForecast';
import WeeklyForecast from '../components/WeeklyForecast';
import WarningBox from '../components/WarningBox';

import WeatherDetailModel from '../components/WeatherDetailModel';
import WarningModel from '../components/WarningModel';

import { useWeatherData } from '../hooks/useWeatherData';
import { useWeatherModel } from '../hooks/useWeatherModel';

export default function WeatherMockData() {
  const { data, isLoading, isError, refetch, isForecastLoading } =
    useWeatherData();

  const detailModel = useWeatherModel();
  const warningModel = useWeatherModel();

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
    <div className="mx-auto max-w-5xl p-6 text-black select-none">
      <TopNavigation />

      <h1 className="mb-6 text-3xl font-bold">Weather</h1>

      {/* TOP ROW */}
      <div className="flex items-stretch gap-6">
        <div className="flex-1">
          <CurrentWeatherCard
            data={data}
            onClick={() =>
              detailModel.show({
                modelType: 'main',
                title: 'Current Weather',
                temp: data.temperature,
                icon: '🌤',
                humidity: data.humidity,
                feelLike: data.feelLike,
                wind: data.windSpeed,
              })
            }
          />
        </div>

        <div className="grow basis-2/3">
          {isForecastLoading && (
            <p className="mb-2 text-sm text-gray-500">Updating forecast…</p>
          )}
          <HourlyForecast
            list={data.forecastHourly}
            onSelect={(item) =>
              detailModel.show({
                modelType: 'hourly',
                title: item.time,
                temp: item.temp,
                icon: item.icon,
                humidity: data.humidity,
                feelLike: data.feelLike,
                wind: data.windSpeed,
              })
            }
          />
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className="mt-6 flex items-stretch gap-6">
        <div className="grow basis-3/4">
          {isForecastLoading && (
            <p className="mb-2 text-sm text-gray-500">Updating forecast…</p>
          )}
          <WeeklyForecast
            list={data.forecastWeekly}
            onSelect={(item) =>
              detailModel.show({
                modelType: 'weekly',
                title: item.day,
                temp: item.temp,
                icon: item.icon,
                humidity: data.humidity,
                feelLike: data.feelLike,
                wind: data.windSpeed,
              })
            }
          />
        </div>

        <div className="flex-1">
          <WarningBox
            warning={data.warning}
            detail={data.warningDetail}
            onClick={() =>
              warningModel.show({
                text: data.warningDetail,
                warning: data.warning,
              })
            }
          />
        </div>
      </div>

      {/* MODELS */}
      <WeatherDetailModel
        open={detailModel.open}
        data={detailModel.payload}
        onClose={detailModel.hide}
      />

      <WarningModel
        open={warningModel.open}
        text={warningModel.payload?.text}
        warning={data.warning}
        onClose={warningModel.hide}
      />
    </div>
  );
}
