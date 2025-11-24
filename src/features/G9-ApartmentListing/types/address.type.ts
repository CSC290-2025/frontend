export interface Address {
  id: number;
  address_line: string;
  province: string;
  district: string;
  subdistrict: string;
  postal_code: string;
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
