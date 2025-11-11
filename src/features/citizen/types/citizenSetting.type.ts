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
