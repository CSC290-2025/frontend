import TopNavigation from '../components/TopNavigation';
import CurrentWeatherCard from '../components/CurrentWeatherCard';
import HourlyForecast from '../components/HourlyForecast';
import WeeklyForecast from '../components/WeeklyForecast';
import WarningBox from '../components/WarningBox';

import WeatherDetailModel from '../components/WeatherDetailModel';
import WarningModel from '../components/WarningModel';

import { useWeatherData } from '../hooks/useWeatherData';
import { useWeatherModel } from '../hooks/useWeatherModel';

import DayRating from '../components/DayRating'; // add import
import { CITIES } from './weatherCity'; // import city list to resolve selected distinct name

// mapping from city id to Wikipedia link
const WIKI_LINKS: Record<number, string> = {
  1: 'https://en.wikipedia.org/wiki/Thung_Khru_district',
  2: 'https://en.wikipedia.org/wiki/Rat_Burana_district',
  3: 'https://en.wikipedia.org/wiki/Thon_Buri_district',
  4: 'https://en.wikipedia.org/wiki/Chom_Thong_district,_Bangkok',
};

//fetch ข้อมูลสภาพอากาศและแสดงผลในหน้าเว็บ // fetch data and display on web page
export default function WeatherMockData() {
  const { data, isLoading, isError, refetch, isForecastLoading } =
    useWeatherData();

  const detailModel = useWeatherModel();
  const warningModel = useWeatherModel();
  // resolve selected locationId from query param (set by weatherCity) and map to a distinct name
  const searchParams =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : null;
  const selectedParam = searchParams?.get('locationId');
  const selectedId = selectedParam ? parseInt(selectedParam, 10) : undefined;
  const selectedCity = selectedId
    ? CITIES.find((c) => c.id === selectedId)
    : undefined;
  const distinctLink = selectedCity ? WIKI_LINKS[selectedCity.id] : undefined;
  const distinctName =
    selectedCity?.name ??
    data?.distinctName ??
    data?.location_name ??
    data?.locationName ??
    data?.city ??
    ((data?.location_id ?? data?.locationId)
      ? `Location ${data.location_id ?? data.locationId}`
      : 'Unknown location');

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
      <TopNavigation />{' '}
      {/*function navigate ดู weather และ clean air detailing on-top*/}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-bold">Weather</h1>
          <div className="mt-1 text-sm text-gray-600">
            Showing:{' '}
            {distinctLink ? (
              <a
                href={distinctLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {distinctName}
              </a>
            ) : (
              distinctName
            )}
          </div>
        </div>
        {/*ฟังชั่น back ไปหาหน้าเลือก city*/}
        <div className="ml-4 flex items-center gap-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="text-m cursor-pointer rounded px-4 py-1 transition-opacity duration-150 select-none active:opacity-75"
          >
            ← back
          </button>
          {/* DayRating: pass a likely location id from data; adjust key if your data uses a different prop */}
          <DayRating
            locationId={
              data.location_id ?? (data.locationId as number | undefined) ?? 1
            }
          />
        </div>
      </div>
      {/* TOP ROW */}
      <div className="flex items-stretch gap-5">
        <div className="flex-1">
          <CurrentWeatherCard
            data={data}
            onClick={() =>
              detailModel.show({
                modelType: 'current',
                title: 'Current Weather',
                temp: data.temperature,
                icon: data.conditionIcon,
                condition: data.condition,
                humidity: data.humidity,
                feelLike: data.feelLike,
                wind: data.windSpeed,
                windDirection: data.windDirection,
                pressure: data.pressure,
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
                condition: item.condition,
                precipitationChance: item.precipitationChance ?? null,
                humidity: item.humidity,
                feelLike: item.feelLike,
                wind: item.windSpeed,
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
                high: item.high,
                low: item.low,
                icon: item.icon,
                condition: item.condition,
                precipitationChance: item.precipitationChance ?? null,
                humidity: item.humidity,
                feelLike: item.feelLike,
                wind: item.windSpeed,
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
