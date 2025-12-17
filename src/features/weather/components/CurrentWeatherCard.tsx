import type { WeatherUIData } from '../hooks/useWeatherData';

interface Props {
  readonly data: WeatherUIData;
  readonly onClick?: () => void;
}

export default function CurrentWeatherCard({ data, onClick }: Props) {
  const Wrapper = onClick ? 'button' : 'div';
  const containerClass = `mb-6 w-full rounded-2xl border bg-white p-6 text-left shadow-lg transition-all duration-200 ${
    onClick
      ? 'cursor-pointer hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] active:shadow-md'
      : ''
  }`;

  return (
    //component การ์ด แสดงสภาพอากาศปัจจุบัน
    <Wrapper
      {...(onClick ? { type: 'button' as const } : {})}
      className={containerClass}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-6xl font-bold">{data.temperature}°C</p>
          <p className="text-gray-600">{data.condition}</p>

          <p className="mt-2 text-sm text-gray-500">
            Feels like {data.feelLike}° • Humidity {data.humidity}% • Wind{' '}
            {data.windSpeed} km/h •
          </p>
        </div>

        <div className="text-8xl">{data.conditionIcon}</div>
      </div>
    </Wrapper>
  );
}
