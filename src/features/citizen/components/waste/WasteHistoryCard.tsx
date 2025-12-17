import React from 'react';
import { useDailyWasteHistory } from '../../hooks/useDailyWasteHistory';

export default function WasteHistoryCard() {
  const { data, isLoading, error } = useDailyWasteHistory();
  const rows = data ?? [];

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-[#2B5991]">Waste History</h2>
        <p className="mt-1 text-sm text-gray-500">Daily records</p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        {isLoading ? (
          <p className="text-sm text-[#2B5991]">Loading...</p>
        ) : null}

        {error ? (
          <p className="text-sm text-red-600">{(error as Error).message}</p>
        ) : null}

        {!isLoading && !error && rows.length === 0 ? (
          <p className="text-sm text-gray-500">No history</p>
        ) : null}

        {rows.length > 0 ? (
          <div className="mt-4 max-h-[420px] space-y-4 overflow-y-auto pr-2">
            {rows.map((d, idx) => (
              <div
                key={`${d.date}-${idx}`}
                className="rounded-2xl border border-gray-100 bg-white p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold text-[#2B5991]">
                      {d.date}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {(d.by_type ?? []).length > 0
                        ? `${(d.by_type ?? []).length} types`
                        : 'No breakdown'}
                    </p>
                  </div>

                  <p className="text-sm text-[#2B5991]">
                    Total:{' '}
                    <span className="font-bold">{d.total_weight_kg ?? 0}</span>{' '}
                    kg
                  </p>
                </div>

                <div className="mt-4 rounded-2xl border border-gray-100 p-4">
                  <p className="text-sm font-semibold text-[#2B5991]">
                    Breakdown
                  </p>

                  <div className="mt-3 space-y-2">
                    {(d.by_type ?? []).map((t, i) => (
                      <div
                        key={`${t.log_id}-${i}`}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-[#2B5991]">
                          {t.waste_type}
                        </span>
                        <span className="text-sm font-semibold text-[#2B5991]">
                          {t.total_weight} kg
                        </span>
                      </div>
                    ))}

                    {(d.by_type ?? []).length === 0 ? (
                      <p className="text-sm text-gray-500">No breakdown</p>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
