import { useNavigate } from '@/router';
import { useVolunteer } from '../hooks/useVolunteer';
import { ChevronLeft } from 'lucide-react';
import VolunteerCard from '../components/VolunteerPage/VolunteerCard';
import UpcomingVolunteerCard from '../components/VolunteerPage/UpcomingVolunteerCard';
import VolunteerHistoryCard from '../components/VolunteerPage/VolunteerHistoryCard';

export default function VolunteerPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useVolunteer();

  if (isLoading) return null;
  if (isError) return <div className="p-6 text-red-500">Load failed</div>;

  return (
    <main className="min-h-screen bg-[#F6F7FB] px-6 py-10">
      <div className="mx-auto mb-6 flex w-full max-w-6xl items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/citizen/profile')}
          className="flex items-center gap-3 text-[#2B5991]"
        >
          <ChevronLeft className="h-10 w-10" />
          <span className="text-2xl font-bold">Profile</span>
        </button>
      </div>

      <div className="Out Box mx-auto w-full max-w-6xl rounded-3xl bg-white p-10 shadow-2xl">
        <h2 className="text-4xl font-semibold text-[#2B5991]">
          Volunteer list & registration
        </h2>
        <h2 className="mb-8 text-lg font-semibold text-[#2B5991]">
          Find and join community volunteer programs
        </h2>

        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-1">
            <div className="rounded-3xl bg-[#F9FAFB] p-4 shadow-md">
              <div className="h-[620px] overflow-y-auto pr-2">
                {data?.events?.map((event) => (
                  <VolunteerCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-2 space-y-8">
            <div>
              <h3 className="mb-3 font-semibold text-[#2B5991]">
                Upcoming event
              </h3>
              {data?.events?.[0] ? (
                <UpcomingVolunteerCard event={data.events[0]} />
              ) : (
                <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
                  No upcoming event
                </div>
              )}
            </div>

            <div>
              <h3 className="mb-3 font-semibold text-[#2B5991]">
                History of Volunteering
              </h3>
              <VolunteerHistoryCard title="Beach cleaning" />
            </div>

            <div>
              <h3 className="mb-3 font-semibold text-[#2B5991]">
                history of free cycle
              </h3>
              <VolunteerHistoryCard title="Free cycle" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
