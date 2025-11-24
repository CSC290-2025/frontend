type BinType = 'RECYCLABLE' | 'GENERAL' | 'HAZARDOUS';

export const BIN_TYPE_COLORS: Record<BinType, string> = {
  RECYCLABLE: '#22c55e',
  GENERAL: '#3b82f6',
  HAZARDOUS: '#eab308',
};

export const BIN_TYPE_LABELS: Record<BinType, string> = {
  RECYCLABLE: 'Recyclable',
  GENERAL: 'General',
  HAZARDOUS: 'Hazardous',
};
