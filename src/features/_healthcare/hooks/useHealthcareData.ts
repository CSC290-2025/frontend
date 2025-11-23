import { useQuery } from '@tanstack/react-query';
import {
  fetchAppointments,
  fetchBeds,
  fetchFacilities,
  fetchMedicineInventory,
  fetchPrescriptions,
  fetchPatients,
} from '@/features/_healthcare/api/healthcare.api';
import type {
  AppointmentListParams,
  BedListParams,
  FacilityListParams,
  MedicineInventoryListParams,
  PrescriptionListParams,
  PatientListParams,
} from '@/features/_healthcare/types';

const STALE_TIME = 30 * 1000;

export const useBeds = (params?: BedListParams) =>
  useQuery({
    queryKey: ['beds', params ?? {}],
    queryFn: () => fetchBeds(params),
    staleTime: STALE_TIME,
  });

export const useFacilities = (params?: FacilityListParams) =>
  useQuery({
    queryKey: ['facilities', params ?? {}],
    queryFn: () => fetchFacilities(params),
    staleTime: STALE_TIME,
  });

export const usePatients = (params?: PatientListParams) =>
  useQuery({
    queryKey: ['patients', params ?? {}],
    queryFn: () => fetchPatients(params),
    staleTime: STALE_TIME,
  });

export const useAppointments = (params?: AppointmentListParams) =>
  useQuery({
    queryKey: ['appointments', params ?? {}],
    queryFn: () => fetchAppointments(params),
    staleTime: STALE_TIME,
  });

export const useMedicineInventory = (params?: MedicineInventoryListParams) =>
  useQuery({
    queryKey: ['medicineInventory', params ?? {}],
    queryFn: () => fetchMedicineInventory(params),
    staleTime: STALE_TIME,
  });

export const usePrescriptions = (params?: PrescriptionListParams) =>
  useQuery({
    queryKey: ['prescriptions', params ?? {}],
    queryFn: () => fetchPrescriptions(params),
    staleTime: STALE_TIME,
  });
