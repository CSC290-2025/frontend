// src/features/citizen/components/VolunteerPage/VolunteerCard.tsx
import type { VolunteerEvent } from '../../api/volunteer.api';

type Props = {
  event: VolunteerEvent;
};

export default function VolunteerCard({ event }: Props) {
  return (
    <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 transition hover:shadow-md">
      <h3 className="text-base font-semibold text-[#2B5991]">{event.title}</h3>

      <p className="mt-1 text-sm text-gray-600">{event.description}</p>

      <div className="mt-3 text-sm text-gray-500">
        👥 {event.current_participants}/{event.total_seats}
      </div>
    </div>
  );
}
