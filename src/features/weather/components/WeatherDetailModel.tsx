type CurrentDetail = {
  modelType: 'current';
  title: string;
  temp: number;
  icon?: string;
  humidity?: number;
  feelLike?: number;
  wind?: number;
  windDirection?: string;
  pressure?: number | null;
  condition?: string;
};

type HourlyDetail = {
  modelType: 'hourly';
  title: string; // e.g. "14:00"
  temp: number;
  icon?: string;
  condition?: string;
  precipitationChance?: number | null;
};

type WeeklyDetail = {
  modelType: 'weekly';
  title: string; // e.g. "MON"
  high?: number;
  low?: number;
  icon?: string;
  condition?: string;
  precipitationChance?: number | null;
  humidity?: number;
  feelLike?: number;
  wind?: number;
};

type DetailData = CurrentDetail | HourlyDetail | WeeklyDetail | null;

export default function WeatherDetailModel({
  open,
  data,
  onClose,
}: {
  open: boolean;
  data: DetailData;
  onClose: () => void;
}) {
  if (!open || !data) return null;

  // common pieces
  const icon = data.icon ?? (data.modelType === 'current' ? '🌤' : '🌡️');
  const title =
    data.modelType === 'current'
      ? 'Current Weather Details'
      : data.modelType === 'hourly'
        ? `Hourly Forecast for ${data.title}`
        : `Weekly Forecast for ${data.title}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="relative w-[420px] rounded-2xl bg-gradient-to-b from-blue-50 to-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-xl text-gray-600"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="mb-4 text-center text-2xl font-bold text-blue-800">
          {data.modelType === 'current'
            ? '🌤 '
            : data.modelType === 'hourly'
              ? '⏱ '
              : '📅 '}
          {title}
        </h2>

        {/* Icon */}
        <div className="mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-5xl shadow-inner">
          {icon}
        </div>

        {/* Main info */}
        <p className="mb-2 text-center text-xl font-semibold">
          {data.modelType === 'current'
            ? `Temperature: ${data.temp}°C`
            : data.modelType === 'hourly'
              ? `${data.title}: ${data.temp}°C`
              : `${data.title}`}
        </p>

        {/* Sub description */}
        <p className="mb-4 text-center text-gray-600">
          {data.modelType === 'current'
            ? 'Live observation and details for current conditions.'
            : data.modelType === 'hourly'
              ? `Hourly forecast details for ${data.title}.`
              : `Weekly forecast details for ${data.title}.`}
        </p>

        {/* Extra info - แสดงตาม modelType */}
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-700">
          {/* Current Weather Details */}
          {data.modelType === 'current' && (
            <>
              {'condition' in data && data.condition && (
                <div className="text-center">
                  <div className="font-semibold">Condition</div>
                  <div>{data.condition}</div>
                </div>
              )}

              {'humidity' in data && data.humidity !== undefined && (
                <div className="text-center">
                  <div className="font-semibold">Humidity</div>
                  <div>{data.humidity}%</div>
                </div>
              )}

              {'feelLike' in data && data.feelLike !== undefined && (
                <div className="text-center">
                  <div className="font-semibold">Feels like</div>
                  <div>{data.feelLike}°</div>
                </div>
              )}

              {'wind' in data && data.wind !== undefined && (
                <div className="text-center">
                  <div className="font-semibold">Wind Speed</div>
                  <div>{data.wind} km/h</div>
                </div>
              )}

              {'windDirection' in data && data.windDirection && (
                <div className="text-center">
                  <div className="font-semibold">Wind Direction</div>
                  <div>{data.windDirection}</div>
                </div>
              )}

              {'pressure' in data &&
                data.pressure !== undefined &&
                data.pressure !== null && (
                  <div className="text-center">
                    <div className="font-semibold">Pressure</div>
                    <div>{data.pressure} hPa</div>
                  </div>
                )}
            </>
          )}

          {/* Hourly Forecast Details */}
          {data.modelType === 'hourly' && (
            <>
              {'condition' in data && data.condition && (
                <div className="text-center">
                  <div className="font-semibold">Condition</div>
                  <div>{data.condition}</div>
                </div>
              )}

              {'precipitationChance' in data &&
                data.precipitationChance !== undefined &&
                data.precipitationChance !== null && (
                  <div className="text-center">
                    <div className="font-semibold">Precipitation</div>
                    <div>{data.precipitationChance}%</div>
                  </div>
                )}
            </>
          )}

          {/* Weekly Forecast Details */}
          {data.modelType === 'weekly' && (
            <>
              {'high' in data && data.high !== undefined && (
                <div className="text-center">
                  <div className="font-semibold">High</div>
                  <div>{data.high}°C</div>
                </div>
              )}

              {'low' in data && data.low !== undefined && (
                <div className="text-center">
                  <div className="font-semibold">Low</div>
                  <div>{data.low}°C</div>
                </div>
              )}

              {'condition' in data && data.condition && (
                <div className="text-center">
                  <div className="font-semibold">Condition</div>
                  <div>{data.condition}</div>
                </div>
              )}

              {'precipitationChance' in data &&
                data.precipitationChance !== undefined &&
                data.precipitationChance !== null && (
                  <div className="text-center">
                    <div className="font-semibold">Precipitation</div>
                    <div>{data.precipitationChance}%</div>
                  </div>
                )}
            </>
          )}
        </div>

        <button
          className="mt-6 w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
