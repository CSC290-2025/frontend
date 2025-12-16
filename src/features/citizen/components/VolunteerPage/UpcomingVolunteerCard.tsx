// src/features/citizen/components/VolunteerPage/UpcomingVolunteerCard.tsx
import type { VolunteerEvent } from '../../api/volunteer.api';

export default function UpcomingVolunteerCard({
  event,
}: {
  event: VolunteerEvent;
}) {
  return (
    <div className="rounded-2xl border p-4 text-sm">
      <p className="font-semibold text-[#2B5991]">{event.title}</p>
      <p>{event.start_at}</p>
    </div>
  );
}
