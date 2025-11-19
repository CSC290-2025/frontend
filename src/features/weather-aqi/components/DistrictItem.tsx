import { useNavigate } from '@/router';
import type { District as DistrictType } from '@/types/district';

type Props = Partial<
  Pick<DistrictType, 'district' | 'aqi' | 'pm25' | 'category' | 'measured_at'>
>;

const getCategoryColors = (category: string) => {
  switch (category.toUpperCase()) {
    case 'UNHEALTHY':
    case 'BAD':
      return { categoryBg: 'bg-red-600', categoryText: 'text-white' };
    case 'MODERATE':
      return { categoryBg: 'bg-yellow-500', categoryText: 'text-black' };
    case 'GOOD':
      return { categoryBg: 'bg-green-500', categoryText: 'text-white' };
    default:
      return { categoryBg: 'bg-gray-400', categoryText: 'text-black' };
  }
};

export default function DistrictItem({
  district,
  aqi,
  pm25,
  category,
  measured_at,
}: Props) {
  const navigate = useNavigate();
  const categorySafe = (category ?? 'Unknown').toString();
  const categoryUpper = categorySafe.toUpperCase();
  const { categoryBg, categoryText } = getCategoryColors(categoryUpper);

  const displayAqi = aqi ?? '—';
  const displayPm25 = pm25 ?? '—';

  const getFormattedTime = (iso?: string) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    try {
      return new Intl.DateTimeFormat(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Bangkok',
      }).format(d);
    } catch {
      return d.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    }
  };
  const time = getFormattedTime(measured_at);

  const handleSelectDistrict = () => {
    if (district) {
      navigate('/weather-aqi/overview/:district', {
        params: { district: district },
      });
    }
  };

  return (
    <div
      onClick={handleSelectDistrict}
      className={
        'flex cursor-pointer items-center justify-between rounded-2xl border border-black bg-white p-4 text-black shadow-lg transition-colors hover:bg-gray-100'
      }
    >
      <div className="flex flex-col gap-1">
        <div className="text-2xl font-bold">{district}</div>
        <div className="text-sm text-gray-700">{time}</div>
      </div>
      <div className="flex flex-col items-end">
        <div className="flex items-baseline">
          <div className="text-3xl font-bold">{displayAqi}</div>
          <div className="ml-1 text-base text-gray-700">AQI</div>
        </div>
        <div className="text-sm text-gray-700">PM2.5: {displayPm25} µg/m³</div>
        <div
          className={`text-sm font-semibold ${categoryText} ${categoryBg} mt-1 rounded px-2 py-0.5`}
        >
          {categoryUpper}
        </div>
      </div>
    </div>
  );
}
