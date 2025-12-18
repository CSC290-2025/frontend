import { apiClient } from '@/lib/apiClient';
import type {
  Bin,
  BackendBin,
  BinType,
  CreateBinData,
} from '@/features/waste-management/types';

function transformBin(backendBin: any): Bin {
  const typeMap: Record<string, string> = {
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
    id: backendBin.id,
    name: backendBin.bin_name || backendBin.name,
    type: typeMap[backendBin.bin_type] || backendBin.type || 'General Waste',
    bin_name: backendBin.bin_name,
    bin_type: backendBin.bin_type || 'GENERAL',
    lat: Number(backendBin.latitude || backendBin.lat),
    lng: Number(backendBin.longitude || backendBin.lng),
    latitude: Number(backendBin.latitude || backendBin.lat),
    longitude: Number(backendBin.longitude || backendBin.lng),
    capacity_kg:
      backendBin.capacity_kg !== undefined && backendBin.capacity_kg !== null
        ? Number(backendBin.capacity_kg)
        : backendBin.capacity !== undefined && backendBin.capacity !== null
          ? Number(backendBin.capacity)
          : null,
    color: colorMap[backendBin.bin_type] || backendBin.color || 'text-gray-600',
    distance: backendBin.distance,
    numericDistance: backendBin.numericDistance,
  } as any;
}

export class BinApiService {
  private static extractData(response: any): any {
    const payload = response.data?.data ?? response.data;
    return payload;
  }

  private static mapToBackendBin(bin: any): BackendBin {
    return {
      ...bin,
      id: Number(bin.id),
      latitude: Number(bin.latitude ?? bin.lat),
      longitude: Number(bin.longitude ?? bin.lng),
      capacity_kg:
        bin.capacity_kg !== undefined && bin.capacity_kg !== null
          ? Number(bin.capacity_kg)
          : bin.capacity !== undefined && bin.capacity !== null
            ? Number(bin.capacity)
            : null,
      created_by_user_id:
        bin.created_by_user_id !== undefined && bin.created_by_user_id !== null
          ? Number(bin.created_by_user_id)
          : bin.user_id !== undefined && bin.user_id !== null
            ? Number(bin.user_id)
            : null,
      total_collected_weight:
        bin.total_collected_weight !== undefined &&
        bin.total_collected_weight !== null
          ? Number(bin.total_collected_weight)
          : undefined,
    } as BackendBin;
  }

  static async getBinsByUser(): Promise<BackendBin[]> {
    const response = await apiClient.get('/bins/user');
    const data = this.extractData(response);
    const bins = Array.isArray(data) ? data : (data?.bins ?? []);

    if (!Array.isArray(bins)) {
      console.error(
        'Invalid response structure in getBinsByUser:',
        response.data
      );
      throw new Error('Failed to fetch user bins: Invalid response structure');
    }

    return bins.map((bin: any) => this.mapToBackendBin(bin));
  }

  static async getAllBins(filters?: {
    bin_type?: BinType;
  }): Promise<BackendBin[]> {
    const response = await apiClient.get('/bins', { params: filters });
    const data = this.extractData(response);
    const bins = Array.isArray(data) ? data : (data?.bins ?? []);

    if (!Array.isArray(bins)) {
      console.error('Invalid response structure in getAllBins:', response.data);
      throw new Error('Failed to fetch bins: Invalid response structure');
    }

    return bins.map((bin: any) => this.mapToBackendBin(bin));
  }

  static async getBinById(id: number): Promise<BackendBin> {
    const response = await apiClient.get(`/bins/${id}`);
    const data = this.extractData(response);
    const bin = data?.bin ?? data;

    if (!bin) {
      throw new Error('Bin not found');
    }

    return this.mapToBackendBin(bin);
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

    if (!payload.bin_name) throw new Error('Bin name is required');
    if (isNaN(payload.latitude) || isNaN(payload.longitude))
      throw new Error('Valid coordinates are required');

    try {
      const response = await apiClient.post('/bins', payload);
      const data = this.extractData(response);
      return this.mapToBackendBin(data?.bin ?? data);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create bin';
      throw new Error(errorMessage);
    }
  }

  static async updateBinStatus(id: number): Promise<BackendBin> {
    const response = await apiClient.put(`/bins/${id}/status`, {});
    const data = this.extractData(response);
    return this.mapToBackendBin(data?.bin ?? data);
  }

  static async deleteBin(id: number): Promise<void> {
    try {
      await apiClient.delete(`/bins/${id}`);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to delete bin';
      throw new Error(errorMessage);
    }
  }

  static async recordCollection(
    id: number,
    weight?: number
  ): Promise<BackendBin> {
    const response = await apiClient.post(`/bins/${id}/collect`, {
      collected_weight: weight,
    });
    const data = this.extractData(response);
    return this.mapToBackendBin(data?.bin ?? data);
  }

  static async getNearestBins(
    lat: number,
    lng: number,
    binType?: BinType,
    limit = 5
  ): Promise<Bin[]> {
    const response = await apiClient.get('/bins/nearest', {
      params: { lat, lng, limit, bin_type: binType },
    });
    const data = this.extractData(response);
    const bins = Array.isArray(data) ? data : (data?.bins ?? []);

    if (!Array.isArray(bins)) {
      console.error(
        'Invalid response structure for nearest bins:',
        response.data
      );
      return [];
    }

    return bins.map(transformBin);
  }
}
