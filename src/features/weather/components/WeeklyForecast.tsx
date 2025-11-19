interface Props {
  list: { day: string; temp: number; icon: string }[];
  onSelect?: (item: any) => void;
}

export default function WeeklyForecast({ list, onSelect }: Props) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-bold">Weekly Forecast</h2>

      <div className="grid grid-cols-7 gap-3">
        {list.map((d, i) => (
          <div
            key={i}
            onClick={() => onSelect?.(d)}
            className="cursor-pointer rounded-xl border p-3 text-center transition-all hover:bg-gray-100"
          >
            <div className="font-semibold">{d.day}</div>
            <div className="text-3xl">{d.icon}</div>
            <div className="font-medium">{d.temp}°C</div>
          </div>
        ))}
      </div>
    </div>
  );
}
