import { useParams } from '@/router';
import useHealthTipsQuery from '@/features/clean-air/hooks/useHealthTips';

export default function HealthTips() {
  const { district } = useParams('/clean-air/district-detail/:district');
  const { data: healthTips, isLoading, error } = useHealthTipsQuery(district);

  const Container = ({ children }: { children: React.ReactNode }) => (
    <div className="h-full rounded-xl border border-gray-900 bg-white p-6 text-gray-900 shadow-2xl shadow-gray-400">
      <h2 className="mb-4 text-lg font-semibold">Health Tips</h2>
      {children}
    </div>
  );

  if (isLoading) {
    return (
      <Container>
        <div className="animate-pulse text-center text-gray-400">
          Loading health tips...
        </div>
      </Container>
    );
  }

  if (error || !healthTips) {
    return (
      <Container>
        <div className="text-center text-red-500">
          {error?.message || 'No health tips available'}
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <ul className="list-disc space-y-4 pl-5 text-gray-700">
        {healthTips.map((tip, index) => (
          <li key={index} className="text-sm leading-relaxed">
            {tip}
          </li>
        ))}
      </ul>
    </Container>
  );
}
