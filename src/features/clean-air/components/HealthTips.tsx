import { useParams } from '@/router';
import useHealthTipsQuery from '@/features/clean-air/hooks/useHealthTips';

export default function HealthTips() {
  const { district } = useParams('/clean-air/district-detail/:district');
  const { data: healthTips, isLoading, error } = useHealthTipsQuery(district);
  if (isLoading) {
    return (
      <div className="h-full rounded-xl border border-black bg-white p-6 text-gray-900 shadow-md">
        <h2 className="mb-4 text-base font-semibold">Health Tips</h2>
        <div className="text-center">Loading health tips...</div>
      </div>
    );
  }

  if (error || !healthTips) {
    return (
      <div className="h-full rounded-xl border border-black bg-white p-6 text-gray-900 shadow-md">
        <h2 className="mb-4 text-base font-semibold">Health Tips</h2>
        <div className="text-center text-red-600">
          {error?.message || 'No health tips available'}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full rounded-xl border border-black bg-white p-6 text-gray-900 shadow-md">
      <h2 className="mb-4 text-base font-semibold text-gray-800">
        Health Tips
      </h2>
      <ul className="list-disc space-y-3 pl-4 text-gray-700">
        {healthTips.map((tip, index) => (
          <li key={index} className="text-sm">
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}
