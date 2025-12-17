import { useDailyWasteHistory } from '../../hooks/useDailyWasteHistory';

export default function WasteHistoryCard() {
  const { data, isLoading, error } = useDailyWasteHistory();

  return (
    <div className="rounded-3xl bg-white p-8 shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-[#2B5991]">
          Waste History (Daily)
        </h2>
      </div>

      {isLoading ? (
        <p className="mt-4 text-sm text-[#2B5991]">Loading...</p>
      ) : null}

      {error ? (
        <p className="mt-4 text-sm text-red-600">{(error as Error).message}</p>
      ) : null}

      <div className="mt-6 grid gap-4">
        {(data ?? []).length === 0 && !isLoading && !error ? (
          <p className="text-sm text-gray-500">No history</p>
        ) : null}

        {(data ?? []).map((d, idx) => (
          <div
            key={`${d.date}-${idx}`}
            className="rounded-2xl border border-gray-100 p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="text-lg font-semibold text-[#2B5991]">{d.date}</p>

              <p className="text-sm text-[#2B5991]">
                Total: <span className="font-bold">{d.total_weight_kg}</span> kg
              </p>
            </div>

            <div className="mt-4 grid gap-2">
              {(d.by_type ?? []).map((t, i) => (
                <div
                  key={`${t.log_id}-${i}`}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-[#2B5991]">{t.waste_type}</span>
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
        ))}
      </div>
    </div>
  );
}
