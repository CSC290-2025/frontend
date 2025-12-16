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
        console.log('Removing from favorites:', district);
        await removeFavorite.mutateAsync(district);
      } else {
        console.log('Adding to favorites:', district);
        await addFavorite.mutateAsync(district);
      }
    } catch (error: any) {
      if (
        error?.response?.status === 409 ||
        error?.message?.includes('already added')
      ) {
        console.info('District already in favorites, ignoring error');
      } else {
        console.error('Error toggling favorite:', error);
      }
    }
  };

  const isButtonLoading =
    addFavorite.isLoading || removeFavorite.isLoading || isFavoriteLoading;

  return (
    <div
      onClick={handleSelectDistrict}
      className={
        'relative flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 bg-white p-4 text-black shadow-sm hover:border-gray-300 hover:shadow-md'
      }
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl leading-tight font-semibold text-gray-900">
            {district}
          </h2>

          <button
            onClick={handleToggleFavorite}
            disabled={isButtonLoading}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={
              isFavorite ? 'Remove from favorites' : 'Add to favorites'
            }
          >
            <FontAwesomeIcon
              icon={isFavorite ? faHeartSolid : faHeartRegular}
              className={`text-xl ${isFavorite ? 'text-red-500' : 'text-gray-400'}`}
            />
          </button>
        </div>

        <p className="text-sm text-gray-500">{time}</p>
      </div>

      <div className="flex flex-col items-end pl-2">
        <div className="mb-1 flex items-baseline">
          <p className="text-3xl leading-none font-bold text-gray-900">
            {displayAqi}
          </p>
          <span className="ml-1 text-lg font-medium text-gray-600">AQI</span>
        </div>
        <p className="text-sm text-gray-700">PM2.5: {displayPm25} µg/m³</p>
      </div>
    </div>
  );
}
