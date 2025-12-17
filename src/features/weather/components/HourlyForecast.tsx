interface HourlyItem {
  time: string;
  temp: number;
  icon: string;
  condition?: string;
  precipitationChance?: number | null;
}

interface Props {
  list: HourlyItem[];
  onSelect?: (item: any) => void;
}

export default function HourlyForecast({ list, onSelect }: Props) {
  return (
    <div className="mb-6 rounded-2xl border bg-white p-6 shadow-lg">
      <h2 className="mb-4 text-xl font-bold">Hourly Forecast</h2>

      <div className="flex justify-between">
        {list.map((h, i) => (
          <div
            key={i}
            onClick={() => onSelect?.(h)}
            className="cursor-pointer rounded-xl p-3 text-center transition-all duration-200 hover:scale-105 hover:bg-gray-100 hover:shadow-md active:scale-95 active:shadow-sm"
          >
            <div className="text-gray-500">{h.time}</div>
            <div className="text-3xl">{h.icon}</div>
            <div className="font-medium">{h.temp} °C</div>
            <div className="text-sm text-gray-500"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
