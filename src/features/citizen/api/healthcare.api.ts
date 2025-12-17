import { httpGet } from './http';

type ApiSuccess<T> = {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
};

type PatientApi = {
  id?: number | string | null;
  user_id?: number | null;
  date_of_birth?: string | null;
  birth_date?: string | null;
};

type AppointmentApi = {
  id?: number | string | null;
  appointment_at?: string | null;
  type?: string | null;
};

type PrescriptionApi = {
  id?: number | string | null;
  medicines_list?: unknown; // อาจเป็น Json
  status?: string | null;
};

export type HealthcareVM = {
  patientId: string;
  dateOfBirth: string;
  appointment: string;

  diagnosis: string;
  medications: string;
  notes: string;
};

export async function fetchMyHealthcare(userId: number) {
  const [patientRes, appointmentRes, prescriptionRes] = await Promise.all([
    httpGet<ApiSuccess<{ patient?: PatientApi } | PatientApi | PatientApi[]>>(
      `/patients/user/${userId}`
    ).catch(() => null),
    httpGet<ApiSuccess<{ appointments?: AppointmentApi[] } | AppointmentApi[]>>(
      `/appointments?userId=${userId}`
    ).catch(() => null),
    httpGet<
      ApiSuccess<{ prescriptions?: PrescriptionApi[] } | PrescriptionApi[]>
    >(`/prescriptions?userId=${userId}`).catch(() => null),
  ]);

  return normalizeHealthcare(patientRes, appointmentRes, prescriptionRes);
}

function normalizeHealthcare(
  patientRes: ApiSuccess<
    { patient?: PatientApi } | PatientApi | PatientApi[]
  > | null,
  appointmentRes: ApiSuccess<
    { appointments?: AppointmentApi[] } | AppointmentApi[]
  > | null,
  prescriptionRes: ApiSuccess<
    { prescriptions?: PrescriptionApi[] } | PrescriptionApi[]
  > | null
): HealthcareVM {
  // ---- Patient ----
  const patientPayload = patientRes?.data as any;

  const patient: PatientApi | undefined = Array.isArray(patientPayload)
    ? patientPayload[0]
    : (patientPayload?.patient ?? patientPayload);

  const patientId =
    patient?.id !== undefined && patient?.id !== null
      ? String(patient.id)
      : '-';

  const dob = patient?.date_of_birth ?? patient?.birth_date ?? null;

  const apptPayload = appointmentRes?.data as any;
  const appointments: AppointmentApi[] | undefined = Array.isArray(apptPayload)
    ? apptPayload
    : apptPayload?.appointments;

  const appt = appointments?.[0];
  const appointment = appt?.appointment_at ? String(appt.appointment_at) : '-';

  const rxPayload = prescriptionRes?.data as any;
  const prescriptions: PrescriptionApi[] | undefined = Array.isArray(rxPayload)
    ? rxPayload
    : rxPayload?.prescriptions;

  const rx = prescriptions?.[0];

  const medications = rx?.medicines_list
    ? typeof rx.medicines_list === 'string'
      ? rx.medicines_list
      : JSON.stringify(rx.medicines_list)
    : '-';

  const diagnosis = '-';
  const notes = '-';

  return {
    patientId,
    dateOfBirth: dob ? String(dob) : '-',
    appointment,
    diagnosis,
    medications,
    notes,
  };
}
