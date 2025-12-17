import { apiClient } from '@/lib/apiClient';
import { isAxiosError } from 'axios';
import type {
  ApiSuccess,
  AppointmentListParams,
  PaginatedAppointments,
  PaginatedBeds,
  PaginatedFacilities,
  PaginatedPatients,
  BedListParams,
  FacilityListParams,
  PatientListParams,
  BedPayload,
  PaginatedMedicineInventory,
  MedicineInventoryListParams,
  CreateMedicinePayload,
  UpdateMedicinePayload,
  PaginatedPrescriptions,
  PrescriptionListParams,
  Prescription,
  CreatePrescriptionPayload,
  UpdatePrescriptionPayload,
  PaginatedDoctors,
  DoctorListParams,
  CreateAppointmentPayload,
  CreateFacilityPayload,
  UpdateFacilityPayload,
  DepartmentListParams,
  PaginatedDepartments,
  DepartmentPayload,
  CreateDoctorPayload,
  UpdateDoctorPayload,
  UpdateAppointmentPayload,
} from '@/features/_healthcare/types';

const sanitizeParams = (
  params: Record<string, unknown> | undefined
): Record<string, unknown> | undefined => {
  if (!params) return undefined;
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== ''
    )
  );
};

export const fetchBeds = async (params: BedListParams = {}) => {
  const query = sanitizeParams({
    page: 1,
    limit: 12,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...params,
  });

  const { data } = await apiClient.get<ApiSuccess<PaginatedBeds>>('/beds', {
    params: query,
  });

  return data.data;
};

export const fetchFacilities = async (params: FacilityListParams = {}) => {
  const query = sanitizeParams({
    page: 1,
    limit: 6,
    sortBy: 'name',
    sortOrder: 'asc',
    ...params,
  });

  const { data } = await apiClient.get<ApiSuccess<PaginatedFacilities>>(
    '/facilities',
    {
      params: query,
    }
  );

  return data.data;
};

export const createFacility = async (payload: CreateFacilityPayload) => {
  const { data } = await apiClient.post<
    ApiSuccess<{ facility: PaginatedFacilities['facilities'][number] }>
  >('/facilities', payload);
  return data.data.facility;
};

export const updateFacility = async (
  id: number,
  payload: UpdateFacilityPayload
) => {
  const { data } = await apiClient.put<
    ApiSuccess<{ facility: PaginatedFacilities['facilities'][number] }>
  >(`/facilities/${id}`, payload);
  return data.data.facility;
};

export const deleteFacility = async (id: number) => {
  await apiClient.delete(`/facilities/${id}`);
};

export const fetchPatients = async (params: PatientListParams = {}) => {
  const query = sanitizeParams({
    page: 1,
    limit: 8,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...params,
  });

  const { data } = await apiClient.get<ApiSuccess<PaginatedPatients>>(
    '/patients',
    {
      params: query,
    }
  );

  return data.data;
};

export const fetchAppointments = async (params: AppointmentListParams = {}) => {
  const query = sanitizeParams({
    page: 1,
    limit: 8,
    sortBy: 'appointmentAt',
    sortOrder: 'asc',
    ...params,
  });

  const { data } = await apiClient.get<ApiSuccess<PaginatedAppointments>>(
    '/appointments',
    {
      params: query,
    }
  );

  return data.data;
};

export const fetchDoctors = async (params: DoctorListParams = {}) => {
  const query = sanitizeParams({
    page: 1,
    limit: 50,
    sortBy: 'specialization',
    sortOrder: 'asc',
    ...params,
  });

  const { data } = await apiClient.get<ApiSuccess<PaginatedDoctors>>(
    '/doctors',
    {
      params: query,
    }
  );

  return data.data;
};

export const createDoctor = async (payload: CreateDoctorPayload) => {
  const { data } = await apiClient.post<
    ApiSuccess<{ doctor: PaginatedDoctors['doctors'][number] }>
  >('/doctors', payload);
  return data.data.doctor;
};

export const updateDoctor = async (
  id: number,
  payload: UpdateDoctorPayload
) => {
  const { data } = await apiClient.put<
    ApiSuccess<{ doctor: PaginatedDoctors['doctors'][number] }>
  >(`/doctors/${id}`, payload);
  return data.data.doctor;
};

