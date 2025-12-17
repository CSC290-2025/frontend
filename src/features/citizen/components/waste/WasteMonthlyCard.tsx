import { useMonthlyWasteStats } from '../../hooks/useMonthlyWasteStats';

export default function WasteMonthlyCard() {
  const { data, isLoading, error } = useMonthlyWasteStats();

  return (
    <div className="rounded-3xl bg-white p-8 shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-[#2B5991]">
          Monthly Waste Stats
        </h2>

        {data ? (
          <span className="text-sm font-medium text-[#2B5991]">
            {data.month}/{data.year}
          </span>
        ) : null}
      </div>

      {isLoading ? (
        <p className="mt-4 text-sm text-[#2B5991]">Loading...</p>
      ) : null}

      {error ? (
        <p className="mt-4 text-sm text-red-600">{(error as Error).message}</p>
      ) : null}

      {data ? (
        <>
          <div className="mt-6 w-full rounded-2xl bg-[#01CCFF] px-6 py-4 text-white">
            <p className="text-sm font-medium">Total</p>
            <p className="mt-1 text-3xl font-bold">
              {data.total_weight_kg ?? 0} kg
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-100 p-5">
            <p className="text-sm font-semibold text-[#2B5991]">By type</p>

            <div className="mt-4 grid gap-3">
              {(data.by_type ?? []).map((x, i) => (
                <div
                  key={`${x.waste_type}-${i}`}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-sm text-[#2B5991]">{x.waste_type}</span>

                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-[#2B5991]">
                      {x.total_weight} kg
                    </span>
                    <span className="text-xs text-gray-500">
                      {x.entry_count} entries
                    </span>
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
  );
}
