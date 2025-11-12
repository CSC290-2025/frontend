import React from 'react';

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
  return (
    <div className="mx-auto max-w-5xl bg-white p-6 font-sans text-black">
      {/* Header */}
      <div className="mb-6 flex gap-4">
        <div className="rounded-xl border px-4 py-2 text-sm">
          🌦 Weather reports{' '}
          <div className="text-gray-500">Weather forecast</div>
        </div>
        <div className="rounded-xl border px-4 py-2 text-sm">
          💨 Clean Air <div className="text-gray-500">Air quality</div>
        </div>
      </div>

      <h1 className="mb-4 text-3xl font-bold">Weather</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search for your location"
        className="mb-6 w-full rounded-full border p-3 text-gray-600"
      />

      {/* Main Info */}
      <div className="flex gap-6">
        <div className="flex-1 rounded-2xl border p-6 shadow-sm">
          <div className="text-6xl font-bold">{data.temperature}°</div>
          <div className="text-gray-500">Humidity {data.humidity}%</div>
          <div className="text-gray-500">Min {data.minTemp}°C</div>
          <div className="mt-2 text-sm">
            🌡 Feel like {data.feelLike}° | 💨 {data.windSpeed} Km/h | 👁{' '}
            {data.visibility} Km
          </div>
        </div>

        {/* Hourly */}
        <div className="flex flex-[2] justify-between rounded-2xl border p-6 shadow-sm">
          {data.forecastHourly.map((f, i) => (
            <div key={i} className="text-center">
              <div className="text-gray-500">{f.time}</div>
              <div className="text-2xl">{f.icon}</div>
              <div>{f.temp}°</div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly */}
      <div className="mt-6 flex gap-4">
        {data.forecastWeekly.map((d, i) => (
          <div
            key={i}
            className="flex-1 rounded-2xl border py-4 text-center shadow-sm"
          >
            <div className="font-semibold">{d.day}</div>
            <div className="text-2xl">{d.icon}</div>
            <div>{d.temp}°</div>
          </div>
        ))}

        {/* Warning */}
        {data.warning && (
          <div className="flex-1 rounded-2xl border border-red-400 bg-red-50 px-3 py-4 text-red-700">
            <div className="flex items-center gap-2 font-bold">
              ⚠️ {data.warning}
            </div>
            <div className="mt-1 text-sm">{data.warningDetail}</div>
          </div>
        )}
      </div>
    </div>
  );
};

// Example usage
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
  forecastWeekly: [
    { day: 'MON', temp: 32, icon: '🌤' },
    { day: 'TUE', temp: 32, icon: '🌤' },
    { day: 'WED', temp: 29, icon: '🌧' },
    { day: 'THU', temp: 25, icon: '🌧' },
    { day: 'FRI', temp: 25, icon: '🌧' },
  ],
  warning: 'Storm Warning',
  warningDetail: 'possibility 80% and 70% to have flood',
};

export default function App() {
  return <WeatherDashboard data={sampleData} />;
}
