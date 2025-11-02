export function HealthTips() {
  const tips = [
    'Wear a protective mask outside.',
    'Avoid outdoor exercise.',
    'Stay indoors if possible.',
  ];

  return (
    <div className="h-full rounded-xl border border-gray-900 bg-white p-6 text-gray-900 shadow-2xl shadow-gray-400">
      <h2 className="mb-4 text-lg font-semibold">Health Tips</h2>
      <div className="space-y-3">
        {tips.map((tip, index) => (
          <div
            key={index}
            className="rounded-lg border border-gray-300 bg-gray-100 p-3 text-sm transition-colors hover:bg-gray-200"
          >
            {tip}
          </div>
        ))}
      </div>
    </div>
  );
}
