import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ADDapi } from '@/features/G9-ApartmentListing/api/index';
import type { addressTypes } from '@/features/G9-ApartmentListing/types/index';

export const fetchAddressById = (id: number) => {
  return useQuery({
    queryKey: ['address', id],
    queryFn: () => ADDapi.fetchAddressById(id),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const createAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: addressTypes.createAddress) =>
      ADDapi.createAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['address'] });
    },
  });
};
export const updateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: addressTypes.updateAddress;
    }) => ADDapi.updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['address'] });
    },
  });
};
