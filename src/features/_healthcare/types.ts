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

export interface Facility {
  id: number;
  name: string;
  facilityType: Nullable<string>;
  addressId: Nullable<number>;
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
  staffUserId: Nullable<number>;
  appointmentAt: Nullable<string>;
  type: Nullable<string>;
  status: Nullable<string>;
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
  staffUserId?: number;
  status?: string;
  type?: string;
  search?: string;
}
