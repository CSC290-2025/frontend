import React, { useMemo, useState } from 'react';
import { Calendar, Stethoscope, Users } from 'lucide-react';
import {
  useAppointments,
  useFacilities,
} from '@/features/_healthcare/hooks/useHealthcareData';
import { DataState } from '@/features/_healthcare/components/common/DataState';

const specialties = ['General', 'Cardiology', 'Pediatrics', 'Emergency'];

const doctorsBySpecialty: Record<string, string[]> = {
  General: ['Dr. Avery', 'Dr. Kim'],
  Cardiology: ['Dr. Patel', 'Dr. Wong'],
  Pediatrics: ['Dr. Rivera', 'Dr. Quinn'],
  Emergency: ['Dr. Blake', 'Dr. Harper'],
};

const hours = Array.from({ length: 13 }, (_, i) => 7 + i); // 7am-7pm (7..19)

const isSameUtcDay = (a: Date, b: Date) =>
  a.getUTCFullYear() === b.getUTCFullYear() &&
  a.getUTCMonth() === b.getUTCMonth() &&
  a.getUTCDate() === b.getUTCDate();

const UserBookingPage: React.FC = () => {
  const facilitiesQuery = useFacilities({ limit: 50, sortBy: 'name' });
  const [facilitySearch, setFacilitySearch] = useState('');
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(
    null
  );
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(
    null
  );
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);

  const today = new Date();
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth()); // 0-index
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);

  const filteredFacilities =
    facilitiesQuery.data?.facilities.filter((f) =>
      f.name.toLowerCase().includes(facilitySearch.toLowerCase())
    ) ?? [];

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
  });

  const takenSlots = useMemo(() => {
    if (!selectedDate) return new Set<number>();
    const set = new Set<number>();
    const selectedUtc = new Date(
      Date.UTC(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
      )
    );

    (appointmentsQuery.data?.appointments ?? []).forEach((appt) => {
      if (!appt.appointmentAt) return;
      const apptDate = new Date(appt.appointmentAt);
      if (
        !isNaN(apptDate.getTime()) &&
        isSameUtcDay(apptDate, selectedUtc) &&
        (selectedFacilityId === null ||
          appt.facilityId === null ||
          appt.facilityId === selectedFacilityId)
      ) {
        set.add(apptDate.getUTCHours());
      }
    });
    return set;
  }, [appointmentsQuery.data, selectedDate, selectedFacilityId]);

  const bookingReady =
    selectedFacilityId &&
    selectedSpecialty &&
    selectedDoctor &&
    selectedDate &&
    selectedHour !== null;

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
                    onClick={() => setSelectedFacilityId(facility.id)}
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
                  {specialties.map((spec) => (
                    <button
                      key={spec}
                      onClick={() => {
                        setSelectedSpecialty(spec);
                        setSelectedDoctor(null);
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
                  {(selectedSpecialty
                    ? doctorsBySpecialty[selectedSpecialty]
                    : []
                  ).map((doc) => (
                    <button
                      key={doc}
                      onClick={() => setSelectedDoctor(doc)}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                        selectedDoctor === doc
                          ? 'border-[#01CCFF] bg-[#01CCFF] text-white'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-[#0091B5]'
                      }`}
                    >
                      {doc}
                    </button>
                  ))}
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
            takenSlots={takenSlots}
            selectedHour={selectedHour}
            onSelectHour={setSelectedHour}
            bookingReady={bookingReady}
          />
        </div>
      </section>
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
  takenSlots: Set<string>;
  selectedHour: number | null;
  onSelectHour: (hour: number | null) => void;
  bookingReady: boolean;
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
        {hours.map((hour) => {
          const label = `${hour}:00`;
          const taken = takenSlots.has(hour);
          const isSelected = selectedHour === hour;
          return (
            <button
              key={hour}
              disabled={taken}
              onClick={() => onSelectHour(hour)}
              className={`rounded-lg border px-2 py-2 text-xs ${
                taken
                  ? 'pointer-events-none border-red-300 bg-red-100 text-red-700'
                  : isSelected
                    ? 'border-[#01CCFF] bg-[#01CCFF] text-white'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-[#0091B5]'
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
      className={`mt-4 w-full rounded-lg px-4 py-2 text-sm font-semibold text-white ${
        bookingReady ? 'bg-[#01CCFF] hover:bg-[#0091B5]' : 'bg-gray-300'
      }`}
    >
      Confirm booking
    </button>
  </div>
);

export default UserBookingPage;
