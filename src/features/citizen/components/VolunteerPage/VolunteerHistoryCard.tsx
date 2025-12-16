// src/features/citizen/components/VolunteerPage/VolunteerHistoryCard.tsx
export default function VolunteerHistoryCard({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-700 shadow-sm">
      {title} : <span className="font-medium text-green-600">complete</span>
    </div>
  );
}
