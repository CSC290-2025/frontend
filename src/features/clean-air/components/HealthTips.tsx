import { useParams } from '@/router';
import { useHealthTipsQuery } from '../hooks/useHealthTips';

export function HealthTips() {
  const { district } = useParams('/clean-air/district-detail/:district');
  const { data: healthTips, isLoading, error } = useHealthTipsQuery(district);
  if (isLoading) {
    return (
      <div className="h-full rounded-xl border border-gray-900 bg-white p-6 text-gray-900 shadow-2xl shadow-gray-400">
        <h2 className="mb-4 text-lg font-semibold">Health Tips</h2>
        <div className="text-center">Loading health tips...</div>
      </div>
    );
  }

  if (error || !healthTips) {
    return (
      <div className="h-full rounded-xl border border-gray-900 bg-white p-6 text-gray-900 shadow-2xl shadow-gray-400">
        <h2 className="mb-4 text-lg font-semibold">Health Tips</h2>
        <div className="text-center text-red-600">
          {error?.message || 'No health tips available'}
        </div>
      </div>
    );
  }
  return (
    <div className="h-full rounded-xl border border-gray-900 bg-white p-6 text-gray-900 shadow-2xl shadow-gray-400">
      <h2 className="mb-4 text-lg font-semibold">Health Tips</h2>
      <div className="space-y-3">
        {healthTips.map((tip, index) => (
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
