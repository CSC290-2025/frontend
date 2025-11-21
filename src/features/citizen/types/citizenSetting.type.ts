export type PersonalData = {
  IdCardNumber: string;
  Firstname: string;
  Middlename: string;
  Lastname: string;
  Enthnicity: string;
  Nationality: string;
  Religion: string;
  PhoneNumber: string;
  EmergencyContact: string;
  AddressLine: string;
  SubDistrict: string;
  District: string;
  Province: string;
  PostalCode: string;
};

export type PersonalProps = {
  data: PersonalData;
};

export type HealthData = {
  BirthDate: string;
  BloodType: string;
  CongenitalDisease: string;
  Allergic: string;
  Insurance: string;
  Height: number;
  Weight: number;
  Gender: string;
};

export type HeathProps = {
  data: HealthData;
};

export type AccountData = {
  Username: string;
  Email: string;
};

export type AccountProps = {
  data: AccountData;
};

export interface UpdateUserPersonal {
  id_card_number?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  ethnicity?: string;
  nationality?: string;
  religion?: string;
  phone?: string;
  emergency_contact?: string;
  address_id?: number;
}

export interface UpdateUserPersonalProp {
  data: UpdateUserPersonal;
}

export interface UpdateUserHealth {
  birth_date?: Date | string;
  blood_type?: 'A' | 'B' | 'AB' | 'O';
  congenital_disease?: string;
  allergy?: string;
  height?: number;
  weight?: number;
  gender?: 'male' | 'female' | 'none';
}

export interface UpdateUserHealthProp {
  data: UpdateUserHealth;
}

export interface UpdateUserAccount {
  email?: string;
  username?: string;
  profile_picture?: string;
}

export interface UpdateUserAccountProp {
  data: UpdateUserAccount;
}
