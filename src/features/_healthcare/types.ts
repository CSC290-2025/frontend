export interface ApiSuccess<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

type Nullable<T> = T | null;

export interface Bed {
  id: number;
  facilityId: Nullable<number>;
  bedNumber: Nullable<string>;
  bedType: Nullable<string>;
  status: Nullable<string>;
  patientId: Nullable<number>;
  admissionDate: Nullable<string>;
  createdAt: string;
}

export interface PaginatedBeds {
  beds: Bed[];
  total: number;
  page: number;
  totalPages: number;
}

export interface BedListParams {
  page?: number;
  limit?: number;
  sortBy?: 'id' | 'createdAt' | 'bedNumber';
  sortOrder?: 'asc' | 'desc';
  facilityId?: number;
  patientId?: number;
  status?: string;
  search?: string;
}

export interface BedPayload {
  facilityId?: number | null;
  bedNumber?: string | null;
  bedType?: string | null;
  status?: string | null;
  patientId?: number | null;
  admissionDate?: string | null;
}

export interface Facility {
  id: number;
  name: string;
  facilityType: Nullable<string>;
  addressId: Nullable<number>;
  address?: {
    address_line?: Nullable<string>;
    province?: Nullable<string>;
    district?: Nullable<string>;
    subdistrict?: Nullable<string>;
    postal_code?: Nullable<string>;
  };
  phone: Nullable<string>;
  emergencyServices: Nullable<boolean>;
  departmentId: Nullable<number>;
  createdAt: string;
}

export interface PaginatedFacilities {
  facilities: Facility[];
  total: number;
  page: number;
  totalPages: number;
}

export interface FacilityListParams {
  page?: number;
  limit?: number;
  sortBy?: 'id' | 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
  addressId?: number;
  departmentId?: number;
  facilityType?: string;
  emergencyServices?: boolean;
  search?: string;
}

export interface AddressPayload {
  address_line?: string;
  province?: string;
  district?: string;
  subdistrict?: string;
  postal_code?: string;
}

export interface CreateFacilityPayload {
  name: string;
  facilityType?: string;
  addressId?: number;
  address?: AddressPayload;
  phone?: string;
  emergencyServices?: boolean;
  departmentId?: number;
}

export type UpdateFacilityPayload = Partial<CreateFacilityPayload>;

export interface Patient {
  id: number;
  userId: Nullable<number>;
  emergencyContact: Nullable<string>;
  createdAt: string;
}

export interface PaginatedPatients {
  patients: Patient[];
  total: number;
  page: number;
  totalPages: number;
}

export interface PatientListParams {
  page?: number;
  limit?: number;
  sortBy?: 'id' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  userId?: number;
  search?: string;
}

export interface Appointment {
  id: number;
  patientId: Nullable<number>;
  facilityId: Nullable<number>;
  doctorId: Nullable<number>;
  appointmentAt: Nullable<string>;
  type: Nullable<string>;
  status: Nullable<string>;
  consultationFee: Nullable<number>;
  createdAt: string;
}

export interface PaginatedAppointments {
  appointments: Appointment[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AppointmentListParams {
  page?: number;
  limit?: number;
  sortBy?: 'id' | 'createdAt' | 'appointmentAt';
  sortOrder?: 'asc' | 'desc';
  patientId?: number;
  facilityId?: number;
  doctorId?: number;
  type?: string;
  search?: string;
}

export interface CreateAppointmentPayload {
  patientId?: number;
  facilityId?: number;
  appointmentAt?: string;
  type?: string;
  doctorId?: number;
  consultationFee?: number;
}

export interface MedicineInventory {
  id: number;
  facilityId: Nullable<number>;
  medicineName: Nullable<string>;
  stockQuantity: Nullable<number>;
  unitPrice: Nullable<number>;
  isInStock: Nullable<boolean>;
  createdAt: Nullable<string>;
}

export interface PaginatedMedicineInventory {
  medicineInventory: MedicineInventory[];
  total: number;
  page: number;
  totalPages: number;
}

export interface MedicineInventoryListParams {
  page?: number;
  limit?: number;
  sortBy?: 'id' | 'createdAt' | 'medicineName';
  sortOrder?: 'asc' | 'desc';
  facilityId?: number;
  isInStock?: boolean;
  search?: string;
}

export interface CreateMedicinePayload {
  facilityId?: number;
  medicineName?: string;
  stockQuantity?: number;
  unitPrice?: number;
  isInStock?: boolean;
}

export type UpdateMedicinePayload = CreateMedicinePayload;

export interface MedicineListItem {
  medicineId?: number;
  name: string;
  quantity: number;
  dosage?: string | null;
}

export interface Prescription {
  id: number;
  patientId: Nullable<number>;
  facilityId: Nullable<number>;
  status: Nullable<string>;
  medicinesList: MedicineListItem[] | null;
  totalAmount: Nullable<number>;
  createdAt: string;
}

export interface PaginatedPrescriptions {
  prescriptions: Prescription[];
  total: number;
  page: number;
  totalPages: number;
}

export interface Department {
  id: number;
  name: string;
  createdAt: string;
}

export interface PaginatedDepartments {
  departments: Department[];
  total: number;
  page: number;
  totalPages: number;
}

export interface DepartmentListParams {
  page?: number;
  limit?: number;
  sortBy?: 'id' | 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface DepartmentPayload {
  name: string;
}

export interface PrescriptionListParams {
  page?: number;
  limit?: number;
  sortBy?: 'id' | 'createdAt' | 'status';
  sortOrder?: 'asc' | 'desc';
  patientId?: number;
  facilityId?: number;
  status?: string;
  search?: string;
}

export interface CreatePrescriptionPayload {
  patientId?: number;
  facilityId?: number;
  status?: string;
  medicinesList?: MedicineListItem[];
  totalAmount?: number;
}

export type UpdatePrescriptionPayload = {
  patientId?: number | null;
  facilityId?: number | null;
  status?: string | null;
  medicinesList?: MedicineListItem[] | null;
  totalAmount?: number | null;
};

export interface Doctor {
  id: number;
  specialization: Nullable<string>;
  currentStatus: Nullable<string>;
  consultationFee: Nullable<number>;
  facilityId?: Nullable<number>;
  departmentId?: Nullable<number>;
  createdAt: string;
}

export interface PaginatedDoctors {
  doctors: Doctor[];
  total: number;
  page: number;
  totalPages: number;
}

export interface DoctorListParams {
  page?: number;
  limit?: number;
  sortBy?: 'id' | 'createdAt' | 'specialization';
  sortOrder?: 'asc' | 'desc';
  specialization?: string;
  currentStatus?: string;
  search?: string;
  facilityId?: number;
  departmentId?: number;
}

export interface CreateDoctorPayload {
  specialization?: string;
  currentStatus?: string;
  consultationFee?: number;
  facilityId?: number;
  departmentId?: number;
}

export type UpdateDoctorPayload = Partial<CreateDoctorPayload>;
