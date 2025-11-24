import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { District } from '@/types/district';
import {
  getFavoriteDistricts,
  addFavoriteDistrict,
  removeFavoriteDistrict,
} from '../api/clean-air.api';

interface UseFavoriteDistrictsQueryOptions {
  enabled?: boolean;
}

export function useFavoriteDistrictsQuery(
  options: UseFavoriteDistrictsQueryOptions = {}
) {
  return useQuery<District[], Error>({
    queryKey: ['clean-air', 'favorites'],
    queryFn: () => getFavoriteDistricts(),
    staleTime: 1000 * 60 * 2,
    retry: 1,
    refetchOnMount: 'always',
    enabled: options.enabled,
  });
}

export function useAddFavoriteDistrictMutation() {
  const queryClient = useQueryClient();

  return useMutation<District, Error, string>({
    mutationFn: (district: string) => addFavoriteDistrict(district),
    onSuccess(data, district) {
      queryClient.invalidateQueries(['clean-air', 'favorites']);

      queryClient.setQueryData<District[]>(
        ['clean-air', 'favorites'],
        (oldData) => {
          if (!oldData) return [data];
          return [...oldData, data];
        }
      );
    },
  });
}

export function useRemoveFavoriteDistrictMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (district: string) => removeFavoriteDistrict(district),
    onSuccess(data, district) {
      queryClient.invalidateQueries(['clean-air', 'favorites']);

      queryClient.setQueryData<District[]>(
        ['clean-air', 'favorites'],
        (oldData) => {
          if (!oldData) return [];
          return oldData.filter(
            (fav) => fav.name?.toLowerCase() !== district.toLowerCase()
          );
        }
      );
    },
  });
}

export function useIsFavoriteDistrict(district?: string) {
  const { data: favorites, isLoading } = useFavoriteDistrictsQuery();

  const isFavorite =
    district && favorites
      ? favorites.some(
          (fav) => fav.district?.toLowerCase() === district.toLowerCase()
        )
      : false;

  return {
    isFavorite,
    isLoading,
  };
}
