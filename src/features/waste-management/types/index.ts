export type BinType = 'RECYCLABLE' | 'GENERAL' | 'HAZARDOUS' | 'ORGANIC';
export type BinStatus =
  | 'NORMAL'
  | 'OVERFLOW'
  | 'NEEDS_COLLECTION'
  | 'MAINTENANCE';

export interface Bin {
  id: number;
  bin_name: string;
  bin_type: BinType;
  latitude: number;
  longitude: number;
  address: string | null;
  capacity_kg: number | null;
  status: BinStatus;
  last_collected_at: string;
  total_collected_weight: number;
  created_at: string;
  updated_at: string;
  distance_km?: number;
}

export interface WasteType {
  id: number;
  type_name: string;
  typical_weight_kg: number | null;
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
  }[];
}

export interface BinStats {
  totalBins: number;
  byType: { bin_type: BinType; _count: { id: number } }[];
  byStatus: { status: BinStatus; _count: { id: number } }[];
  overflowBins: number;
}
