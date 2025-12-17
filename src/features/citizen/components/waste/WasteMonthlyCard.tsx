import React from 'react';
import { useMonthlyWasteStats } from '../../hooks/useMonthlyWasteStats';

export default function WasteMonthlyCard() {
  const { data, isLoading, error } = useMonthlyWasteStats();

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#2B5991]">
            Monthly Waste Stats
          </h2>
          <p className="mt-1 text-sm text-gray-500">Monthly summary</p>
        </div>

        {data ? (
          <span className="text-sm font-medium text-[#2B5991]">
            {data.month}/{data.year}
          </span>
        ) : null}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        {isLoading ? (
          <p className="text-sm text-[#2B5991]">Loading...</p>
        ) : null}

        {error ? (
          <p className="text-sm text-red-600">{(error as Error).message}</p>
        ) : null}

        {!isLoading && !error && !data ? (
          <p className="text-sm text-gray-500">No data</p>
        ) : null}

        {data ? (
          <>
            <div className="mt-2 rounded-2xl bg-[#01CCFF] px-6 py-4 text-white">
              <p className="text-sm font-medium">Total</p>
              <p className="mt-1 text-3xl font-bold">
                {data.total_weight_kg ?? 0} kg
              </p>
            </div>

            <div className="mt-5 rounded-2xl border border-gray-100 p-5">
              <p className="text-sm font-semibold text-[#2B5991]">By type</p>

              <div className="mt-4 max-h-[300px] space-y-3 overflow-y-auto pr-2">
                {(data.by_type ?? []).map((x, i) => (
                  <div
                    key={`${x.waste_type}-${i}`}
                    className="rounded-2xl border border-gray-100 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-[#2B5991]">
                          {x.waste_type}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {x.entry_count} entries
                        </p>
                      </div>

                      <p className="text-sm font-semibold text-[#2B5991]">
                        {x.total_weight} kg
                      </p>
                    </div>
                  </div>
                ))}

                {(data.by_type ?? []).length === 0 ? (
                  <p className="text-sm text-gray-500">No data</p>
                ) : null}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