export const deleteDoctor = async (id: number) => {
  await apiClient.delete(`/doctors/${id}`);
};

export const createAppointment = async (payload: CreateAppointmentPayload) => {
  try {
    const { data } = await apiClient.post<
      ApiSuccess<{ appointment: PaginatedAppointments['appointments'][number] }>
    >('/appointments', payload);

    return data.data.appointment;
  } catch (error) {
    if (isAxiosError(error)) {
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ??
        error.message ??
        'Unable to book appointment.';
      throw new Error(message);
    }

    throw error;
  }
};

export const updateAppointment = async (
  id: number,
  payload: UpdateAppointmentPayload
) => {
  const { data } = await apiClient.put<
    ApiSuccess<{ appointment: PaginatedAppointments['appointments'][number] }>
  >(`/appointments/${id}`, payload);

  return data.data.appointment;
};

export const fetchMedicineInventory = async (
  params: MedicineInventoryListParams = {}
) => {
  const query = sanitizeParams({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...params,
  });

  const { data } = await apiClient.get<ApiSuccess<PaginatedMedicineInventory>>(
    '/medicine-inventory',
    {
      params: query,
    }
  );

  return data.data;
};

export const createMedicine = async (payload: CreateMedicinePayload) => {
  const { data } = await apiClient.post<
    ApiSuccess<PaginatedMedicineInventory['medicineInventory'][number]>
  >('/medicine-inventory', payload);
  return data.data;
};

export const updateMedicine = async (
  id: number,
  payload: UpdateMedicinePayload
) => {
  const { data } = await apiClient.put<
    ApiSuccess<PaginatedMedicineInventory['medicineInventory'][number]>
  >(`/medicine-inventory/${id}`, payload);
  return data.data;
};

export const deleteMedicine = async (id: number) => {
  await apiClient.delete(`/medicine-inventory/${id}`);
};

export const fetchPrescriptions = async (
  params: PrescriptionListParams = {}
) => {
  const query = sanitizeParams({
    page: 1,
    limit: 30,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...params,
  });

  const { data } = await apiClient.get<ApiSuccess<PaginatedPrescriptions>>(
    '/prescriptions',
    {
      params: query,
    }
  );

  return data.data;
};

export const createPrescription = async (
  payload: CreatePrescriptionPayload
) => {
  const { data } = await apiClient.post<
    ApiSuccess<{ prescription: Prescription }>
  >('/prescriptions', payload);
  return data.data.prescription;
};

export const updatePrescription = async (
  id: number,
  payload: UpdatePrescriptionPayload
) => {
  const { data } = await apiClient.put<
    ApiSuccess<{ prescription: Prescription }>
  >(`/prescriptions/${id}`, payload);
  return data.data.prescription;
};

export const deletePrescription = async (id: number) => {
  await apiClient.delete(`/prescriptions/${id}`);
};

export const fetchDepartments = async (params: DepartmentListParams = {}) => {
  const query = sanitizeParams({
    page: 1,
    limit: 50,
    sortBy: 'name',
    sortOrder: 'asc',
    ...params,
  });

  const { data } = await apiClient.get<ApiSuccess<PaginatedDepartments>>(
    '/departments',
    {
      params: query,
    }
  );

  return data.data;
};

export const createDepartment = async (payload: DepartmentPayload) => {
  const { data } = await apiClient.post<
    ApiSuccess<{ department: PaginatedDepartments['departments'][number] }>
  >('/departments', payload);
  return data.data.department;
};

export const updateDepartment = async (
  id: number,
  payload: Partial<DepartmentPayload>
) => {
  const { data } = await apiClient.put<
    ApiSuccess<{ department: PaginatedDepartments['departments'][number] }>
  >(`/departments/${id}`, payload);
  return data.data.department;
};

export const deleteDepartment = async (id: number) => {
  await apiClient.delete(`/departments/${id}`);
};

export const createBed = async (payload: BedPayload) => {
  const { data } = await apiClient.post<ApiSuccess<unknown>>('/beds', payload);
  return data.data;
};

export const updateBed = async (id: number, payload: BedPayload) => {
  const { data } = await apiClient.put<ApiSuccess<unknown>>(
    `/beds/${id}`,
    payload
  );
  return data.data;
};

export const deleteBed = async (id: number) => {
  await apiClient.delete(`/beds/${id}`);
};
