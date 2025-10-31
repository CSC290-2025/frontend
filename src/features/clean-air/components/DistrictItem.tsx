import { districts } from '../mocks/data/districts';

export default function DistrictItem() {
  return (
    <div className="mx-auto max-w-md space-y-4 px-4 py-6">
      {districts.map((d) => (
        <div
          key={d.district}
          className="flex items-center justify-between border bg-gray-100 p-4"
        >
          <div className="flex flex-col gap-1">
            <div className="text-xl font-semibold">
              <a href="/dashboard">{d.district}</a>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <div className="flex items-baseline">
              <div className="text-3xl font-bold">{d.aqi}</div>
              <div className="text-xs text-black">AQI</div>
            </div>
            <div className="text-xs text-black">PM2.5: {d.pm25} µg/m³</div>
            <div className="text-xs text-black">{d.category}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
