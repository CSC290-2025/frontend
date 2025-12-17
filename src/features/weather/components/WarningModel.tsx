export default function WarningModel({
  open,
  warning,
  text,
  onClose,
}: {
  open: boolean;
  warning: string;
  text: string;
  onClose: () => void;
}) {
  if (!open) return null;

  // determine severity from warning text
  const key = (warning ?? '').toLowerCase();
  const severity: 'high' | 'moderate' | 'low' =
    key.includes('high') || key.includes('flood')
      ? 'high'
      : key.includes('moderate')
        ? 'moderate'
        : 'low';

  const headerIcon =
    severity === 'high' ? '🌧️🌊' : severity === 'moderate' ? '🌦️' : '☀️';
  const headerClass =
    severity === 'high'
      ? 'text-red-700'
      : severity === 'moderate'
        ? 'text-amber-700'
        : 'text-green-700';
  const boxClass =
    severity === 'high'
      ? 'border-red-200 bg-red-50'
      : severity === 'moderate'
        ? 'border-amber-200 bg-amber-50'
        : 'border-green-200 bg-green-50';
  const iconAnimation =
    severity === 'high'
      ? 'animate-pulse'
      : severity === 'moderate'
        ? 'animate-bounce'
        : '';

  const recommendation =
    severity === 'high'
      ? [
          'Carry waterproof protection (umbrella/raincoat).',
          'Avoid flood-prone or low-lying areas.',
          'Expect sustained heavy rain and possible flash flooding.',
        ]
      : severity === 'moderate'
        ? [
            'Consider carrying an umbrella for intermittent showers.',
            'Check local forecasts before travel.',
          ]
        : ['Conditions look calm. Minimal chance of rain in the next week.'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className={`relative w-[480px] rounded-2xl bg-gradient-to-b from-white to-white p-6 shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-xl text-gray-600"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className={`mb-4 text-center text-2xl font-bold ${headerClass}`}>
          {headerIcon} {warning}
        </h2>

        <div className="flex items-center justify-center">
          <div className={`${iconAnimation} text-7xl`}>{headerIcon}</div>
        </div>

        <p className="mt-4 text-center text-lg font-semibold">{text}</p>

        <div className={`mt-4 rounded-lg border p-3 text-center ${boxClass}`}>
          <p className="mb-2 font-semibold">Recommended actions</p>
          <ul className="list-inside list-disc text-sm">
            {recommendation.map((r, idx) => (
              <li key={idx}>{r}</li>
            ))}
          </ul>
        </div>

        <button
          className={`mt-6 w-full rounded-lg py-2 text-white ${
            severity === 'high'
              ? 'bg-red-500 hover:bg-red-600'
              : severity === 'moderate'
                ? 'bg-amber-500 hover:bg-amber-600'
                : 'bg-green-600 hover:bg-green-700'
          }`}
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
