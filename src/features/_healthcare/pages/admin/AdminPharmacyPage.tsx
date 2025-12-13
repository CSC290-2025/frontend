import React, { useMemo, useState } from 'react';
import { Pill, PlusCircle, Trash2, Edit, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  useMedicineInventory,
  usePatients,
  usePrescriptions,
} from '@/features/_healthcare/hooks/useHealthcareData';
import type {
  MedicineInventory,
  MedicineListItem,
  Patient,
  Prescription,
} from '@/features/_healthcare/types';
import {
  createMedicine,
  deleteMedicine,
  updateMedicine,
  createPrescription,
  updatePrescription,
  deletePrescription,
} from '@/features/_healthcare/api/healthcare.api';
import { DataState } from '@/features/_healthcare/components/common/DataState';
import { StatusPill } from '@/features/_healthcare/components/common/StatusPill';
import { formatAppointmentTime } from '@/features/_healthcare/utils';

const emptyInventoryForm: Partial<MedicineInventory> = {
  facilityId: null,
  medicineName: '',
  stockQuantity: 0,
  unitPrice: 0,
  isInStock: true,
};

type PrescriptionFormState = {
  patientId: number | null;
  facilityId: number | null;
  status: string;
  totalAmount: number | null;
  medicinesList: MedicineListItem[];
};

const prescriptionStatuses = ['Pending', 'Dispensed', 'Fulfilled', 'Cancelled'];

const createEmptyPrescriptionForm = (): PrescriptionFormState => ({
  patientId: null,
  facilityId: null,
  status: prescriptionStatuses[0],
  totalAmount: null,
  medicinesList: [{ name: '', quantity: 1, dosage: '' }],
});

const safeMedicinesList = (
  list: MedicineListItem[] | null | undefined
): MedicineListItem[] => (Array.isArray(list) ? list : []);

const formatMedicineSummary = (
  list: MedicineListItem[] | null | undefined
): string => {
  const normalized = safeMedicinesList(list).filter(
    (item) => item && item.name && item.quantity !== undefined
  );
  return normalized.map((item) => `${item.name} x${item.quantity}`).join(', ');
};

const withFallbackMedicineRows = (
  rows: MedicineListItem[]
): MedicineListItem[] =>
  rows.length
    ? rows.map((item) => ({
        medicineId: item.medicineId,
        name: item.name,
        quantity: item.quantity,
        dosage: item.dosage ?? '',
      }))
    : [{ name: '', quantity: 1, dosage: '' }];

