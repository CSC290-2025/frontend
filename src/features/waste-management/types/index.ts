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
  bin_type: 'RECYCLABLE' | 'GENERAL' | 'HAZARDOUS' | 'ORGANIC';
  latitude: number;
  longitude: number;
  address: string | null;
  capacity_kg: number | null;
  status: 'NORMAL' | 'OVERFLOW' | 'NEEDS_COLLECTION' | 'MAINTENANCE';
  last_collected_at: string;
  total_collected_weight: number;
  created_at: string;
  updated_at: string;
}

export interface BinWithDistance extends Bin {
  distance_km: number;
}

export interface CreateBinData {
  bin_name: string;
  bin_type: 'RECYCLABLE' | 'GENERAL' | 'HAZARDOUS' | 'ORGANIC';
  latitude: number;
  longitude: number;
  address?: string;
  capacity_kg?: number;
  status?: 'NORMAL' | 'OVERFLOW' | 'NEEDS_COLLECTION' | 'MAINTENANCE';
}

export interface UpdateBinData {
  bin_name?: string;
  bin_type?: 'RECYCLABLE' | 'GENERAL' | 'HAZARDOUS' | 'ORGANIC';
  latitude?: number;
  longitude?: number;
  address?: string;
  capacity_kg?: number;
  status?: 'NORMAL' | 'OVERFLOW' | 'NEEDS_COLLECTION' | 'MAINTENANCE';
}

export interface BinStats {
  totalBins: number;
  byType: {
    bin_type: string;
    _count: { id: number };
  }[];
  byStatus: {
    status: string;
    _count: { id: number };
  }[];
  overflowBins: number;
}

export const BinStatus = {
  NORMAL: 'NORMAL',
  OVERFLOW: 'OVERFLOW',
  NEEDS_COLLECTION: 'NEEDS_COLLECTION',
  MAINTENANCE: 'MAINTENANCE',
} as const;

export type BinStatus = (typeof BinStatus)[keyof typeof BinStatus];

export const BinType = {
  RECYCLABLE: 'RECYCLABLE',
  GENERAL: 'GENERAL',
  HAZARDOUS: 'HAZARDOUS',
  ORGANIC: 'ORGANIC',
} as const;

export type BinType = (typeof BinType)[keyof typeof BinType];

export interface BinFilters {
  status?: BinStatus;
  bin_type?: Bin['bin_type'];
  search?: string;
  min_capacity?: number;
  max_capacity?: number;
  [key: string]: string | number | boolean | undefined;
}
