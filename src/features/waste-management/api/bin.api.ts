import { apiClient } from '@/lib/apiClient';
import type { Bin } from '@/features/waste-management/types';

function transformBin(backendBin: any): Bin {
  const typeMap: Record<string, 'Recyclable' | 'General Waste' | 'Hazardous'> =
    {
      RECYCLABLE: 'Recyclable',
      GENERAL: 'General Waste',
      HAZARDOUS: 'Hazardous',
    };

  const colorMap: Record<string, string> = {
    RECYCLABLE: 'text-green-600',
    GENERAL: 'text-blue-600',
    HAZARDOUS: 'text-yellow-600',
  };

  return {
    ...backendBin,
    name: backendBin.bin_name,
    type: typeMap[backendBin.bin_type] || 'General Waste',
    color: colorMap[backendBin.bin_type] || 'text-gray-600',
    lat: Number(backendBin.latitude),
    lng: Number(backendBin.longitude),
  };
}

export async function fetchBins(): Promise<Bin[]> {
  const response = await apiClient.get('/bins');
  const payload =
    response.data && response.data.data ? response.data.data : response.data;

  if (Array.isArray(payload)) {
    return payload.map(transformBin);
  }

  if (!payload || !payload.bins || !Array.isArray(payload.bins)) {
    console.error('Invalid response structure for /bins:', response.data);
    throw new Error('Failed to fetch bins: Invalid response structure');
  }

  return payload.bins.map(transformBin);
}

export async function fetchNearbyBins(
  lat: number,
  lng: number,
  type: string = 'All',
  search: string = ''
): Promise<Bin[]> {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lng: lng.toString(),
  });
  if (type !== 'All') params.append('type', type);
  if (search) params.append('search', search);

  const response = await apiClient.get(`/bins/nearby?${params}`);
  const payload =
    response.data && response.data.data ? response.data.data : response.data;

  if (Array.isArray(payload)) {
    return payload.map(transformBin);
  }

  if (!payload || !payload.bins || !Array.isArray(payload.bins)) {
    console.error(
      'Invalid response structure for /bins/nearby:',
      response.data
    );
    throw new Error('Failed to fetch nearby bins: Invalid response structure');
  }

  return payload.bins.map(transformBin);
}

export async function fetchBinById(id: number): Promise<Bin> {
  const response = await apiClient.get(`/bins/${id}`);
  const payload =
    response.data && response.data.data ? response.data.data : response.data;

  if (!payload || !payload.bin) {
    console.error('Invalid response structure for /bins/:id', response.data);
    throw new Error('Bin not found');
  }

  return transformBin(payload.bin);
}

export async function fetchNearestBin(lat: number, lng: number): Promise<Bin> {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lng: lng.toString(),
  });

  const response = await apiClient.get(`/bins/nearest?${params}`);
  const payload =
    response.data && response.data.data ? response.data.data : response.data;

  const bins = Array.isArray(payload) ? payload : payload?.bins;

  if (!bins || !Array.isArray(bins) || bins.length === 0) {
    console.error(
      'Invalid response structure for /bins/nearest:',
      response.data
    );
    throw new Error('Failed to fetch nearest bin');
  }

  return transformBin(bins[0]);
}
