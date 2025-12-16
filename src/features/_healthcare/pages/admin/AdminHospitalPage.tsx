import React, { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Hospital,
  Zap,
  Activity,
  Users,
  Building2,
  PlusCircle,
  Edit,
  Trash2,
} from 'lucide-react';
import {
  useAppointments,
  useBeds,
  useFacilities,
  usePatients,
} from '@/features/_healthcare/hooks/useHealthcareData';
import {
  createBed,
  updateBed,
  deleteBed,
} from '@/features/_healthcare/api/healthcare.api';
import { SummaryCard } from '@/features/_healthcare/components/cards/SummaryCard';
import { BedWardCard } from '@/features/_healthcare/components/cards/BedWardCard';
import { AppointmentCard } from '@/features/_healthcare/components/cards/AppointmentCard';
import { PatientCard } from '@/features/_healthcare/components/cards/PatientCard';
import { DataState } from '@/features/_healthcare/components/common/DataState';
import { categorizeBeds, summarizeBeds } from '@/features/_healthcare/utils';
import type { Facility, BedPayload, Bed } from '@/features/_healthcare/types';

const emptyBedForm = {
  facilityId: '' as number | '' | null,
  bedNumber: '',
  bedType: '',
  status: 'Available',
  patientId: '' as number | '' | null,
};

const AdminHospitalPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | 'all'>(
    'all'
  );
  const [bedForm, setBedForm] = useState<typeof emptyBedForm>(emptyBedForm);
  const [editingBedId, setEditingBedId] = useState<number | null>(null);

  const bedsQuery = useBeds({ limit: 50, sortBy: 'createdAt' });
  const facilitiesQuery = useFacilities({ limit: 30, sortBy: 'name' });
  const appointmentsQuery = useAppointments({
    limit: 10,
    sortBy: 'appointmentAt',
    sortOrder: 'asc',
  });
  const patientsQuery = usePatients({ limit: 20, sortBy: 'createdAt' });

  const facilityLookup = useMemo(() => {
    const lookup = new Map<number, Facility>();
    facilitiesQuery.data?.facilities.forEach((facility) =>
      lookup.set(facility.id, facility)
    );
    return lookup;
  }, [facilitiesQuery.data]);

  const selectedFacility =
    selectedFacilityId === 'all'
      ? null
      : facilityLookup.get(selectedFacilityId);

  const filteredBeds = useMemo(() => {
    const beds = bedsQuery.data?.beds ?? [];
    if (!selectedFacility?.id) return beds;
    return beds.filter((bed) => bed.facilityId === selectedFacility.id);
  }, [bedsQuery.data, selectedFacility]);

  const bedBuckets = useMemo(
    () => categorizeBeds(filteredBeds),
    [filteredBeds]
  );

  const bedStats = useMemo(() => summarizeBeds(filteredBeds), [filteredBeds]);

  const resetForm = () => {
    setBedForm(emptyBedForm);
    setEditingBedId(null);
  };

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beds'] });
      resetForm();
    },
  };

  const createMutation = useMutation({
    mutationFn: createBed,
    ...mutationOptions,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: BedPayload }) =>
      updateBed(id, payload),
    ...mutationOptions,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteBed(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['beds'] }),
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      facilityId:
        bedForm.facilityId === '' ? undefined : Number(bedForm.facilityId),
      bedNumber: bedForm.bedNumber || undefined,
      bedType: bedForm.bedType || undefined,
      status: bedForm.status || undefined,
      patientId:
        bedForm.patientId === '' ? undefined : Number(bedForm.patientId),
    };

    if (editingBedId) {
      updateMutation.mutate({ id: editingBedId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const startEdit = (bed: Bed) => {
    setEditingBedId(bed.id);
    setBedForm({
      facilityId: bed.facilityId ?? '',
      bedNumber: bed.bedNumber ?? '',
      bedType: bed.bedType ?? '',
      status: bed.status ?? 'Available',
      patientId: bed.patientId ?? '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <button className="flex min-w-[220px] flex-1 items-center gap-3 rounded-2xl border border-gray-200 bg-white px-6 py-3">
          <Hospital className="h-5 w-5" />
          <div>
            <p className="text-sm font-semibold text-gray-900">Hospital</p>
            <p className="text-xs text-gray-500">
              Hospital & Emergency services
            </p>
          </div>
        </button>
        <button className="flex min-w-[220px] flex-1 items-center gap-3 rounded-2xl border border-gray-200 bg-white px-6 py-3">
          <Zap className="h-5 w-5" />
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Emergency services
            </p>
            <p className="text-xs text-gray-500">Immediate care coordination</p>
          </div>
        </button>
      </div>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Beds tracked"
          value={bedStats.total}
          subtext={`${bedStats.available} ready • ${bedStats.occupied} occupied`}
          icon={Activity}
          accent="emerald"
        />
        <SummaryCard
          label="Patients onboarded"
          value={patientsQuery.data?.total ?? 0}
          subtext="active admissions"
          icon={Users}
          accent="rose"
        />
        <SummaryCard
          label="Network facilities"
          value={facilitiesQuery.data?.total ?? 0}
          subtext="linked to hospital system"
          icon={Building2}
        />
        <SummaryCard
          label="Scheduled visits"
          value={appointmentsQuery.data?.total ?? 0}
          subtext="in queue"
          icon={Activity}
          accent="amber"
        />
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Facility Overview
            </h2>
            <p className="text-sm text-gray-600">
              Filter bed telemetry by facility
            </p>
          </div>
          <select
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 focus:outline-none"
            value={selectedFacilityId}
            onChange={(event) =>
              setSelectedFacilityId(
                event.target.value === 'all'
                  ? 'all'
                  : Number(event.target.value)
              )
            }
          >
            <option value="all">All facilities</option>
            {facilitiesQuery.data?.facilities.map((facility) => (
              <option key={facility.id} value={facility.id}>
                {facility.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <BedWardCard
            title="ICU"
            beds={bedBuckets.icu}
            isLoading={bedsQuery.isLoading}
          />
          <BedWardCard
            title="General Ward"
            beds={bedBuckets.general}
            isLoading={bedsQuery.isLoading}
          />
          <BedWardCard
            title="Emergency"
            beds={bedBuckets.emergency}
            isLoading={bedsQuery.isLoading}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">Manage Beds</h2>
            <p className="text-sm text-gray-600">
              Add, edit, or remove beds and assign patients manually.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-4 grid gap-3 sm:grid-cols-2"
            >
              <label className="text-sm text-gray-700">
                Bed name/number
                <input
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  value={bedForm.bedNumber}
                  onChange={(e) =>
                    setBedForm((prev) => ({
                      ...prev,
                      bedNumber: e.target.value,
                    }))
                  }
                  placeholder="ICU-101"
                  required
                />
              </label>
              <label className="text-sm text-gray-700">
                Facility ID
                <input
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  value={bedForm.facilityId ?? ''}
                  onChange={(e) =>
                    setBedForm((prev) => ({
                      ...prev,
                      facilityId: e.target.value ? Number(e.target.value) : '',
                    }))
                  }
                  placeholder="e.g. 1001"
                  required
                />
              </label>
              <label className="text-sm text-gray-700">
                Bed type
                <input
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  value={bedForm.bedType}
                  onChange={(e) =>
                    setBedForm((prev) => ({ ...prev, bedType: e.target.value }))
                  }
                  placeholder="ICU, General, Emergency"
                />
              </label>
              <label className="text-sm text-gray-700">
                Assigned patient (ID)
                <input
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  value={bedForm.patientId ?? ''}
                  onChange={(e) =>
                    setBedForm((prev) => ({
                      ...prev,
                      patientId: e.target.value ? Number(e.target.value) : '',
                    }))
                  }
                  placeholder="Optional"
                />
              </label>
              <label className="text-sm text-gray-700">
                Status
                <select
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  value={bedForm.status}
                  onChange={(e) =>
                    setBedForm((prev) => ({ ...prev, status: e.target.value }))
                  }
                >
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Maintenance">Under maintenance</option>
                </select>
              </label>

              <div className="flex items-center gap-3 pt-2 sm:col-span-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700"
                >
                  <PlusCircle className="h-4 w-4" />
                  {editingBedId ? 'Update bed' : 'Add bed'}
                </button>
                {editingBedId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-sm font-semibold text-gray-600 underline"
                  >
                    Cancel edit
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="w-full lg:w-1/2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Bed list</h3>
              <span className="text-xs text-gray-500">
                {bedsQuery.data?.beds.length ?? 0} items
              </span>
            </div>

            {bedsQuery.isLoading && (
              <DataState message="Loading beds..." accent="cyan" />
            )}
            {!bedsQuery.isLoading &&
              (bedsQuery.data?.beds.length ?? 0) === 0 && (
                <DataState message="No beds found" />
              )}

            <div className="mt-3 max-h-[360px] space-y-3 overflow-y-auto pr-1">
              {(bedsQuery.data?.beds ?? []).map((bed) => (
                <div
                  key={bed.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {bed.bedNumber ?? 'Unnamed'}{' '}
                      <span className="text-xs text-gray-500">#{bed.id}</span>
                    </p>
                    <p className="text-xs text-gray-600">
                      Facility #{bed.facilityId ?? '—'} • Patient #
                      {bed.patientId ?? '—'}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Type: {bed.bedType ?? '—'} • Status: {bed.status ?? '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="rounded-full p-2 text-gray-500 hover:bg-white"
                      onClick={() => startEdit(bed)}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      className="rounded-full p-2 text-red-500 hover:bg-white"
                      onClick={() => deleteMutation.mutate(bed.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-bold text-gray-900">Active Patients</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {patientsQuery.isLoading && (
            <DataState message="Loading patients..." accent="cyan" />
          )}
          {!patientsQuery.isLoading &&
            (patientsQuery.data?.patients.length ?? 0) === 0 && (
              <DataState message="No patients found" />
            )}
          {patientsQuery.data?.patients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-bold text-gray-900">
          Upcoming Appointments
        </h2>
        <div className="mt-4 space-y-3">
          {appointmentsQuery.isLoading && (
            <DataState message="Loading appointments..." accent="cyan" />
          )}
          {!appointmentsQuery.isLoading &&
            (appointmentsQuery.data?.appointments.length ?? 0) === 0 && (
              <DataState message="No appointments scheduled" />
            )}
          {appointmentsQuery.data?.appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              facilityLookup={facilityLookup}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminHospitalPage;
