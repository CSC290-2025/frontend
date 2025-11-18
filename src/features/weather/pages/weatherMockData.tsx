import React, { useState } from 'react';
import { useNavigate } from '@/router';

type WeatherData = {
  temperature: number;
  humidity: number;
  minTemp: number;
  feelLike: number;
  windSpeed: number;
  visibility: number;
  forecastHourly: { time: string; temp: number; icon: string }[];
  forecastWeekly: { day: string; temp: number; icon: string }[];
  warning?: string;
  warningDetail?: string;
};

const WeatherDashboard: React.FC<{ data: WeatherData }> = ({ data }) => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<{
    title: string;
    icon?: string;
    temp?: number;
    type: 'main' | 'hourly' | 'weekly';
  } | null>(null);
  const [warningSelected, setWarningSelected] = useState(false);

  const closeModal = () => setSelected(null);

  return (
    <div className="relative mx-auto max-w-5xl bg-white p-6 font-sans text-black select-none">
      {/* Header */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => navigate('/weatherMain')}
          className="cursor-pointer rounded-xl border px-4 py-2 text-sm transition-all hover:border-blue-400 hover:bg-blue-50"
        >
          Weather reports <div className="text-gray-500"></div>
        </button>
        <button
          onClick={() => navigate('/air-quality')}
          className="cursor-pointer rounded-xl border px-4 py-2 text-sm transition-all hover:border-blue-400 hover:bg-blue-50"
        >
          Clean Air <div className="text-gray-500"></div>
        </button>
      </div>

      <h1 className="mb-4 text-3xl font-bold">Weather</h1>

      {/* Main Info (clickable) */}
      <div className="flex gap-6">
        <div
          className="flex-1 transform cursor-pointer rounded-2xl border p-6 shadow-sm transition-all hover:bg-gray-100 hover:shadow-md active:scale-95"
          onClick={() =>
            setSelected({
              title: 'Current Weather',
              type: 'main',
            })
          }
        >
          <div className="text-6xl font-bold">{data.temperature}°</div>
          <div className="text-gray-500">Humidity {data.humidity}%</div>
          <div className="text-gray-500">Min {data.minTemp}°C</div>
          <div className="mt-2 text-sm">
            Feel like {data.feelLike}° | {data.windSpeed} Km/h |{' '}
            {data.visibility} Km
          </div>
        </div>

        {/* Hourly Forecast (clickable) */}
        <div className="flex flex-[2] justify-between rounded-2xl border p-6 shadow-sm">
          {data.forecastHourly.map((f, i) => (
            <div
              key={i}
              className="transform cursor-pointer rounded-xl p-2 text-center transition-all hover:bg-gray-100 hover:shadow active:scale-95"
              onClick={() =>
                setSelected({
                  title: f.time,
                  icon: f.icon,
                  temp: f.temp,
                  type: 'hourly',
                })
              }
            >
              <div className="text-gray-500">{f.time}</div>
              <div className="text-2xl">{f.icon}</div>
              <div>{f.temp}°</div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Forecast */}
      <div className="mt-6 flex gap-4">
        <div className="flex flex-[3] gap-4 rounded-2xl border p-6 shadow-sm">
          {data.forecastWeekly.map((d, i) => (
            <div
              key={i}
              className="flex-1 transform cursor-pointer rounded-xl p-2 text-center transition-all hover:bg-gray-100 hover:shadow active:scale-95"
              onClick={() =>
                setSelected({
                  title: d.day,
                  icon: d.icon,
                  temp: d.temp,
                  type: 'weekly',
                })
              }
            >
              <div className="font-semibold">{d.day}</div>
              <div className="text-2xl">{d.icon}</div>
              <div>{d.temp}°</div>
            </div>
          ))}
        </div>
        {/* Disaster Warning Box (smaller) */}
        {data.warning && (
          <div
            className="max-w-xs flex-1 animate-pulse cursor-pointer rounded-2xl border border-red-400 bg-red-50 px-2 py-3 text-center text-red-700 shadow-sm transition-all hover:shadow-md"
            onClick={() => setWarningSelected(true)}
          >
            <div className="flex flex-col items-center gap-2 text-lg font-bold">
              {/* text-lg for bigger, font-bold for bold */}
              ⚠️ {data.warning}
            </div>
            <div className="mt-1 text-base font-bold">{data.warningDetail}</div>
          </div>
        )}
      </div>

      {/* Warning Popup */}
      {warningSelected && (
        <div
          className="animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setWarningSelected(false)}
        >
          <div
            className="animate-popup relative w-[420px] rounded-2xl bg-gradient-to-b from-red-50 to-white p-6 text-center shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button (Top Right) */}
            <button
              className="absolute top-4 right-4 text-xl text-gray-500 hover:text-gray-700"
              onClick={() => setWarningSelected(false)}
            >
              ✕
            </button>

            <h2 className="mb-3 text-2xl font-bold text-red-700">
              ⚠️ {data.warning}
            </h2>

            {/* Warning Icon */}
            <div className="relative mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-red-100 shadow-inner">
              <div className="animate-bounce-slow text-6xl">⚠️</div>
            </div>

            {/* Warning Detail */}
            <div className="mb-4 space-y-3 text-gray-700">
              <p className="text-lg font-semibold">{data.warningDetail}</p>
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm">
                  Please take necessary precautions and stay alert. Follow local
                  authorities instructions.
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="my-4 h-[1px] bg-gradient-to-r from-transparent via-red-300 to-transparent" />

            {/* Close Button */}
            <button
              className="mt-5 w-full transform rounded-lg bg-red-500 px-4 py-2 text-white transition-all hover:bg-red-600 active:scale-95"
              onClick={() => setWarningSelected(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Popup box with Animation of Current Weather (รายละเอียดบอกข้อมูลทุก5นาทีอันซ้ายมือ) */}
      {selected && (
        <div
          className="animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={closeModal}
        >
          <div
            className="animate-popup relative w-[420px] rounded-2xl bg-gradient-to-b from-blue-50 to-white p-6 text-center shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button (Top Right) */}
            <button
              className="absolute top-4 right-4 text-xl text-gray-500 hover:text-gray-700"
              onClick={closeModal}
            >
              ✕
            </button>

            <h2 className="mb-3 text-2xl font-bold text-blue-700">
              {selected.type === 'main'
                ? '🌦 Current Weather Details'
                : selected.type === 'hourly'
                  ? ' Hourly Forecast Detail'
                  : ' Weekly Forecast Detail'}
            </h2>

            {/* Weather Icon */}
            <div className="relative mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 shadow-inner">
              <div className="animate-bounce-slow text-6xl">
                {selected.icon ?? '🌤'}
              </div>
            </div>

            {/* Temperature */}
            {selected.temp !== undefined ? (
              <p className="mb-2 text-lg font-semibold text-gray-800">
                {selected.title}: {selected.temp}°C
              </p>
            ) : (
              <p className="mb-2 text-3xl font-bold text-gray-800">
                {data.temperature}°C
              </p>
            )}

            {/* Main Detail */}
            {selected.type === 'main' ? (
              <div className="space-y-1 text-gray-700">
                <p> Temperature: {data.temperature}°C</p>
                <p> Humidity: {data.humidity}%</p>
                <p> Feels Like: {data.feelLike}°C</p>
                <p> Wind Speed: {data.windSpeed} Km/h</p>
                <p> Visibility: {data.visibility} Km</p>
                <p> Min Temperature: {data.minTemp}°C</p>
                <p className="pt-2 text-sm text-blue-500">
                  *Updated every 5 minutes*
                </p>
              </div>
            ) : (
              <div className="text-gray-600">
                <p>
                  Detailed weather condition for <b>{selected.title}</b>
                </p>
                <p className="mt-1 text-sm text-blue-500">
                  (Including temperature trend, cloud, humidity, and wind
                  forecast)
                </p>
              </div>
            )}

            {/* Divider */}
            <div className="my-4 h-[1px] bg-gradient-to-r from-transparent via-blue-300 to-transparent" />

            {/* Bottom Summary Icon Row */}
            <div className="flex justify-around text-sm text-gray-600">
              <div className="flex flex-col items-center">
                <span>temp</span>
                <span>Feels {data.feelLike}°</span>
              </div>
              <div className="flex flex-col items-center">
                <span>wind</span>
                <span>{data.windSpeed} km/h</span>
              </div>
              <div className="flex flex-col items-center">
                <span>humidity</span>
                <span>{data.humidity}%</span>
              </div>
            </div>

            {/* Close Button */}
            <button
              className="mt-5 w-full transform rounded-lg bg-blue-500 px-4 py-2 text-white transition-all hover:bg-blue-600 active:scale-95"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

//all dummy information ( not pull api yet )
const sampleData: WeatherData = {
  temperature: 34,
  humidity: 74,
  minTemp: 28,
  feelLike: 35,
  windSpeed: 19,
  visibility: 10,
  forecastHourly: [
    { time: 'Now', temp: 32, icon: '🌤' },
    { time: '16:00', temp: 32, icon: '🌤' },
    { time: '17:00', temp: 29, icon: '🌥' },
    { time: '18:00', temp: 25, icon: '🌧' },
    { time: '19:00', temp: 25, icon: '🌧' },
  ],
  // expanded to 7-day weekly forecast
  forecastWeekly: [
    { day: 'MON', temp: 32, icon: '🌤' },
    { day: 'TUE', temp: 32, icon: '🌤' },
    { day: 'WED', temp: 29, icon: '🌧' },
    { day: 'THU', temp: 25, icon: '🌧' },
    { day: 'FRI', temp: 25, icon: '🌧' },
  ],
  warning: 'Storm Warning',
  warningDetail: 'Possibility 80% and 70% to have flood',
};

export default function App() {
  return <WeatherDashboard data={sampleData} />;
}
