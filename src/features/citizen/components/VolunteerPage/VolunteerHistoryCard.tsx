export default function VolunteerHistoryCard({
  title,
  status,
}: {
  title: string;
  status: string;
}) {
  const isComplete = status === 'complete';

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-700 shadow-sm">
      {title} :{' '}
      <span
        className={
          isComplete
            ? 'font-medium text-green-600'
            : 'font-medium text-gray-500'
        }
      >
        {status}
      </span>
    </div>
  );
}
