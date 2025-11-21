import type { DistrictDetailData } from './districtDetailData';
export interface DistrictHistory {
  district: string;
  period: string;
  history: DistrictDetailData[];
}
