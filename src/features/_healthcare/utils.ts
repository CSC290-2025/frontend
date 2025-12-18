import type { Appointment, Bed } from '@/features/_healthcare/types';

export const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export const normalizeStatus = (status: string | null | undefined) =>
  (status ?? 'pending').toLowerCase();

export const makeBedLabel = (bed: Bed) => {
  const number = bed.bedNumber ? `Bed ${bed.bedNumber}` : `Bed ${bed.id}`;
  const status = bed.status ?? 'Status TBD';
  return `${number} - ${status}`;
};

export const categorizeBeds = (beds: Bed[]) => {
  const buckets = {
    icu: [] as Bed[],
    general: [] as Bed[],
    emergency: [] as Bed[],
  };

  beds.forEach((bed) => {
    const type = (bed.bedType ?? '').toLowerCase();
    if (type.includes('icu')) {
      buckets.icu.push(bed);
    } else if (type.includes('emerg')) {
      buckets.emergency.push(bed);
    } else {
      buckets.general.push(bed);
    }
  });

  return buckets;
};

export const summarizeBeds = (beds: Bed[]) =>
  beds.reduce(
    (acc, bed) => {
      acc.total += 1;
      const status = normalizeStatus(bed.status);
      if (status === 'available') acc.available += 1;
      else if (status === 'maintenance') acc.maintenance += 1;
      else acc.occupied += 1;
      return acc;
    },
    { available: 0, occupied: 0, maintenance: 0, total: 0 }
  );

export const formatAppointmentTime = (value: Appointment['appointmentAt']) => {
  if (!value) return 'Scheduling';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? 'Scheduling'
    : new Intl.DateTimeFormat(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
        timeZoneName: 'short',
      }).format(parsed);
};
