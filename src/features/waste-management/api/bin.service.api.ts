import { apiClient } from '@/lib/apiClient';
import type {
  Bin,
  BackendBin,
  BinType,
  CreateBinData,
} from '@/features/waste-management/types';

function transformBin(backendBin: any): Bin {
  const typeMap: Record<string, 'Recyclable' | 'General Waste' | 'Hazardous'> =
    {
      RECYCLABLE: 'Recyclable',
      GENERAL: 'General Waste',
      HAZARDOUS: 'Hazardous',
      ORGANIC: 'General Waste',
    };

  const colorMap: Record<string, string> = {
    RECYCLABLE: 'text-green-600',
    GENERAL: 'text-blue-600',
    HAZARDOUS: 'text-yellow-600',
    ORGANIC: 'text-green-600',
  };

  return {
    id: backendBin.id,
    bin_name: backendBin.bin_name,
    bin_type: typeMap[backendBin.bin_type] || 'GENERAL',
    latitude: Number(backendBin.latitude),
    longitude: Number(backendBin.longitude),
    capacity_kg:
      backendBin.capacity_kg !== undefined && backendBin.capacity_kg !== null
        ? typeof backendBin.capacity_kg === 'string'
          ? Number(backendBin.capacity_kg)
          : backendBin.capacity_kg
        : backendBin.capacity !== undefined && backendBin.capacity !== null
          ? typeof backendBin.capacity === 'string'
            ? Number(backendBin.capacity)
            : backendBin.capacity
          : null,
    total_collected_weight:
      typeof backendBin.total_collected_weight === 'string'
        ? Number(backendBin.total_collected_weight)
        : backendBin.total_collected_weight,
    color: colorMap[backendBin.bin_type] || 'text-gray-600',
    distance: backendBin.distance,
    numericDistance: backendBin.numericDistance,
  };
}

export class BinApiService {
  static async getAllBins(filters?: {
    bin_type?: BinType;
  }): Promise<BackendBin[]> {
    const params = new URLSearchParams();
    if (filters?.bin_type) params.append('bin_type', filters.bin_type);

    const response = await apiClient.get(`/bins?${params}`);
    const payload =
      response.data && response.data.data ? response.data.data : response.data;

    const bins = Array.isArray(payload) ? payload : payload?.bins;

    if (!bins || !Array.isArray(bins)) {
      console.error('Invalid response structure in getAllBins:', response.data);
      throw new Error('Failed to fetch bins: Invalid response structure');
    }

    return bins.map((bin: any) => ({
      ...bin,
      latitude:
        typeof bin.latitude === 'string' ? Number(bin.latitude) : bin.latitude,
      longitude:
        typeof bin.longitude === 'string'
          ? Number(bin.longitude)
          : bin.longitude,
      capacity_kg:
        bin.capacity_kg !== undefined && bin.capacity_kg !== null
          ? typeof bin.capacity_kg === 'string'
            ? Number(bin.capacity_kg)
            : bin.capacity_kg
          : bin.capacity !== undefined && bin.capacity !== null
            ? typeof bin.capacity === 'string'
              ? Number(bin.capacity)
              : bin.capacity
            : null,
      total_collected_weight:
        typeof bin.total_collected_weight === 'string'
          ? Number(bin.total_collected_weight)
          : bin.total_collected_weight,
    }));
  }

  static async getBinById(id: number): Promise<BackendBin> {
    const response = await apiClient.get(`/bins/${id}`);
    const payload =
      response.data && response.data.data ? response.data.data : response.data;

    return payload?.bin ?? payload;
  }

  static async createBin(binData: CreateBinData): Promise<BackendBin> {
    const payload = {
      bin_name: binData.bin_name.trim(),
      bin_type: binData.bin_type,
      latitude: Number(binData.latitude),
      longitude: Number(binData.longitude),
      address: binData.address?.trim() || null,
      capacity_kg: binData.capacity_kg ? Number(binData.capacity_kg) : null,
    };

    if (!payload.bin_name) {
      throw new Error('Bin name is required');
    }
    if (isNaN(payload.latitude) || isNaN(payload.longitude)) {
      throw new Error('Valid coordinates are required');
    }
    if (payload.latitude < -90 || payload.latitude > 90) {
      throw new Error('Latitude must be between -90 and 90');
    }
    if (payload.longitude < -180 || payload.longitude > 180) {
      throw new Error('Longitude must be between -180 and 180');
    }

    try {
      const response = await apiClient.post('/bins', payload);

      return response.data && response.data.data
        ? response.data.data
        : response.data;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to create bin';
      throw new Error(errorMessage);
    }
  }

  static async updateBinStatus(id: number): Promise<BackendBin> {
    const response = await apiClient.put(`/bins/${id}/status`, {});
    return response.data && response.data.data
      ? response.data.data
      : response.data;
  }

  static async deleteBin(id: number): Promise<void> {
    await apiClient.delete(`/bins/${id}`);
  }

  static async recordCollection(
    id: number,
    weight?: number
  ): Promise<BackendBin> {
    const response = await apiClient.post(`/bins/${id}/collect`, {
      collected_weight: weight,
    });
    return response.data && response.data.data
      ? response.data.data
      : response.data;
  }

  static async getNearestBins(
    lat: number,
    lng: number,
    binType?: BinType,
    limit = 5
  ): Promise<Bin[]> {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      limit: limit.toString(),
    });
    if (binType) params.append('bin_type', binType);

    const response = await apiClient.get(`/bins/nearest?${params}`);
    const payload =
      response.data && response.data.data ? response.data.data : response.data;
    const bins = Array.isArray(payload) ? payload : payload?.bins;

    if (!bins || !Array.isArray(bins)) {
      console.error(
        'Invalid response structure for nearest bins:',
        response.data
      );
      return [];
    }

    return bins.map(transformBin);
  }
}
