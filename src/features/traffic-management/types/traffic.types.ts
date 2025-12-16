export interface TrafficSignal {
  duration: number;
  color: 'red' | 'yellow' | 'green';
  intersectionId: number;
  automode?: boolean;
}

export interface Coordinates {
  type: 'Point';
  coordinates: [number, number];
}

export interface TrafficRequest {
  request_id: number;
  traffic_light_id: number;
  requested_by: string;
  priority: string;
  reason: string;
  status: string;
  requested_at: string;
}

export interface TrafficLightRequest {
  success: boolean;
  data: {
    lightRequest: TrafficRequest[];
  };
  meta: {
    total: number;
    page: number;
    per_page: number;
    filters_applied: {
      page: number;
      per_page: number;
    };
  };
  timestamp: string;
}
export interface trafficLight {
  id: number;
  intersection_id: number;
  road_id: number;
  ip_address: string;
  location: Coordinates;
  status: number;
  statusLabel?: string;
  current_color: number;
  density_level: number;
  auto_mode: boolean;
  green_duration: number;
  red_duration: number;
  last_color: number;
  last_updated: string;
}

export interface lightRequest {
  priority: string;
  reason: string;
  request_id: string;
  requested_at: string;
  requested_by: string;
  status: string;
  traffic_light_id: number;
}

export interface TrafficLightsResponse {
  success: boolean;
  data: {
    trafficLights: trafficLight[];
    total: number;
  };
  timestamp: string;
}
