import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  Hospital,
  MapPin,
  PlusCircle,
  Stethoscope,
  ClipboardEdit,
} from 'lucide-react';
import {
  useDoctors,
  useFacilities,
} from '@/features/_healthcare/hooks/useHealthcareData';
import type { Doctor, Facility } from '@/features/_healthcare/types';
import {
  createFacility,
  updateFacility,
  createDoctor,
  updateDoctor,
} from '@/features/_healthcare/api/healthcare.api';
import { SummaryCard } from '@/features/_healthcare/components/cards/SummaryCard';
import { DataState } from '@/features/_healthcare/components/common/DataState';

type FacilitiesCache = {
  facilities: Facility[];
  total?: number;
  page?: number;
  totalPages?: number;
};

type AddressFields = {
  addressLine: string;
  province: string;
  district: string;
  subdistrict: string;
  postalCode: string;
};

const emptyAddress: AddressFields = {
  addressLine: '',
  province: '',
  district: '',
  subdistrict: '',
  postalCode: '',
};

const AdminDashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const facilitiesQuery = useFacilities({ limit: 50, sortBy: 'name' });
  const doctorsQuery = useDoctors({ limit: 50, sortBy: 'createdAt' });

  const [selectedHospitalId, setSelectedHospitalId] = useState<number | null>(
    null
  );

  const [hospitalForm, setHospitalForm] = useState({
    name: '',
    phone: '',
    emergencyServices: false,
    address: emptyAddress,
  });
  const [editingHospitalId, setEditingHospitalId] = useState<number | null>(
    null
  );

  const [doctorForm, setDoctorForm] = useState({
    specialization: '',
    currentStatus: 'available',
    consultationFee: '',
    hospitalId: '' as number | '' | null,
  });
  const [editingDoctorId, setEditingDoctorId] = useState<number | null>(null);

  const createFacilityMutation = useMutation({
    mutationFn: createFacility,
    onSuccess: (facility) => {
      queryClient.setQueriesData(
        { queryKey: ['facilities'], exact: false },
        (existing: FacilitiesCache | undefined) => {
          if (!existing) return existing;
          const facilities = existing.facilities ?? [];
          const total = existing.total ?? facilities.length;
          return {
            ...existing,
            facilities: [facility, ...facilities],
            total: total + 1,
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      setSelectedHospitalId(facility.id);
      setHospitalForm({
        name: '',
        phone: '',
        emergencyServices: false,
        address: emptyAddress,
      });
      setEditingHospitalId(null);
    },
  });

  const updateFacilityMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Parameters<typeof updateFacility>[1];
    }) => updateFacility(id, payload),
    onSuccess: (facility) => {
      queryClient.setQueriesData(
        { queryKey: ['facilities'], exact: false },
        (existing: FacilitiesCache | undefined) => {
          if (!existing) return existing;
          const facilities = existing.facilities ?? [];
          return {
            ...existing,
            facilities: facilities.map((f: Facility) =>
              f.id === facility.id ? facility : f
            ),
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      setSelectedHospitalId(facility.id);
      setHospitalForm({
        name: '',
        phone: '',
        emergencyServices: false,
        address: emptyAddress,
      });
      setEditingHospitalId(null);
    },
  });

  const createDoctorMutation = useMutation({
    mutationFn: createDoctor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      setEditingDoctorId(null);
      setDoctorForm({
        specialization: '',
        currentStatus: 'available',
        consultationFee: '',
        hospitalId: selectedHospitalId ?? '',
      });
    },
  });

  const updateDoctorMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Parameters<typeof updateDoctor>[1];
    }) => updateDoctor(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      setEditingDoctorId(null);
      setDoctorForm({
        specialization: '',
        currentStatus: 'available',
        consultationFee: '',
        hospitalId: selectedHospitalId ?? '',
      });
    },
  });

  useEffect(() => {
    if (
      !selectedHospitalId &&
      facilitiesQuery.data?.facilities &&
      facilitiesQuery.data.facilities.length > 0
    ) {
      setSelectedHospitalId(facilitiesQuery.data.facilities[0].id);
    }
  }, [facilitiesQuery.data, selectedHospitalId]);

  const facilities = useMemo(
    () => facilitiesQuery.data?.facilities ?? [],
    [facilitiesQuery.data?.facilities]
  );
  const doctors = useMemo(
    () => doctorsQuery.data?.doctors ?? [],
    [doctorsQuery.data?.doctors]
  );

  const selectedHospital = facilities.find(
    (hospital) => hospital.id === selectedHospitalId
  );
  const filteredDoctors = useMemo(
    () =>
      doctors.filter((doc) =>
        selectedHospitalId ? doc.facilityId === selectedHospitalId : true
      ),
    [doctors, selectedHospitalId]
  );
  const derivedDepartments = useMemo(() => {
    const names = new Set<string>();
    filteredDoctors.forEach((doc) => {
      if (doc.specialization) {
        names.add(doc.specialization);
      }
    });
    return Array.from(names);
  }, [filteredDoctors]);

  useEffect(() => {
    setDoctorForm((prev) => ({
      ...prev,
      hospitalId: selectedHospitalId ?? '',
    }));
  }, [selectedHospitalId, facilities]);

  const handleHospitalSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const hasAddress =
      hospitalForm.address.addressLine &&
      hospitalForm.address.province &&
      hospitalForm.address.district &&
      hospitalForm.address.subdistrict &&
      hospitalForm.address.postalCode;

    const payload = {
      name: hospitalForm.name,
      facilityType: 'Hospital',
      phone: hospitalForm.phone || undefined,
      emergencyServices: hospitalForm.emergencyServices,
      address: hasAddress
        ? {
            address_line: hospitalForm.address.addressLine,
            province: hospitalForm.address.province,
            district: hospitalForm.address.district,
            subdistrict: hospitalForm.address.subdistrict,
            postal_code: hospitalForm.address.postalCode,
          }
        : undefined,
    };

    if (editingHospitalId) {
      updateFacilityMutation.mutate({ id: editingHospitalId, payload });
    } else {
      createFacilityMutation.mutate(payload);
    }
  };

  const handleDoctorSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (doctorForm.hospitalId === '') {
      return;
    }

    const payload = {
      specialization: doctorForm.specialization || undefined,
      currentStatus: doctorForm.currentStatus || undefined,
      consultationFee:
        doctorForm.consultationFee === ''
          ? undefined
          : Number(doctorForm.consultationFee),
      facilityId:
        doctorForm.hospitalId === ''
          ? undefined
          : Number(doctorForm.hospitalId),
    };

    if (editingDoctorId) {
      updateDoctorMutation.mutate({ id: editingDoctorId, payload });
    } else {
      createDoctorMutation.mutate(payload);
    }
  };

  const startEditHospital = (record: Facility) => {
    setEditingHospitalId(record.id);
    setHospitalForm({
      name: record.name ?? '',
      phone: record.phone ?? '',
      emergencyServices: Boolean(record.emergencyServices),
      address: {
        addressLine: record.address?.address_line ?? '',
        province: record.address?.province ?? '',
        district: record.address?.district ?? '',
        subdistrict: record.address?.subdistrict ?? '',
        postalCode: record.address?.postal_code ?? '',
      },
    });
    setSelectedHospitalId(record.id);
  };

  const startEditDoctor = (record: Doctor) => {
    setEditingDoctorId(record.id);
    setDoctorForm({
      specialization: record.specialization ?? '',
      currentStatus: record.currentStatus ?? 'available',
      consultationFee: record.consultationFee?.toString() ?? '',
      hospitalId: record.facilityId ?? '',
    });
    setSelectedHospitalId(record.facilityId ?? null);
  };

  const hospitalCount = facilitiesQuery.data?.total ?? facilities.length;
  const departmentCount = derivedDepartments.length;
  const doctorCount = doctorsQuery.data?.total ?? doctors.length;

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          label="Hospitals"
          value={hospitalCount}
          subtext="Active facilities"
          icon={Hospital}
          accent="emerald"
        />
        <SummaryCard
          label="Departments"
          value={departmentCount}
          subtext="Specialities inside hospitals"
          icon={Building2}
          accent="cyan"
        />
        <SummaryCard
          label="Doctors"
          value={doctorCount}
          subtext="Linked to hospitals"
          icon={Stethoscope}
          accent="amber"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <Header
            title={editingHospitalId ? 'Edit hospital' : 'Create hospital'}
            description="Add name, contact, and structured address."
            icon={Hospital}
          />
          <form className="mt-4 space-y-3" onSubmit={handleHospitalSubmit}>
            <TextField
              label="Hospital name"
              value={hospitalForm.name}
              onChange={(value) =>
                setHospitalForm((prev) => ({ ...prev, name: value }))
              }
              required
            />
            <TextField
              label="Phone"
              value={hospitalForm.phone}
              onChange={(value) =>
                setHospitalForm((prev) => ({ ...prev, phone: value }))
              }
            />
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={hospitalForm.emergencyServices}
                onChange={(event) =>
                  setHospitalForm((prev) => ({
                    ...prev,
                    emergencyServices: event.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-gray-300 text-cyan-600"
              />
              Offers emergency services
            </label>
            <div className="grid gap-3 rounded-xl border border-dashed border-gray-200 p-3">
              <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Address format
              </span>
              <TextField
                label="Address line"
                value={hospitalForm.address.addressLine}
                onChange={(value) =>
                  setHospitalForm((prev) => ({
                    ...prev,
                    address: { ...prev.address, addressLine: value },
                  }))
                }
                required
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField
                  label="Province"
                  value={hospitalForm.address.province}
                  onChange={(value) =>
                    setHospitalForm((prev) => ({
                      ...prev,
                      address: { ...prev.address, province: value },
                    }))
                  }
                  required
                />
                <TextField
                  label="District"
                  value={hospitalForm.address.district}
                  onChange={(value) =>
                    setHospitalForm((prev) => ({
                      ...prev,
                      address: { ...prev.address, district: value },
                    }))
                  }
                  required
                />
                <TextField
                  label="Subdistrict"
                  value={hospitalForm.address.subdistrict}
                  onChange={(value) =>
                    setHospitalForm((prev) => ({
                      ...prev,
                      address: { ...prev.address, subdistrict: value },
                    }))
                  }
                />
                <TextField
                  label="Postal code"
                  value={hospitalForm.address.postalCode}
                  onChange={(value) =>
                    setHospitalForm((prev) => ({
                      ...prev,
                      address: { ...prev.address, postalCode: value },
                    }))
                  }
                  required
                />
              </div>
            </div>
            <ActionButton
              label={editingHospitalId ? 'Save hospital' : 'Add hospital'}
            />
          </form>
        </Card>

        <Card>
          <Header
            title={editingDoctorId ? 'Edit doctor' : 'Add doctor'}
            description="Assign doctor to hospital and department."
            icon={Stethoscope}
          />
          <form className="mt-4 space-y-3" onSubmit={handleDoctorSubmit}>
            <TextField
              label="Specialization"
              value={doctorForm.specialization}
              onChange={(value) =>
                setDoctorForm((prev) => ({
                  ...prev,
                  specialization: value,
                }))
              }
              required
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <SelectField
                label="Hospital"
                value={doctorForm.hospitalId}
                onChange={(value) =>
                  setDoctorForm((prev) => ({
                    ...prev,
                    hospitalId: value,
                  }))
                }
                options={facilities.map((hospital) => ({
                  value: hospital.id,
                  label: hospital.name,
                }))}
                placeholder="Choose hospital"
                required
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="Status"
                value={doctorForm.currentStatus}
                onChange={(value) =>
                  setDoctorForm((prev) => ({
                    ...prev,
                    currentStatus: value,
                  }))
                }
              />
              <TextField
                label="Consultation fee"
                value={doctorForm.consultationFee}
                onChange={(value) =>
                  setDoctorForm((prev) => ({
                    ...prev,
                    consultationFee: value,
                  }))
                }
                type="number"
              />
            </div>
            <ActionButton
              label={editingDoctorId ? 'Save doctor' : 'Add doctor'}
            />
          </form>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <Header
            title="Hospitals"
            description="Select to view departments and doctors."
            icon={MapPin}
          />
          <div className="mt-3 max-h-80 space-y-3 overflow-y-auto pr-1">
            {facilitiesQuery.isLoading && (
              <DataState message="Loading hospitals..." accent="cyan" compact />
            )}
            {!facilitiesQuery.isLoading && facilities.length === 0 && (
              <DataState
                message="No hospitals yet"
                description="Add a hospital to get started."
                accent="gray"
                compact
              />
            )}
            {facilities.map((hospital) => (
              <div
                key={hospital.id}
                className={`rounded-xl border p-3 ${
                  hospital.id === selectedHospitalId
                    ? 'border-cyan-400 bg-cyan-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {hospital.name}
                    </p>
                    <p className="text-xs break-words text-gray-500">
                      {summarizeAddress(mapFacilityAddress(hospital))}
                    </p>
                    <p className="text-xs text-gray-500">
                      Emergency: {hospital.emergencyServices ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1 sm:flex-row sm:items-center">
                    <button
                      onClick={() => setSelectedHospitalId(hospital.id)}
                      className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-200"
                    >
                      View
                    </button>
                    <button
                      onClick={() => startEditHospital(hospital)}
                      className="rounded-lg bg-cyan-100 px-2 py-1 text-xs font-semibold text-cyan-700 hover:bg-cyan-200"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-1">
          <Header
            title="Departments"
            description="Derived from doctors' specializations"
            icon={Building2}
          />
          <div className="mt-3 max-h-80 space-y-3 overflow-y-auto pr-1">
            {selectedHospital && derivedDepartments.length === 0 && (
              <DataState
                message="No departments yet"
                description="Add doctors with specializations."
                accent="gray"
                compact
              />
            )}
            {derivedDepartments.map((name) => (
              <div
                key={name}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">{name}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-1">
          <Header
            title="Doctors"
            description="Scoped to the selected hospital"
            icon={Stethoscope}
          />
          <div className="mt-3 max-h-80 space-y-3 overflow-y-auto pr-1">
            {selectedHospital && filteredDoctors.length === 0 && (
              <DataState
                message="No doctors added"
                description="Add a doctor to this hospital."
                accent="gray"
                compact
              />
            )}
            {filteredDoctors.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {doc.specialization || 'Specialization TBD'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Fee:{' '}
                    {doc.consultationFee
                      ? `$${doc.consultationFee}`
                      : 'Not set'}
                  </p>
                </div>
                <button
                  onClick={() => startEditDoctor(doc)}
                  className="inline-flex items-center gap-1 rounded-lg bg-cyan-100 px-2 py-1 text-xs font-semibold text-cyan-700 hover:bg-cyan-200"
                >
                  <ClipboardEdit className="h-4 w-4" />
                  Edit
                </button>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
};

const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div
    className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm ${className ?? ''}`}
  >
    {children}
  </div>
);

const Header: React.FC<{
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = ({ title, description, icon: Icon }) => (
  <div className="flex items-start gap-2">
    <div className="rounded-lg bg-cyan-50 p-2 text-cyan-600">
      <Icon className="h-4 w-4" />
    </div>
    <div>
      <p className="text-sm font-bold text-gray-900">{title}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  </div>
);

const TextField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}> = ({ label, value, onChange, type = 'text', required }) => (
  <label className="block space-y-1 text-sm font-semibold text-gray-700">
    {label}
    <input
      required={required}
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
    />
  </label>
);

const SelectField: React.FC<{
  label: string;
  value: number | '' | null;
  onChange: (value: number | '' | null) => void;
  options: Array<{ value: number; label: string }>;
  placeholder?: string;
  required?: boolean;
}> = ({ label, value, onChange, options, placeholder, required }) => (
  <label className="block space-y-1 text-sm font-semibold text-gray-700">
    {label}
    <select
      required={required}
      value={value === null ? '' : value}
      onChange={(event) =>
        onChange(event.target.value === '' ? '' : Number(event.target.value))
      }
      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
    >
      <option value="">{placeholder ?? 'Select'}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

const ActionButton: React.FC<{ label: string }> = ({ label }) => (
  <button
    type="submit"
    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0091B5] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#007fa0]"
  >
    <PlusCircle className="h-4 w-4" />
    {label}
  </button>
);

const mapFacilityAddress = (facility: Facility): AddressFields => ({
  addressLine: facility.address?.address_line ?? '',
  province: facility.address?.province ?? '',
  district: facility.address?.district ?? '',
  subdistrict: facility.address?.subdistrict ?? '',
  postalCode: facility.address?.postal_code ?? '',
});

const summarizeAddress = (address: AddressFields) => {
  const { addressLine, province, district, subdistrict, postalCode } = address;
  return [addressLine, subdistrict, district, province, postalCode]
    .filter(Boolean)
    .join(', ');
};

export default AdminDashboardPage;
