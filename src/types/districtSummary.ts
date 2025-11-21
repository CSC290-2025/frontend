export interface DistrictSummary {
  district: string;
  period: string;
  summary: {
    average: {
      aqi: number;
      pm25: number;
      pm10: number;
    };
    maximum: {
      aqi: number;
      pm25: number;
      pm10: number;
    };
    minimum: {
      aqi: number;
      pm25: number;
      pm10: number;
    };
    trend: {
      aqi_change: number;
      description: string;
    };
  };
}
