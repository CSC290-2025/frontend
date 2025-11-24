import React, { useMemo, useState } from 'react';
import { Calendar, Stethoscope, Users } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useAppointments,
  useFacilities,
  useDoctors,
} from '@/features/_healthcare/hooks/useHealthcareData';
import { DataState } from '@/features/_healthcare/components/common/DataState';
import { createAppointment } from '@/features/_healthcare/api/healthcare.api';
import type { Doctor, Facility } from '@/features/_healthcare/types';

const FALLBACK_SPECIALTIES = [
  'General',
  'Cardiology',
  'Pediatrics',
  'Emergency',
];
const HOURS = Array.from({ length: 13 }, (_, i) => 7 + i); // 7am-7pm (7..19)

const isSameUtcDay = (a: Date, b: Date) =>
  a.getUTCFullYear() === b.getUTCFullYear() &&
  a.getUTCMonth() === b.getUTCMonth() &&
  a.getUTCDate() === b.getUTCDate();

const makeDoctorLabel = (doctor: Doctor) =>
  `Doctor #${doctor.id}${doctor.specialization ? ` • ${doctor.specialization}` : ''}`;

const UserBookingPage: React.FC = () => {
  const queryClient = useQueryClient();
  const facilitiesQuery = useFacilities({ limit: 50, sortBy: 'name' });
  const doctorsQuery = useDoctors({
    limit: 100,
    sortBy: 'specialization',
    sortOrder: 'asc',
  });

  const [facilitySearch, setFacilitySearch] = useState('');
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(
    null
  );
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(
    null
  );
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const today = new Date();
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth()); // 0-index
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingFeedback, setBookingFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const filteredFacilities =
    facilitiesQuery.data?.facilities.filter((f) =>
      f.name.toLowerCase().includes(facilitySearch.toLowerCase())
    ) ?? [];

  const facilityLookup = useMemo(() => {
    const lookup = new Map<number, Facility>();
    facilitiesQuery.data?.facilities.forEach((facility) =>
      lookup.set(facility.id, facility)
    );
    return lookup;
  }, [facilitiesQuery.data]);

  const doctorBuckets = useMemo(() => {
    const buckets: Record<string, Doctor[]> = {};
    (doctorsQuery.data?.doctors ?? []).forEach((doctor) => {
      const key = doctor.specialization ?? 'General';
      if (!buckets[key]) buckets[key] = [];
      buckets[key].push(doctor);
    });
    Object.values(buckets).forEach((list) => list.sort((a, b) => a.id - b.id));
    return buckets;
  }, [doctorsQuery.data]);

  const specialtyOptions = useMemo(() => {
    const dynamic = Object.keys(doctorBuckets).sort((a, b) =>
      a.localeCompare(b)
    );
    return dynamic.length > 0 ? dynamic : FALLBACK_SPECIALTIES;
  }, [doctorBuckets]);

  const availableDoctors = selectedSpecialty
    ? (doctorBuckets[selectedSpecialty] ?? [])
    : [];

  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
  const calendarCells = Array.from(
    { length: firstDay + daysInMonth },
    (_, i) => (i < firstDay ? null : i - firstDay + 1)
  );

  const appointmentsQuery = useAppointments({
    limit: 200,
    sortBy: 'appointmentAt',
    sortOrder: 'asc',
    facilityId: selectedFacilityId ?? undefined,
    doctorId: selectedDoctor?.id ?? undefined,
  });

  const takenSlots = useMemo(() => {
    if (!selectedDate || !selectedDoctor) return new Set<number>();
    const set = new Set<number>();
    const selectedUtc = new Date(
      Date.UTC(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
      )
    );

    (appointmentsQuery.data?.appointments ?? []).forEach((appt) => {
      if (!appt.appointmentAt || appt.doctorId !== selectedDoctor.id) return;
      if (
        selectedFacilityId !== null &&
        appt.facilityId !== null &&
        appt.facilityId !== selectedFacilityId
      ) {
        return;
      }
      const apptDate = new Date(appt.appointmentAt);
      if (!isNaN(apptDate.getTime()) && isSameUtcDay(apptDate, selectedUtc)) {
        set.add(apptDate.getUTCHours());
      }
    });
    return set;
  }, [
    appointmentsQuery.data,
    selectedDate,
    selectedFacilityId,
    selectedDoctor,
  ]);

  const slotUnavailable = selectedHour !== null && takenSlots.has(selectedHour);

  const bookingPayload = useMemo(() => {
    if (
      !selectedFacilityId ||
      !selectedDoctor ||
      !selectedSpecialty ||
      !selectedDate ||
      selectedHour === null
    ) {
      return null;
    }

    const appointmentAt = new Date(
      Date.UTC(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        selectedHour
      )
    ).toISOString();

    return {
      facilityId: selectedFacilityId,
      doctorId: selectedDoctor.id,
      appointmentAt,
      type: selectedSpecialty,
      consultationFee: selectedDoctor.consultationFee ?? undefined,
    };
  }, [
    selectedFacilityId,
    selectedDoctor,
    selectedSpecialty,
    selectedDate,
    selectedHour,
  ]);

  const bookingDetails = useMemo(() => {
    if (
      !bookingPayload ||
      !selectedDoctor ||
      !selectedDate ||
      selectedHour === null
    ) {
      return null;
    }

    const facilityName =
      facilityLookup.get(bookingPayload.facilityId)?.name ??
      `Facility #${bookingPayload.facilityId}`;

    const localDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      selectedHour,
      0,
      0
    );

    return {
      facilityName,
      specialty: bookingPayload.type ?? 'General',
      doctorLabel: makeDoctorLabel(selectedDoctor),
      slotLabel: localDate.toLocaleString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
    };
  }, [
    bookingPayload,
    facilityLookup,
    selectedDoctor,
    selectedDate,
    selectedHour,
  ]);

  const bookingReady = Boolean(bookingPayload && !slotUnavailable);

  const handleConfirmRequest = () => {
    if (!bookingReady) return;
    setBookingFeedback(null);
    setConfirmOpen(true);
  };

  const handleBooking = async () => {
    if (!bookingPayload) return;
    setIsBooking(true);
    try {
      await createAppointment(bookingPayload);
      await queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setBookingFeedback({
        type: 'success',
        message: 'Appointment booked successfully.',
      });
      setConfirmOpen(false);
      setSelectedHour(null);
      setSelectedDate(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to book appointment.';
      setBookingFeedback({ type: 'error', message });
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-bold text-gray-900">Book an appointment</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="flex flex-col rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">
                Choose facility
              </p>
              <Users className="h-4 w-4 text-gray-500" />
            </div>
            <input
              className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="Search hospitals"
              value={facilitySearch}
              onChange={(e) => setFacilitySearch(e.target.value)}
            />
            <div className="mt-3 flex-1 space-y-2 overflow-y-auto pr-1">
              {facilitiesQuery.isLoading && (
                <DataState
                  message="Loading facilities..."
                  accent="cyan"
                  compact
                />
              )}
              {!facilitiesQuery.isLoading &&
                filteredFacilities.map((facility) => (
                  <button
                    key={facility.id}
                    onClick={() => {
                      setSelectedFacilityId(facility.id);
                      setSelectedDate(null);
                      setSelectedHour(null);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm ${
                      selectedFacilityId === facility.id
                        ? 'border-[#01CCFF] bg-[#01CCFF] text-white'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-[#0091B5]'
                    }`}
                  >
                    <span>{facility.name}</span>
                  </button>
                ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex flex-col gap-4">
              <div className="flex min-h-[200px] flex-col rounded-lg border border-gray-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">
                    Specialty
                  </p>
                  <Stethoscope className="h-4 w-4 text-gray-500" />
                </div>
                <div className="mt-3 flex-1 space-y-2 overflow-y-auto pr-1">
                  {specialtyOptions.map((spec) => (
                    <button
                      key={spec}
                      onClick={() => {
                        setSelectedSpecialty(spec);
                        setSelectedDoctor(null);
                        setSelectedDate(null);
                        setSelectedHour(null);
                      }}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                        selectedSpecialty === spec
                          ? 'border-[#01CCFF] bg-[#01CCFF] text-white'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-[#0091B5]'
                      }`}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex min-h-[200px] flex-col rounded-lg border border-gray-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">
                    Available doctors
                  </p>
                </div>
                <div className="mt-3 flex-1 space-y-2 overflow-y-auto pr-1">
                  {doctorsQuery.isLoading && (
                    <DataState
                      message="Loading doctors..."
                      accent="cyan"
                      compact
                    />
                  )}
                  {!doctorsQuery.isLoading &&
                    selectedSpecialty &&
                    availableDoctors.map((doctor) => (
                      <button
                        key={doctor.id}
                        onClick={() => {
                          setSelectedDoctor(doctor);
                          setSelectedDate(null);
                          setSelectedHour(null);
                        }}
                        className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                          selectedDoctor?.id === doctor.id
                            ? 'border-[#01CCFF] bg-[#01CCFF] text-white'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-[#0091B5]'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold">
                            {makeDoctorLabel(doctor)}
                          </span>
                          <span
                            className={`text-xs ${
                              selectedDoctor?.id === doctor.id
                                ? 'text-white/80'
                                : 'text-gray-500'
                            }`}
                          >
                            {doctor.currentStatus ?? 'Status unavailable'}
                          </span>
                          <span
                            className={`text-xs ${
                              selectedDoctor?.id === doctor.id
                                ? 'text-white/80'
                                : 'text-gray-500'
                            }`}
                          >
                            {typeof doctor.consultationFee === 'number'
                              ? `$${doctor.consultationFee.toFixed(2)} fee`
                              : 'Fee TBD'}
                          </span>
                        </div>
                      </button>
                    ))}
                  {selectedSpecialty &&
                    availableDoctors.length === 0 &&
                    !doctorsQuery.isLoading && (
                      <DataState
                        message="No doctors available for this specialty yet."
                        description="Add doctors in the admin view to enable bookings."
                        accent="rose"
                        compact
                      />
                    )}
                  {!selectedSpecialty && (
                    <p className="text-xs text-gray-500">
                      Select a specialty to see doctors
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DateTimePicker
            calendarYear={calendarYear}
            calendarMonth={calendarMonth}
            onMonthChange={setCalendarMonth}
            onYearChange={setCalendarYear}
            calendarCells={calendarCells}
            selectedDate={selectedDate}
            onSelectDate={(day) => {
              setSelectedDate(
                day ? new Date(calendarYear, calendarMonth, day) : null
              );
              setSelectedHour(null);
            }}
            takenSlots={selectedDoctor ? takenSlots : new Set<number>()}
            selectedHour={selectedHour}
            onSelectHour={(hour) => {
              setSelectedHour((prev) => (prev === hour ? null : hour));
            }}
            bookingReady={bookingReady}
            slotUnavailable={slotUnavailable}
            onConfirmRequest={handleConfirmRequest}
          />
        </div>
        {bookingFeedback && (
          <div className="mt-4">
            <BookingNotice
              type={bookingFeedback.type}
              message={bookingFeedback.message}
            />
          </div>
        )}
      </section>
      <ConfirmBookingModal
        open={confirmOpen}
        details={bookingDetails}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleBooking}
        isSubmitting={isBooking}
      />
    </div>
  );
};

const DateTimePicker: React.FC<{
  calendarYear: number;
  calendarMonth: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  calendarCells: (number | null)[];
  selectedDate: Date | null;
  onSelectDate: (day: number | null) => void;
  takenSlots: Set<number>;
  selectedHour: number | null;
  onSelectHour: (hour: number | null) => void;
  bookingReady: boolean;
  slotUnavailable: boolean;
  onConfirmRequest: () => void;
}> = ({
  calendarYear,
  calendarMonth,
  onMonthChange,
  onYearChange,
  calendarCells,
  selectedDate,
  onSelectDate,
  takenSlots,
  selectedHour,
  onSelectHour,
  bookingReady,
  slotUnavailable,
  onConfirmRequest,
}) => (
  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
    <div className="flex items-center justify-between">
      <p className="text-sm font-semibold text-gray-900">Date & Time</p>
      <Calendar className="h-4 w-4 text-gray-500" />
    </div>
    <div className="mt-3 flex items-center gap-2 text-sm">
      <button
        onClick={() => {
          if (calendarMonth === 0) {
            onYearChange(calendarYear - 1);
            onMonthChange(11);
          } else {
            onMonthChange(calendarMonth - 1);
          }
        }}
        className="rounded-lg border border-gray-200 px-2 py-1 text-xs"
      >
        Prev
      </button>
      <span className="flex-1 text-center font-semibold text-gray-800">
        {new Date(calendarYear, calendarMonth).toLocaleString('default', {
          month: 'long',
          year: 'numeric',
        })}
      </span>
      <button
        onClick={() => {
          if (calendarMonth === 11) {
            onYearChange(calendarYear + 1);
            onMonthChange(0);
          } else {
            onMonthChange(calendarMonth + 1);
          }
        }}
        className="rounded-lg border border-gray-200 px-2 py-1 text-xs"
      >
        Next
      </button>
    </div>

    <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-gray-500">
      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
        <div key={d}>{d}</div>
      ))}
      {calendarCells.map((day, idx) => {
        const isSelected = day && selectedDate?.getDate() === day;
        return (
          <button
            key={idx}
            disabled={!day}
            onClick={() => onSelectDate(day ?? null)}
            className={`h-9 w-full rounded-lg border text-sm ${
              !day
                ? 'border-transparent'
                : isSelected
                  ? 'border-[#01CCFF] bg-[#01CCFF] text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-[#0091B5]'
            }`}
          >
            {day ?? ''}
          </button>
        );
      })}
    </div>

    <div className="mt-3 space-y-2">
      <p className="text-xs font-semibold text-gray-500">Available slots</p>
      <div className="grid grid-cols-3 gap-2">
        {HOURS.map((hour) => {
          const label = `${hour}:00`;
          const taken = takenSlots.has(hour);
          const isSelected = selectedHour === hour;
          return (
            <button
              key={hour}
              disabled={taken}
              onClick={() => onSelectHour(hour)}
              className={`rounded-lg border px-2 py-2 text-xs font-semibold transition-colors ${
                taken
                  ? 'border-red-300 bg-red-100 text-red-700 disabled:cursor-not-allowed disabled:border-red-300 disabled:bg-red-100 disabled:text-red-700 disabled:opacity-100'
                  : isSelected
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-100'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>

    <button
      disabled={!bookingReady}
      onClick={onConfirmRequest}
      className={`mt-4 w-full rounded-lg px-4 py-2 text-sm font-semibold text-white ${
        bookingReady ? 'bg-[#01CCFF] hover:bg-[#0091B5]' : 'bg-gray-300'
      }`}
    >
      {slotUnavailable ? 'Doctor not available' : 'Confirm booking'}
    </button>
  </div>
);

const BookingNotice: React.FC<{
  type: 'success' | 'error';
  message: string;
}> = ({ type, message }) => (
  <div
    className={`rounded-lg border px-4 py-2 text-sm ${
      type === 'success'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : 'border-rose-200 bg-rose-50 text-rose-700'
    }`}
  >
    {message}
  </div>
);

type BookingDetails = {
  facilityName: string;
  specialty: string;
  doctorLabel: string;
  slotLabel: string;
};

const ConfirmBookingModal: React.FC<{
  open: boolean;
  details: BookingDetails | null;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}> = ({ open, details, onClose, onConfirm, isSubmitting }) => {
  if (!open || !details) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900">
          Confirm appointment
        </h3>
        <dl className="mt-4 space-y-2 text-sm text-gray-700">
          <div className="flex items-center justify-between">
            <dt className="text-gray-500">Facility</dt>
            <dd className="font-semibold text-gray-900">
              {details.facilityName}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-gray-500">Specialty</dt>
            <dd className="font-semibold text-gray-900">{details.specialty}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-gray-500">Doctor</dt>
            <dd className="font-semibold text-gray-900">
              {details.doctorLabel}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-gray-500">Time</dt>
            <dd className="font-semibold text-gray-900">{details.slotLabel}</dd>
          </div>
        </dl>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-[#0091B5]"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="rounded-lg bg-[#01CCFF] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0091B5] disabled:opacity-70"
          >
            {isSubmitting ? 'Booking...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserBookingPage;
