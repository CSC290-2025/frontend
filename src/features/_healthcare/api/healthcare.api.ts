import { apiClient } from '@/lib/apiClient';
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
