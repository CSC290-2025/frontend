import type {
  Bin,
  BinWithDistance,
  BinType,
  BinStatus,
  BinStats,
} from '@/features/waste-management/types';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export class BinApiService {
  static async getAllBins(filters?: {
    bin_type?: BinType;
    status?: BinStatus;
  }): Promise<Bin[]> {
    const params = new URLSearchParams();
    if (filters?.bin_type) params.append('bin_type', filters.bin_type);
    if (filters?.status) params.append('status', filters.status);

    const response = await fetch(`${API_BASE_URL}/bins?${params}`);
    const data = await response.json();
    return data.data.bins;
  }

  static async getBinById(id: number): Promise<Bin> {
    const response = await fetch(`${API_BASE_URL}/bins/${id}`);
    const data = await response.json();
    return data.data.bin;
  }

  static async createBin(binData: Partial<Bin>): Promise<Bin> {
    const response = await fetch(`${API_BASE_URL}/bins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(binData),
    });
    const data = await response.json();
    return data.data;
  }

  static async updateBinStatus(id: number, status: BinStatus): Promise<Bin> {
    const response = await fetch(`${API_BASE_URL}/bins/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await response.json();
    return data.data;
  }

  static async recordCollection(id: number, weight?: number): Promise<Bin> {
    const response = await fetch(`${API_BASE_URL}/bins/${id}/collect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collected_weight: weight }),
    });
    const data = await response.json();
    return data.data;
  }

  static async getNearestBins(
    lat: number,
    lng: number,
    binType?: BinType,
    limit = 5
  ): Promise<BinWithDistance[]> {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      limit: limit.toString(),
    });
    if (binType) params.append('bin_type', binType);

    const response = await fetch(`${API_BASE_URL}/bins/nearest?${params}`);
    const data = await response.json();
    return data.data.bins;
  }

  static async getBinStats(): Promise<BinStats> {
    const response = await fetch(`${API_BASE_URL}/bins/stats`);
    const data = await response.json();
    return data.data.stats;
  }
}
