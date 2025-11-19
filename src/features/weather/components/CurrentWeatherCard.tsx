interface Props {
  data: any;
  onClick?: () => void;
}

export default function CurrentWeatherCard({ data, onClick }: Props) {
  return (
    <div
      className="mb-6 cursor-pointer rounded-2xl border bg-white p-6 shadow-sm"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-6xl font-bold">{data.temperature}°C</p>
          <p className="text-gray-600">{data.condition}</p>

          <p className="mt-2 text-sm text-gray-500">
            Feels like {data.feelLike}° • Humidity {data.humidity}% • Wind{' '}
            {data.windSpeed} km/h
          </p>
        </div>

        <div className="text-8xl">🌤</div>
      </div>
    </div>
  );
}
