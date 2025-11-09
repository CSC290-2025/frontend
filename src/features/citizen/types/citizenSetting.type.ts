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
