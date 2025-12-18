import Layout from '@/components/main/Layout';
import { useNavigate } from '@/router';

import { useVolunteer } from '../hooks/useVolunteer';
import UpcomingVolunteerCard from '../components/VolunteerPage/UpcomingVolunteerCard';

function isUpcoming(startAt: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(startAt);
  if (Number.isNaN(start.getTime())) return false;
  start.setHours(0, 0, 0, 0);

  return start >= today;
}

export default function VolunteerPage() {
  const navigate = useNavigate();
  const listQ = useVolunteer();

  if (listQ.isLoading) return null;

  if (listQ.isError) {
    return (
      <div className="p-6 text-red-500">Failed to load volunteer list</div>
    );
  }

  const events = listQ.data?.events ?? [];

  const upcomingEvents = events
    .filter((e) => isUpcoming(e.start_at))
    .sort(
      (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
    );

  const upcomingTop10 = upcomingEvents.slice(0, 10);

  return (
    <Layout>
      <main className="min-h-screen bg-[#F6F7FB] px-6 py-10">
        <div className="mx-auto w-full max-w-4xl rounded-3xl bg-white p-10 shadow-2xl">
          <h2 className="text-4xl font-semibold text-[#2B5991]">
            Volunteer List & Registration
          </h2>
          <h2 className="mb-8 text-lg font-semibold text-black">
            Find and join community volunteer programs
          </h2>

          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-[#2B5991]">Upcoming Events</h3>
            <span className="text-sm text-gray-500">
              Showing {upcomingTop10.length} / {upcomingEvents.length}
            </span>
          </div>

          <div className="rounded-3xl bg-[#F9FAFB] p-5 shadow-md">
            <div className="h-[620px] overflow-y-auto pr-2">
              <div className="space-y-4">
                {upcomingTop10.map((event) => (
                  <UpcomingVolunteerCard key={event.id} event={event} />
                ))}

                {upcomingTop10.length === 0 && (
                  <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
                    No upcoming events
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
