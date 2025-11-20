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
