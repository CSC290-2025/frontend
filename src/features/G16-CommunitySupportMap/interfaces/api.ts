export interface SuccessMarker {
  id: number;
  marker_type_id: number | null;
  description: string | null;
  location: {
    type: string;
    coordinates: [number, number]; // [lng, lat]
  } | null;
  created_at: string;
  updated_at: string;
  marker_type: {
    id: number;
    marker_type_icon: string | null;
    marker_type_color: string | null;
  } | null;
}

export interface MarkerType {
  marker_type_id?: number | null;
  description?: string | null;
  location?: {
    type: string;
    coordinates: [number, number];
  };
}

export interface UpdateMarkerInput {
  marker_type_id?: number | null;
  description?: string | null;
  location?: {
    type: string;
    coordinates: [number, number];
  };
}

// type ApiMarker = {
//   id: number;
//   description: string | null;
//   location: {
//     type: string;
//     coordinates: [number, number]; // [lng, lat]
//   } | null;
// };

export interface MapMarker {
  id: number;
  lat: number;
  lng: number;
  description: string | null;
  marker_type_id: number | null;
}

export interface CreateMarkerInput {
  marker_type_id?: number | null;
  description?: string | null;
  location?: {
    type: string;
    coordinates: [number, number]; // [lng, lat]
  };
}

export interface MarkerTypeInfo {
  id: number;
  name: string;
  icon: string;
  color: string;
}
