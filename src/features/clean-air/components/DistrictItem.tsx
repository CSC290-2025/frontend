import { useNavigate } from '@/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import type { District as DistrictType } from '@/types/district';
import {
  useIsFavoriteDistrict,
  useAddFavoriteDistrictMutation,
  useRemoveFavoriteDistrictMutation,
} from '../hooks/useFavoriteDistricts';

type Props = Partial<
  Pick<DistrictType, 'district' | 'aqi' | 'pm25' | 'category' | 'measured_at'>
>;

interface StatusDetails {
  status: string;
  style: string;
}

interface StatusBorder {
  borderColor: string;
}

const getStatusAndStyle = (category: string): StatusDetails => {
  switch (category.toUpperCase()) {
    case 'GOOD':
    case 'HEALTHY':
      return {
        status: 'GOOD',
        style: 'bg-teal-500 text-black',
      };
    case 'MODERATE':
      return {
        status: 'MODERATE',
        style: 'bg-lime-500 text-black',
      };
    case 'UNHEALTHY_FOR_SENSITIVE':
      return {
        status: 'UNHEALTHY FOR SENSITIVE',
        style: 'bg-yellow-500 text-black',
      };
    case 'UNHEALTHY':
    case 'BAD':
      return {
        status: 'UNHEALTHY',
        style: 'bg-orange-500 text-black',
      };
    case 'VERY_UNHEALTHY':
    case 'DANGEROUS':
    case 'HAZARDOUS':
      return {
        status: 'VERY UNHEALTHY',
        style: 'bg-red-500 text-black',
      };
    default:
      console.log(
        'CurrentAqiCard category not matched, showing Unknown:',
        category
      ); // Debug
      return {
        status: 'Unknown',
        style: 'bg-gray-400 text-black',
      };
  }
};

const getColorBorderStyle = (category: string): StatusBorder => {
  switch (category.toUpperCase()) {
    case 'GOOD':
      return {
        borderColor: 'border-l-4 border-teal-600 hover:border-teal-400',
      };
    case 'MODERATE':
      return {
        borderColor: 'border-l-4 border-lime-500 hover:border-lime-400',
      };
    case 'UNHEALTHY_FOR_SENSITIVE':
      return {
        borderColor: 'border-l-4 border-yellow-500 hover:border-yellow-400',
      };
    case 'UNHEALTHY':
      return {
        borderColor: 'border-l-4 border-orange-500 hover:border-orange-400',
      };
    case 'VERY_UNHEALTHY':
      return {
        borderColor: 'border-l-4 border-red-600 hover:border-red-400',
      };
    default:
      return {
        borderColor: 'border-l-4 border-gray-600 hover:border-gray-400',
      };
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
  const { isFavorite, isLoading: isFavoriteLoading } =
    useIsFavoriteDistrict(district);
  const addFavorite = useAddFavoriteDistrictMutation();
  const removeFavorite = useRemoveFavoriteDistrictMutation();

  const displayAqi = aqi ?? '—';
  const displayPm25 = pm25 ? pm25.toFixed(1) : '—';

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
      navigate('/clean-air/district-detail/:district', {
        params: { district: district },
      });
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!district) return;

    try {
      if (isFavorite) {
        await removeFavorite.mutateAsync(district);
      } else {
        await addFavorite.mutateAsync(district);
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
    }
  };

  const isButtonLoading =
    addFavorite.isLoading || removeFavorite.isLoading || isFavoriteLoading;

  return (
    <div
      onClick={handleSelectDistrict}
      className={`relative flex cursor-pointer items-center justify-between rounded-xl bg-white p-4 text-black shadow-sm hover:border-gray-300 hover:shadow-md ${getColorBorderStyle(category).borderColor}`}
    >
      <div className="flex flex-col gap-0">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl leading-[1.1] font-medium text-gray-900">
            {district}
          </h2>

          <button
            onClick={handleToggleFavorite}
            disabled={isButtonLoading}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500 disabled:cursor-not-allowed"
          >
            <FontAwesomeIcon
              icon={isFavorite ? faHeartSolid : faHeartRegular}
              className={`text-xl ${isFavorite ? 'text-red-500' : 'text-gray-400'}`}
            />
          </button>
        </div>

        <p className="mt-0.5 text-sm leading-none text-gray-500">{time}</p>
      </div>

      <div className="flex flex-col items-end pl-2">
        <div className="mb-0 flex items-baseline">
          <p className="text-4xl leading-none font-medium text-gray-900">
            {displayAqi}
          </p>
          <span className="ml-1 text-lg font-medium text-gray-600">AQI</span>
        </div>
        <p className="text-sm leading-tight text-gray-700">
          PM2.5: {displayPm25} µg/m³
        </p>
        {category && (
          <div
            className={`mt-1 rounded px-2 py-0.5 text-sm font-semibold ${getStatusAndStyle(category).style}`}
          >
            {getStatusAndStyle(category).status}
          </div>
        )}
      </div>
    </div>
  );
}
