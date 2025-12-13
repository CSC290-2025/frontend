import React from 'react';
import { Activity, Pill } from 'lucide-react';
import {
  useMedicineInventory,
  usePrescriptions,
} from '@/features/_healthcare/hooks/useHealthcareData';
import { StatusPill } from '@/features/_healthcare/components/common/StatusPill';
import { DataState } from '@/features/_healthcare/components/common/DataState';
import { formatAppointmentTime } from '@/features/_healthcare/utils';

const UserMedicationsPage: React.FC = () => {
  const prescriptionsQuery = usePrescriptions({
    limit: 100,
    sortOrder: 'desc',
  });
  const inventoryQuery = useMedicineInventory({ limit: 100, sortOrder: 'asc' });

  const prescriptions = prescriptionsQuery.data?.prescriptions ?? [];
  const inventory = inventoryQuery.data?.medicineInventory ?? [];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            Medication history
          </h2>
          <div className="flex items-center gap-2 rounded-full bg-[#01CCFF]/10 px-3 py-1 text-xs font-semibold text-[#01CCFF]">
            <Pill className="h-4 w-4" />
            {prescriptions.length} orders
          </div>
        </div>
        <div className="mt-4 max-h-[360px] space-y-3 overflow-y-auto pr-1">
          {prescriptions.length === 0 && (
            <DataState message="No prescriptions yet" accent="cyan" />
          )}
          {prescriptions.map((prescription) => (
            <div
              key={prescription.id}
              className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
            >
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-900">
                  Prescription #{prescription.id}
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
                          item &&
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
              <StatusPill status={prescription.status} />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Order medication
            </h2>
            <p className="text-sm text-gray-600">
              Check availability before ordering more.
            </p>
          </div>
          <Activity className="h-5 w-5 text-[#01CCFF]" />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {inventory.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {item.medicineName ?? 'Medicine'}{' '}
                  <span className="text-xs text-gray-500">#{item.id}</span>
                </p>
                <p className="text-xs text-gray-600">
                  Stock: {item.stockQuantity ?? 0} •{' '}
                  {item.isInStock ? 'In stock' : 'Out of stock'}
                </p>
              </div>
              <button
                disabled={!item.isInStock}
                className={`rounded-lg px-3 py-1 text-sm font-semibold ${
                  item.isInStock
                    ? 'bg-[#01CCFF] text-white hover:bg-[#0091B5]'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                Order
              </button>
            </div>
          ))}
          {inventory.length === 0 && (
            <DataState message="No inventory data" accent="cyan" />
          )}
        </div>
      </section>
    </div>
  );
};

export default UserMedicationsPage;
