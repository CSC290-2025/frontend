import { LOCapi } from '@/features/G9-ApartmentListing/api/index';
import { useQuery } from '@tanstack/react-query';

export function calDistance(
  lon1: number,
  lon2: number,
  lat1: number,
  lat2: number
) {
  return useQuery({
    queryKey: ['distance', lon1, lon2, lat1, lat2],
    queryFn: () => LOCapi.getDistance(lat1, lon1, lat2, lon2),
    select: (response) => {
      return response.data.data;
    },
    enabled: !!lon1 && !!lon2 && !!lat1 && !!lat2,
  });
}

export function getnearbyAmenities(
  lat: number,
  lon: number,
  radius: number,
  limit: number,
  tag?: string
) {
  return useQuery({
    queryKey: ['nearbyAmenities', lat, lon, radius, limit, tag],
    queryFn: () => LOCapi.getNearbyAmenities(lat, lon, radius, limit, tag),
    select: (response) => {
      return response.data.data;
    },
    enabled: !!lat && !!lon && !!radius && !!limit,
  });
}
