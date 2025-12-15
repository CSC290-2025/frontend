// Address interface
export interface Address {
  address_line: string | null;
  province: string | null;
  district: string | null;
  subdistrict: string | null;
  postal_code: string | null;
}

// Apartment type enums
export type ApartmentType = 'dormitory' | 'apartment';
export type ApartmentLocation =
  | 'chomthong'
  | 'thonburi'
  | 'thungkhru'
  | 'ratburana';
export type InternetType = 'free' | 'not_free' | 'none';
// Main Apartment interface
export interface Apartment {
  id: number;
  name: string;
  phone: string;
  description: string | null;
  electric_price: number;
  water_price: number;
  apartment_type: ApartmentType;
  apartment_location: ApartmentLocation;
  internet: InternetType;
  internet_price?: number | null;
  address_id: number;
  addresses?: Address;
}

// Array of apartments
export type ApartmentList = Apartment[];

// Create apartment payload interface
export interface CreateApartmentPayload {
  name: string;
  phone: string;
  description: string | null;
  apartment_type: ApartmentType;
  apartment_location: ApartmentLocation;
  electric_price: number;
  water_price: number;
  internet: InternetType;
  internet_price?: number | null;
  userId: number;
  address: {
    address_line: string | null;
    province: string | null;
    district: string | null;
    subdistrict: string | null;
    postal_code: string | null;
  };
}

// Update apartment payload interface
export interface UpdateApartmentPayload {
  name?: string;
  phone?: string;
  description?: string | null;
  apartment_type?: ApartmentType;
  apartment_location?: ApartmentLocation;
  electric_price?: number;
  water_price?: number;
  internet?: InternetType;
  internet_price?: number | null;
  address?: {
    address_line: string | null;
    province: string | null;
    district: string | null;
    subdistrict: string | null;
    postal_code: string | null;
  };
}

// Parameter types for API endpoints
export interface ApartmentIdParam {
  id: number;
}

export interface ApartmentFilterParams {
  apartment_location?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  search?: string | null;
}
