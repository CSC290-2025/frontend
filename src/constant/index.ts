import type { BinType, BinStatus } from '../types/index.ts';

export const BIN_TYPE_COLORS: Record<BinType, string> = {
  RECYCLABLE: '#22c55e',
  GENERAL: '#3b82f6',
  HAZARDOUS: '#eab308',
  ORGANIC: '#8b5cf6',
};

export const BIN_STATUS_COLORS: Record<BinStatus, string> = {
  NORMAL: '#22c55e',
  OVERFLOW: '#ef4444',
  NEEDS_COLLECTION: '#f97316',
  MAINTENANCE: '#6b7280',
};

export const BIN_TYPE_LABELS: Record<BinType, string> = {
  RECYCLABLE: 'Recyclable',
  GENERAL: 'General',
  HAZARDOUS: 'Hazardous',
  ORGANIC: 'Organic',
};
