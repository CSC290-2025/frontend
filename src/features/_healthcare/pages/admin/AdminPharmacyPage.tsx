import React, { useMemo, useState } from 'react';
import { Pill, PlusCircle, Trash2, Edit } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  useMedicineInventory,
  usePatients,
  usePrescriptions,
} from '@/features/_healthcare/hooks/useHealthcareData';
import type { MedicineInventory, Patient } from '@/features/_healthcare/types';
import {
  createMedicine,
  deleteMedicine,
  updateMedicine,
} from '@/features/_healthcare/api/healthcare.api';
import { DataState } from '@/features/_healthcare/components/common/DataState';
import { StatusPill } from '@/features/_healthcare/components/common/StatusPill';
import { formatAppointmentTime } from '@/features/_healthcare/utils';

const emptyForm: Partial<MedicineInventory> = {
  facilityId: null,
  medicineName: '',
  stockQuantity: 0,
  unitPrice: 0,
  isInStock: true,
};

const AdminPharmacyPage: React.FC = () => {
  const queryClient = useQueryClient();
  const inventoryQuery = useMedicineInventory({ limit: 50, sortOrder: 'desc' });
  const prescriptionsQuery = usePrescriptions({ limit: 50, sortOrder: 'desc' });
  const patientsQuery = usePatients({ limit: 50 });

  const [formState, setFormState] =
    useState<Partial<MedicineInventory>>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const patientLookup = useMemo(() => {
    const map = new Map<number, Patient>();
    patientsQuery.data?.patients.forEach((patient) =>
      map.set(patient.id, patient)
    );
    return map;
  }, [patientsQuery.data]);

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicineInventory'] });
      setFormState(emptyForm);
      setEditingId(null);
    },
  };

  const createMutation = useMutation({
    mutationFn: createMedicine,
    ...mutationOptions,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<MedicineInventory>;
    }) => updateMedicine(id, payload),
    ...mutationOptions,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteMedicine(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['medicineInventory'] }),
  });

  const prescriptions = prescriptionsQuery.data?.prescriptions ?? [];
  const inventory = inventoryQuery.data?.medicineInventory ?? [];

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      facilityId: formState.facilityId ?? undefined,
      medicineName: formState.medicineName ?? undefined,
      stockQuantity: formState.stockQuantity ?? undefined,
      unitPrice: formState.unitPrice ?? undefined,
      isInStock: formState.isInStock ?? undefined,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const startEdit = (item: MedicineInventory) => {
    setEditingId(item.id);
    setFormState({
      facilityId: item.facilityId,
      medicineName: item.medicineName ?? '',
      stockQuantity: item.stockQuantity ?? 0,
      unitPrice: item.unitPrice ?? 0,
      isInStock: item.isInStock ?? true,
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">
              Medicine Inventory
            </h2>
            <p className="text-sm text-gray-600">
              Track stock and availability for pharmacy items.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-4 grid gap-3 sm:grid-cols-2"
            >
              <label className="text-sm text-gray-700">
                Medicine name
                <input
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  value={formState.medicineName ?? ''}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      medicineName: e.target.value,
                    }))
                  }
                  placeholder="Amoxicillin 500mg"
                  required
                />
              </label>
              <label className="text-sm text-gray-700">
                Facility ID
                <input
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  value={formState.facilityId ?? ''}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      facilityId: e.target.value
                        ? Number(e.target.value)
                        : null,
                    }))
                  }
                  placeholder="e.g. 1001"
                />
              </label>
              <label className="text-sm text-gray-700">
                Stock quantity
                <input
                  type="number"
                  min={0}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  value={formState.stockQuantity ?? 0}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      stockQuantity: Number(e.target.value),
                    }))
                  }
                  required
                />
              </label>
              <label className="text-sm text-gray-700">
                Unit price
                <input
                  type="number"
                  min={0}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  value={formState.unitPrice ?? 0}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      unitPrice: Number(e.target.value),
                    }))
                  }
                  step="0.01"
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={Boolean(formState.isInStock)}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      isInStock: e.target.checked,
                    }))
                  }
                  className="h-4 w-4"
                />
                In stock
              </label>

              <div className="flex items-center gap-3 pt-2 sm:col-span-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700"
                >
                  <PlusCircle className="h-4 w-4" />
                  {editingId ? 'Update medicine' : 'Add medicine'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setFormState(emptyForm);
                    }}
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
              <h3 className="text-sm font-semibold text-gray-900">
                Inventory list
              </h3>
              <span className="text-xs text-gray-500">
                {inventory.length} items
              </span>
            </div>

            {inventoryQuery.isLoading && (
              <DataState message="Loading inventory..." accent="cyan" />
            )}
            {!inventoryQuery.isLoading && inventory.length === 0 && (
              <DataState message="No medicine items found" />
            )}

            <div className="mt-3 max-h-[360px] space-y-3 overflow-y-auto pr-1">
              {inventory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {item.medicineName ?? 'Unnamed'}{' '}
                      <span className="text-xs text-gray-500">#{item.id}</span>
                    </p>
                    <p className="text-xs text-gray-600">
                      Stock: {item.stockQuantity ?? 0} • Price:{' '}
                      {item.unitPrice ?? 0}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Facility #{item.facilityId ?? '—'} •{' '}
                      {item.isInStock ? 'In stock' : 'Out of stock'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="rounded-full p-2 text-gray-500 hover:bg-white"
                      onClick={() => startEdit(item)}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      className="rounded-full p-2 text-red-500 hover:bg-white"
                      onClick={() => deleteMutation.mutate(item.id)}
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Medication Orders
            </h2>
            <p className="text-sm text-gray-600">
              Historical prescriptions with payment status
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
            <Pill className="h-4 w-4" />
            {prescriptions.length} orders
          </div>
        </div>

        <div className="mt-4">
          {prescriptionsQuery.isLoading && (
            <DataState message="Loading medication orders..." accent="cyan" />
          )}
          {!prescriptionsQuery.isLoading && prescriptions.length === 0 && (
            <DataState message="No medication orders recorded" />
          )}

          <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
            {prescriptions.map((prescription) => {
              const patient = patientLookup.get(prescription.patientId ?? 0);
              return (
                <div
                  key={prescription.id}
                  className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-900">
                      Order #{prescription.id}{' '}
                      <span className="text-xs text-gray-500">
                        • Patient #{prescription.patientId ?? '—'}
                      </span>
                    </p>
                    <p className="text-xs text-gray-600">
                      {patient?.emergencyContact
                        ? patient.emergencyContact
                        : `Patient ${prescription.patientId ?? '—'}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatAppointmentTime(prescription.createdAt)}
                    </p>
                    {Array.isArray(prescription.medicinesList) && (
                      <p className="text-[11px] text-gray-600">
                        {prescription.medicinesList
                          .map((item) => {
                            if (
                              typeof item === 'object' &&
                              item !== null &&
                              'name' in item &&
                              'quantity' in item
                            ) {
                              return `${(item as { name: string }).name} x${
                                (item as { quantity: number }).quantity
                              }`;
                            }
                            return null;
                          })
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-xs text-gray-600">
                      <p className="font-semibold text-gray-800">
                        Payment status
                      </p>
                      <p>{prescription.status ?? 'Pending'}</p>
                    </div>
                    <StatusPill status={prescription.status} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminPharmacyPage;
