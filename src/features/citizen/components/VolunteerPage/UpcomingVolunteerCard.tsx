import { useNavigate } from '@/router';
import type { VolunteerEvent } from '../../api/volunteer.api';

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;

  return d.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function UpcomingVolunteerCard({
  event,
}: {
  event: VolunteerEvent;
}) {
  const navigate = useNavigate();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/volunteer/detail/${event.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          navigate(`/volunteer/detail/${event.id}`);
        }
      }}
      className="cursor-pointer rounded-2xl border border-gray-200 bg-white p-4 text-sm shadow-sm transition hover:border-[#2B5991] hover:shadow-md"
    >
      <p className="font-semibold text-[#2B5991]">{event.title}</p>
      <p className="mt-1 text-gray-700">{formatDate(event.start_at)}</p>
      <p className="mt-2 text-xs text-[#2B5991]">View details →</p>
    </div>
  );
}