const AdminPharmacyPage: React.FC = () => {
  const queryClient = useQueryClient();
  const inventoryQuery = useMedicineInventory({ limit: 50, sortOrder: 'desc' });
  const prescriptionsQuery = usePrescriptions({ limit: 50, sortOrder: 'desc' });
  const patientsQuery = usePatients({ limit: 50 });

  const [inventoryForm, setInventoryForm] =
    useState<Partial<MedicineInventory>>(emptyInventoryForm);
  const [editingInventoryId, setEditingInventoryId] = useState<number | null>(
    null
  );
  const [prescriptionForm, setPrescriptionForm] =
    useState<PrescriptionFormState>(createEmptyPrescriptionForm);
  const [editingPrescriptionId, setEditingPrescriptionId] = useState<
    number | null
  >(null);

  const patientLookup = useMemo(() => {
    const map = new Map<number, Patient>();
    patientsQuery.data?.patients.forEach((patient) =>
      map.set(patient.id, patient)
    );
    return map;
  }, [patientsQuery.data]);

  const resetInventoryForm = () => {
    setInventoryForm(emptyInventoryForm);
    setEditingInventoryId(null);
  };

  const resetPrescriptionForm = () => {
    setPrescriptionForm(createEmptyPrescriptionForm());
    setEditingPrescriptionId(null);
  };

  const inventoryMutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicineInventory'] });
      resetInventoryForm();
    },
  };

  const createInventoryMutation = useMutation({
    mutationFn: createMedicine,
    ...inventoryMutationOptions,
  });

  const updateInventoryMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<MedicineInventory>;
    }) => updateMedicine(id, payload),
    ...inventoryMutationOptions,
  });

  const deleteInventoryMutation = useMutation({
    mutationFn: (id: number) => deleteMedicine(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['medicineInventory'] });
      if (editingInventoryId === id) {
        resetInventoryForm();
      }
    },
  });

  const prescriptionMutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      queryClient.invalidateQueries({ queryKey: ['medicineInventory'] });
      resetPrescriptionForm();
    },
  };

  const createPrescriptionMutation = useMutation({
    mutationFn: createPrescription,
    ...prescriptionMutationOptions,
  });

  const updatePrescriptionMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Parameters<typeof updatePrescription>[1];
    }) => updatePrescription(id, payload),
    ...prescriptionMutationOptions,
  });

  const deletePrescriptionMutation = useMutation({
    mutationFn: (id: number) => deletePrescription(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      if (editingPrescriptionId === id) {
        resetPrescriptionForm();
      }
    },
  });

  const prescriptions = prescriptionsQuery.data?.prescriptions ?? [];
  const inventory = inventoryQuery.data?.medicineInventory ?? [];

  const inventoryByName = useMemo(() => {
    const map = new Map<string, MedicineInventory>();
    inventory.forEach((item) => {
      const key = item.medicineName?.trim().toLowerCase();
      if (key && !map.has(key)) {
        map.set(key, item);
      }
    });
    return map;
  }, [inventory]);

  const medicineSuggestions = useMemo(
    () =>
      Array.from(
        new Set(
          inventory
            .map((item) => item.medicineName?.trim())
            .filter((name): name is string => Boolean(name))
        )
      ).sort((a, b) => a.localeCompare(b)),
    [inventory]
  );

  const handleInventorySubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      facilityId: inventoryForm.facilityId ?? undefined,
      medicineName: inventoryForm.medicineName ?? undefined,
      stockQuantity: inventoryForm.stockQuantity ?? undefined,
      unitPrice: inventoryForm.unitPrice ?? undefined,
      isInStock: inventoryForm.isInStock ?? undefined,
    };

    if (editingInventoryId) {
      updateInventoryMutation.mutate({ id: editingInventoryId, payload });
    } else {
      createInventoryMutation.mutate(payload);
    }
  };

  const startInventoryEdit = (item: MedicineInventory) => {
    setEditingInventoryId(item.id);
    setInventoryForm({
      facilityId: item.facilityId,
      medicineName: item.medicineName ?? '',
      stockQuantity: item.stockQuantity ?? 0,
      unitPrice: item.unitPrice ?? 0,
      isInStock: item.isInStock ?? true,
    });
  };

  const addMedicineRow = () => {
    setPrescriptionForm((prev) => ({
      ...prev,
      medicinesList: [
        ...prev.medicinesList,
        { name: '', quantity: 1, dosage: '' },
      ],
    }));
  };

  const updateMedicineField = (
    index: number,
    field: 'dosage',
    value: string
  ) => {
    setPrescriptionForm((prev) => ({
      ...prev,
      medicinesList: prev.medicinesList.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleMedicineNameChange = (index: number, value: string) => {
    const normalized = value.trim().toLowerCase();
    const match = inventoryByName.get(normalized);

    setPrescriptionForm((prev) => ({
      ...prev,
      medicinesList: prev.medicinesList.map((item, idx) =>
        idx === index
          ? {
              ...item,
              name: value,
              medicineId: match?.id ?? undefined,
            }
          : item
      ),
    }));
  };

  const updateMedicineQuantity = (index: number, value: number) => {
    setPrescriptionForm((prev) => ({
      ...prev,
      medicinesList: prev.medicinesList.map((item, idx) =>
        idx === index ? { ...item, quantity: Math.max(1, value) } : item
      ),
    }));
  };

  const removeMedicineRow = (index: number) => {
    setPrescriptionForm((prev) => {
      const copy = prev.medicinesList.filter((_, idx) => idx !== index);
      return {
        ...prev,
        medicinesList: withFallbackMedicineRows(copy),
      };
    });
  };

  const sanitizeMedicinesList = (items: MedicineListItem[]) =>
    items
      .filter(
        (item) =>
          typeof item.name === 'string' &&
          item.name.trim().length > 0 &&
          typeof item.quantity === 'number' &&
          item.quantity > 0
      )
      .map((item) => {
        const dosageValue = item.dosage ?? '';
        const name = item.name?.trim() ?? '';
        const normalizedId =
          typeof item.medicineId === 'number' ? item.medicineId : undefined;

        return {
          medicineId:
            normalizedId && Number.isFinite(normalizedId)
              ? normalizedId
              : undefined,
          name,
          quantity: item.quantity,
          dosage: dosageValue.trim() ? dosageValue.trim() : undefined,
        };
      });

  const handlePrescriptionSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const medicines = sanitizeMedicinesList(prescriptionForm.medicinesList);

    const payload = {
      patientId: prescriptionForm.patientId ?? undefined,
      facilityId: prescriptionForm.facilityId ?? undefined,
      status: prescriptionForm.status?.trim() || undefined,
      medicinesList: medicines.length ? medicines : undefined,
      totalAmount: prescriptionForm.totalAmount ?? undefined,
    };

    if (editingPrescriptionId) {
      updatePrescriptionMutation.mutate({ id: editingPrescriptionId, payload });
    } else {
      createPrescriptionMutation.mutate(payload);
    }
  };

  const startPrescriptionEdit = (prescription: Prescription) => {
    setEditingPrescriptionId(prescription.id);
    setPrescriptionForm({
      patientId: prescription.patientId ?? null,
      facilityId: prescription.facilityId ?? null,
      status: prescription.status ?? prescriptionStatuses[0],
      totalAmount: prescription.totalAmount ?? null,
      medicinesList: withFallbackMedicineRows(
        safeMedicinesList(prescription.medicinesList)
      ),
    });
  };

  const handlePrescriptionDelete = (id: number) => {
    if (
      window.confirm('Delete this prescription? This action cannot be undone.')
    ) {
      deletePrescriptionMutation.mutate(id);
    }
  };

  const isSavingPrescription =
    createPrescriptionMutation.isPending ||
    updatePrescriptionMutation.isPending;

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
              onSubmit={handleInventorySubmit}
              className="mt-4 grid gap-3 sm:grid-cols-2"
            >
              <label className="text-sm text-gray-700">
                Medicine name
                <input
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  value={inventoryForm.medicineName ?? ''}
                  onChange={(e) =>
                    setInventoryForm((prev) => ({
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
                  value={inventoryForm.facilityId ?? ''}
                  onChange={(e) =>
                    setInventoryForm((prev) => ({
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
                  value={inventoryForm.stockQuantity ?? 0}
                  onChange={(e) =>
                    setInventoryForm((prev) => ({
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
                  value={inventoryForm.unitPrice ?? 0}
                  onChange={(e) =>
                    setInventoryForm((prev) => ({
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
                  checked={Boolean(inventoryForm.isInStock)}
                  onChange={(e) =>
                    setInventoryForm((prev) => ({
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
                  {editingInventoryId ? 'Update medicine' : 'Add medicine'}
                </button>
                {editingInventoryId && (
                  <button
                    type="button"
                    onClick={resetInventoryForm}
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
                      onClick={() => startInventoryEdit(item)}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      className="rounded-full p-2 text-red-500 hover:bg-white"
                      onClick={() => deleteInventoryMutation.mutate(item.id)}
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
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">
              Prescription Management
            </h2>
            <p className="text-sm text-gray-600">
              Create, update, and remove prescriptions tied to patients.
            </p>

            <form
              onSubmit={handlePrescriptionSubmit}
              className="mt-4 space-y-4"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm text-gray-700">
                  Patient
                  <select
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    value={prescriptionForm.patientId ?? ''}
                    onChange={(e) =>
                      setPrescriptionForm((prev) => ({
                        ...prev,
                        patientId: e.target.value
                          ? Number(e.target.value)
                          : null,
                      }))
                    }
                  >
                    <option value="">Unassigned patient</option>
                    {patientsQuery.data?.patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        #{patient.id}
                        {patient.emergencyContact
                          ? ` • ${patient.emergencyContact}`
                          : ''}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm text-gray-700">
                  Facility ID
                  <input
                    type="number"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    value={prescriptionForm.facilityId ?? ''}
                    onChange={(e) =>
                      setPrescriptionForm((prev) => ({
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
                  Status
                  <select
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    value={prescriptionForm.status}
                    onChange={(e) =>
                      setPrescriptionForm((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                  >
                    {prescriptionStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm text-gray-700">
                  Total amount
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    value={prescriptionForm.totalAmount ?? ''}
                    onChange={(e) =>
                      setPrescriptionForm((prev) => ({
                        ...prev,
                        totalAmount:
                          e.target.value === '' ? null : Number(e.target.value),
                      }))
                    }
                    placeholder="e.g. 125.50"
                  />
                </label>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">
                    Medicines
                  </p>
                  <button
                    type="button"
                    onClick={addMedicineRow}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Add medicine
                  </button>
                </div>

                <div className="space-y-3">
                  {prescriptionForm.medicinesList.map((medicine, index) => (
                    <div
                      key={`${medicine.medicineId ?? 'new'}-${index}`}
                      className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,2fr)_auto]"
                    >
                      <input
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        value={medicine.name ?? ''}
                        onChange={(e) =>
                          handleMedicineNameChange(index, e.target.value)
                        }
                        placeholder="Medicine name"
                        list="medicine-suggestions"
                        autoComplete="off"
                      />
                      <input
                        type="number"
                        min={1}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        value={medicine.quantity}
                        onChange={(e) =>
                          updateMedicineQuantity(index, Number(e.target.value))
                        }
                      />
                      <input
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        value={medicine.dosage ?? ''}
                        onChange={(e) =>
                          updateMedicineField(index, 'dosage', e.target.value)
                        }
                        placeholder="Dosage / notes"
                      />
                      {prescriptionForm.medicinesList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMedicineRow(index)}
                          className="rounded-full border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"
                          title="Remove medicine"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSavingPrescription}
                  className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSavingPrescription ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <PlusCircle className="h-4 w-4" />
                  )}
                  {editingPrescriptionId
                    ? 'Update prescription'
                    : 'Create prescription'}
                </button>
                {(editingPrescriptionId ||
                  prescriptionForm.medicinesList.some(
                    (medicine) => medicine.name || medicine.dosage
                  )) && (
                  <button
                    type="button"
                    onClick={resetPrescriptionForm}
                    className="text-sm font-semibold text-gray-600 underline"
                  >
                    Reset form
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="w-full lg:w-1/2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                Recent prescriptions
              </h3>
              <span className="text-xs text-gray-500">
                {prescriptions.length} records
              </span>
            </div>

            {prescriptionsQuery.isLoading && (
              <DataState message="Loading prescriptions..." accent="cyan" />
            )}
            {!prescriptionsQuery.isLoading && prescriptions.length === 0 && (
              <DataState message="No prescriptions recorded" />
            )}

            <div className="mt-3 max-h-[360px] space-y-3 overflow-y-auto pr-1">
              {prescriptions.map((prescription) => {
                const patient = patientLookup.get(prescription.patientId ?? 0);
                const medicinesSummary = formatMedicineSummary(
                  prescription.medicinesList
                );

                return (
                  <div
                    key={`rx-${prescription.id}`}
                    className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-gray-900">
                        RX #{prescription.id}{' '}
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
                      {medicinesSummary && (
                        <p className="text-[11px] text-gray-600">
                          {medicinesSummary}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="rounded-full p-2 text-gray-500 hover:bg-white"
                        onClick={() => startPrescriptionEdit(prescription)}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        className="rounded-full p-2 text-red-500 hover:bg-white"
                        onClick={() =>
                          handlePrescriptionDelete(prescription.id)
                        }
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
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
              const medicinesSummary = formatMedicineSummary(
                prescription.medicinesList
              );

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
                    {medicinesSummary && (
                      <p className="text-[11px] text-gray-600">
                        {medicinesSummary}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-xs text-gray-600">
                      <p className="font-semibold text-gray-800">
                        Payment status
                      </p>
                      <p>{prescription.status ?? 'Pending'}</p>
                      {prescription.totalAmount !== null && (
                        <p className="text-[11px] text-gray-500">
                          Total: {prescription.totalAmount}
                        </p>
                      )}
                    </div>
                    <StatusPill status={prescription.status} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <datalist id="medicine-suggestions">
        {medicineSuggestions.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
    </div>
  );
};

export default AdminPharmacyPage;
