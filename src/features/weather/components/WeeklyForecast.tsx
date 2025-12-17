interface WeeklyItem {
  day: string;
  high?: number;
  low?: number;
  icon?: string;
  condition?: string;
  precipitationChance?: number | null;
}

interface Props {
  list: WeeklyItem[];
  onSelect?: (item: any) => void;
}

export default function WeeklyForecast({ list, onSelect }: Props) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-lg">
      <h2 className="mb-4 text-xl font-bold">Weekly Forecast</h2>

      <div className="grid grid-cols-7 gap-3">
        {list.map((d, i) => (
          <div
            key={i}
            onClick={() => onSelect?.(d)}
            className="cursor-pointer rounded-xl p-3 text-center transition-all duration-200 hover:scale-105 hover:bg-gray-100 hover:shadow-md active:scale-95 active:shadow-sm"
          >
            <div className="font-semibold">{d.day}</div>
            <div className="text-3xl">{d.icon}</div>
            <div className="font-medium">
              {d.high !== undefined ? `${d.high}°` : '—'}
              {d.low !== undefined ? ` / ${d.low}°` : ''}
            </div>
            <div className="text-sm text-gray-500"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
