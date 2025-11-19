export interface Address {
  address_line: string;
  province: string;
  district: string;
  subdistrict: string;
  postal_code: string;
}

export interface UserProfile {
  id_card_number: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  birth_date: string;
  blood_type: string;
  congenital_disease: string;
  allergy: string;
  height: number;
  weight: number;
  gender: string;
  profile: string;
  addresses: Address[];
}

export interface InsuranceCard {
  card_number: string;
}

export interface EmergencyContact {
  phone: string;
}

export interface User {
  username: string;
  email: string;
  phone: string;
  insurance_cards: InsuranceCard[];
  user_profiles: UserProfile[];
  emergency_contacts: EmergencyContact[];
}
