import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from '@/router';
import { ArrowLeft, Calendar, Users } from 'lucide-react';

interface VolunteerEvent {
  id: number;
  title: string;
  start_at: string | null;
  image_url: string | null;
  current_participants: number;
  total_seats: number;
}

interface MyEventsApiResponse {
  success: boolean;
  data: {
    events: VolunteerEvent[];
    count: number;
  };
}

const UserJoinPage: React.FC = () => {
  const navigate = useNavigate();
  const [joinedEvents, setJoinedEvents] = useState<VolunteerEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // testing with static user ID

  const currentUserId = 1;

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const response = await axios.get<MyEventsApiResponse>(
          `http://localhost:3000/api/v1/volunteer/my-events?userId=${currentUserId}`
        );
        if (response.data.success) {
          setJoinedEvents(response.data.data.events);
        } else {
          throw new Error('API did not return success');
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to fetch joined events.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyEvents();
  }, [currentUserId]);

  const handleCardClick = (id: number) => {
    navigate('/volunteer/detail/:id', { params: { id: String(id) } });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        {/* FIX: Responsive horizontal padding */}
        <div className="mx-auto flex max-w-6xl items-center px-4 py-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back</span>
          </button>
          {/* FIX: Responsive margin-left */}
          <h1 className="ml-4 text-xl font-bold text-gray-800 sm:ml-8">
            My Joined Events
          </h1>
        </div>
      </div>

      {/* Main Content */}
      {/* FIX: Responsive padding (horizontal and vertical) */}
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {isLoading && (
          <div className="text-center text-gray-500">Loading my events...</div>
        )}

        {error && (
          <div className="rounded-lg bg-red-100 p-4 text-center text-red-500">
            <strong>Error:</strong> {error}
          </div>
        )}

        {!isLoading && !error && joinedEvents.length === 0 && (
          <div className="text-center text-gray-500">
            You have not joined any events yet.
          </div>
        )}

        {!isLoading && !error && joinedEvents.length > 0 && (
          // This grid layout is already responsive and correct
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {joinedEvents.map((job) => (
              <div
                key={job.id}
                onClick={() => handleCardClick(job.id)}
                className="cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-lg"
              >
                <img
                  src={job.image_url || 'https://via.placeholder.com/300x160'}
                  alt={job.title}
                  className="h-40 w-full object-cover"
                />
                .tsx
                <div className="p-5">
                  <h3 className="mb-2 truncate text-lg font-semibold text-gray-800">
                    {job.title}
                  </h3>
                  <p className="mb-2 flex items-center text-sm text-gray-600">
                    <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                    {job.start_at
                      ? new Date(job.start_at).toLocaleDateString()
                      : 'Date TBD'}
                  </p>
                  <p className="mb-4 flex items-center text-sm text-gray-600">
                    <Users className="mr-2 h-4 w-4 flex-shrink-0" />
                    {job.current_participants}/{job.total_seats} Participants
                    ------------------
                  </p>
                  <div className="w-full rounded-full bg-gray-200 py-2 text-center font-medium text-gray-800">
                    You&apos;ve Joined
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserJoinPage;
