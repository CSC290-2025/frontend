export interface Address {
  address_line: string | null;
  province: string | null;
  district: string | null;
  subdistrict: string | null;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface createAddress {
  address_line: string;
  province: string;
  district: string;
  subdistrict: string;
  postal_code: string;
}

export interface updateAddress {
  address_line?: string;
  province?: string;
  district?: string;
  subdistrict?: string;
  postal_code?: string;
}

export interface AddressIdParam {
  id: number;
}
