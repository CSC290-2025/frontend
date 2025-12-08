import { useMemo } from 'react';
import DistrictItem from './DistrictItem';
import useDistrictsQuery from '@/features/clean-air/hooks/useDistricts';
import { useFavoriteDistrictsQuery } from '@/features/clean-air/hooks/useFavoriteDistricts';
import type { District } from '@/types/district';

type Props = {
  searchTerm?: string;
  isFavoriteList: boolean;
};

export default function DistrictList({
  searchTerm = '',
  isFavoriteList,
}: Props) {
  const {
    data: allDistricts = [],
    isLoading: isAllLoading,
    isError: isAllError,
    error: allError,
    refetch: refetchAll,
    isFetched: isAllFetched,
  } = useDistrictsQuery({ enabled: !isFavoriteList });

  const {
    data: favoriteDistricts = [],
    isLoading: isFavLoading,
    isError: isFavError,
    error: favError,
    refetch: refetchFav,
    isFetched: isFavFetched,
  } = useFavoriteDistrictsQuery({ enabled: isFavoriteList });

  const districts = isFavoriteList ? favoriteDistricts : allDistricts;
  const isLoading = isFavoriteList ? isFavLoading : isAllLoading;
  const isError = isFavoriteList ? isFavError : isAllError;
  const error = isFavoriteList ? favError : allError;
  const refetch = isFavoriteList ? refetchFav : refetchAll;
  const isFetched = isFavoriteList ? isFavFetched : isAllFetched;

  const filtered = useMemo(() => {
    if (!searchTerm) return districts;
    const q = searchTerm.toLowerCase();
    return districts.filter((d: District) =>
      (d.district ?? (d as any).name ?? '').toString().toLowerCase().includes(q)
    );
  }, [searchTerm, districts]);

  if (isLoading)
    return <div className="p-8 text-center">Loading districts...</div>;

  if (isError)
    return (
      <div className="p-8 text-center">
        Error: {(error as Error).message}
        <div className="mt-2">
          <button
            onClick={() => refetch()}
            className="rounded bg-blue-500 px-2 py-1 text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );

  if (isFetched && filtered.length === 0)
    return (
      <div className="py-10 text-center text-gray-700">
        {isFavoriteList
          ? 'You have no favorite districts yet. Select "All Districts" to add some!'
          : `Area/Zone not found${searchTerm ? ` for "${searchTerm}"` : '.'}`}
      </div>
    );

  return (
    <div className="space-y-4">
      {filtered.map((item: District) => (
        <DistrictItem
          key={(item.district ?? (item as any).name) as string}
          district={item.district ?? (item as any).name}
          aqi={item.aqi}
          category={item.category}
          pm25={item.pm25}
          measured_at={item.measured_at}
        />
      ))}
    </div>
  );
}
