type DetailData = {
  title: string;
  temp?: number;
  icon?: string;
  humidity?: number;
  feelLike?: number;
  wind?: number;
  isMain?: boolean;
};

export default function WeatherDetailModel({
  open,
  data,
  onClose,
}: {
  open: boolean;
  data: DetailData | null;
  onClose: () => void;
}) {
  if (!open || !data) return null;

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
          {data.isMain
            ? '🌤 Current Weather Details'
            : data.title?.includes(':')
              ? '⏱ Hourly Forecast Detail'
              : '📅 Weekly Forecast Detail'}
        </h2>

        {/* Icon */}
        <div className="mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-5xl shadow-inner">
          {data.icon ?? '🌤'}
        </div>

        {/* Temp */}
        <p className="mb-2 text-center text-xl font-semibold">
          {data.temp !== undefined
            ? `${data.title}: ${data.temp}°C`
            : `${data.title}`}
        </p>

        {/* Description */}
        <p className="mb-4 text-center text-gray-600">
          Detailed weather condition for <b>{data.title}</b>
        </p>

        {/* Extra info */}
        <div className="mt-4 flex justify-around text-sm text-gray-700">
          <div className="text-center">
            <div>Highest temp</div>
            <div>Feels {data.feelLike}°</div>
          </div>
          <div className="text-center">
            <div>Lowest </div>
            <div>{data.wind} km/h</div>
          </div>
          <div className="text-center">
            <div>humidity</div>
            <div>{data.humidity}%</div>
          </div>
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
