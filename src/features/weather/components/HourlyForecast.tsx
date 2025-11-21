interface Props {
  list: { time: string; temp: number; icon: string }[];
  onSelect?: (item: any) => void;
}

export default function HourlyForecast({ list, onSelect }: Props) {
  return (
    <div className="mb-6 rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-bold">Hourly Forecast</h2>

      <div className="flex justify-between">
        {list.map((h, i) => (
          <div
            key={i}
            onClick={() => onSelect?.(h)}
            className="cursor-pointer rounded-xl p-3 text-center transition-all hover:bg-gray-100"
          >
            <div className="text-gray-500">{h.time}</div>
            <div className="text-3xl">{h.icon}</div>
            <div className="font-medium">{h.temp} °C</div>
          </div>
        ))}
      </div>
    </div>
  );
}
