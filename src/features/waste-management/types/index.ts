export interface WasteType {
  id: number;
  type_name: string;
  typical_weight_kg: number | null;
}

export interface WasteLogRequest {
  waste_type_name: string;
  weight: number;
}
export interface WasteStats {
  month: number;
  year: number;
  total_weight_kg: number;
  by_type: {
    waste_type?: string;
    total_weight: number;
    entry_count: number;
  }[];
}

export interface DailyStats {
  date: string;
  total_weight_kg: number;
  by_type: {
    waste_type?: string;
    total_weight: number;
    log_id: number;
  }[];
}
export interface Bin {
  id: number;
  bin_name: string;
  bin_type: 'RECYCLABLE' | 'GENERAL' | 'HAZARDOUS';
  latitude: number;
  longitude: number;
  address: string | null;
  capacity_kg: number | null;
}

export interface BinWithDistance extends Bin {
  distance_km: number;
}

export interface CreateBinData {
  bin_name: string;
  bin_type: 'RECYCLABLE' | 'GENERAL' | 'HAZARDOUS';
  latitude: number;
  longitude: number;
  address?: string;
  capacity_kg?: number;
}

export const BinType = {
  RECYCLABLE: 'RECYCLABLE',
  GENERAL: 'GENERAL',
  HAZARDOUS: 'HAZARDOUS',
} as const;

export type BinType = (typeof BinType)[keyof typeof BinType];

export type BinFilter = 'All' | BinType;

export interface BinFilters {
  bin_type?: Bin['bin_type'];
  search?: string;
  min_capacity?: number;
  max_capacity?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Bin {
  id: number;
  name: string;
  type: 'Recyclable' | 'General Waste' | 'Hazardous';
  color: string;
  lat: number;
  lng: number;
  distance?: string;
  numericDistance?: number;
}

export interface BackendBin {
  id: number;
  bin_name: string;
  bin_type: 'RECYCLABLE' | 'GENERAL' | 'HAZARDOUS';
  latitude: number;
  longitude: number;
  address: string | null;
  capacity_kg: number | null;
  created_by_user_id: number | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
