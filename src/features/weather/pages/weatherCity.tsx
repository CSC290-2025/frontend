import React, { useState, useEffect } from 'react';

const CITIES = [
  { id: 1, name: 'ThungKhru' },
  { id: 2, name: 'Ratburana' },
  { id: 3, name: 'Thonburi' },
  { id: 4, name: 'ChomThong' },
];

export default function WeatherCityPage() {
  const [selected, setSelected] = useState<number | null>(null);

  // real-time clock (updates every second)
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const timeLabel = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const onSelect = (id: number) => {
    setSelected(id);
    window.location.href = `/weather?locationId=${id}`;
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Weather</h1>

      {/* placeholder for future search bar */}

      <div className="space-y-6">
        {CITIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c.id)}
            className="w-full rounded-2xl border bg-white p-6 text-left shadow-md transition-transform hover:-translate-y-0.5 focus:outline-none active:scale-[0.995]"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-medium">{c.name}</div>
                {/* use real-time label */}
                <div className="mt-2 text-sm text-gray-500">{timeLabel}</div>
              </div>
              <div className="ml-4 text-2xl text-gray-400">›</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
