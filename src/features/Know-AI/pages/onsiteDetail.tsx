import { useState } from 'react';
import { useParams } from '@/router';
import { useCourseById } from '../hooks/useCourse';
import { useTravelDuration } from '../hooks/useTravelTime';
import { useAddress } from '../hooks/useAddress';
import { formatAddressToString } from '../api/knowAi.api';
import EnrollmentPopup from '../components/EnrollmentPopup';

export default function OnsiteDetail() {
  const { id } = useParams('/Know-AI/:course/:id');
  const { data: course, isLoading, isError } = useCourseById(id);

  const [showTransportation, setShowTransportation] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const userAddressId = 33; // Mock User ID
  const session = course?.onsite_sessions?.[0];
  const courseAddressId = session?.address_id;

  const {
    data: duration,
    isLoading: isCalculating,
    error: calcError,
  } = useTravelDuration(userAddressId, courseAddressId, showTransportation);

  const { data: addressData, isLoading: isAddressLoading } =
    useAddress(courseAddressId);

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center text-lg">
        Loading course details...
      </div>
    );
  if (isError || !course)
    return (
      <div className="flex h-screen items-center justify-center text-lg text-red-500">
        Course not found
      </div>
    );

  const eventDate = session ? new Date(session.event_at) : null;
  const dateString = eventDate
    ? eventDate.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '-';
  const startTime = eventDate
    ? eventDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    : '-';

  let endTime = '-';
  if (eventDate && session?.duration_hours) {
    const endDate = new Date(
      eventDate.getTime() + session.duration_hours * 60 * 60 * 1000
    );
    endTime = endDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  return (
    <div className="flex flex-col gap-y-6 p-10">
      {/* Cover Image */}
      <div className="flex justify-start gap-x-4">
        <div className="h-100 w-full overflow-hidden rounded-4xl bg-gray-200">
          {course.cover_image ? (
            <img
              src={course.cover_image}
              alt={course.course_name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-amber-600 text-2xl text-white">
              No Cover Image
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column - Course Info */}
        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <h1 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            {course.course_name}
          </h1>

          <p className="mb-6 leading-relaxed text-gray-600">
            {course.course_description || 'No description provided.'}
          </p>

          <div className="mb-8 space-y-4">
            <div>
              <h2 className="mb-2 text-xl font-semibold text-[#01CCFF]">
                Instructor ID: {course.author_id || '-'}
              </h2>
            </div>

            <div>
              <p className="text-gray-900">
                <span className="font-medium">Date:</span> {dateString}
              </p>
              <p className="mt-1 text-gray-900">
                <span className="font-medium">Time:</span> {startTime} -{' '}
                {endTime}
                <span className="ml-2 text-[#01CCFF]">
                  ({session?.duration_hours || 0} hours)
                </span>
              </p>
            </div>

            <div>
              <p className="text-gray-900">
                <span className="font-medium">Total Seats:</span>
                <span className="ml-2 text-xl font-bold text-[#01CCFF]">
                  {session?.total_seats || 0}
                </span>
                <span className="ml-1">seats</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsPopupOpen(true)}
            className="rounded-full bg-[#7FFF7F] px-12 py-4 text-lg font-semibold text-white shadow-md transition-colors duration-200 hover:bg-[#6FEF6F]"
          >
            Enroll now!
          </button>
        </div>

        {/* Right Column - Location Info */}
        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <h1 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            Location Details
          </h1>

          <div className="mb-8">
            {isAddressLoading ? (
              <p className="animate-pulse text-gray-400">Loading address...</p>
            ) : addressData ? (
              <>
                <p className="mb-2 text-xl font-medium text-gray-800">
                  {formatAddressToString(addressData)}
                </p>
                <p className="text-sm text-gray-500">
                  {addressData.province}, {addressData.postal_code}
                </p>
              </>
            ) : (
              <p className="text-red-400">
                Location ID: {courseAddressId || 'N/A'}
              </p>
            )}
          </div>

          <h2 className="mb-6 text-xl font-semibold text-gray-900">
            Transportation :
          </h2>

          <div className="space-y-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-4">
                <span className="w-40 font-medium text-gray-900">
                  Personal Car
                </span>
                {showTransportation && (
                  <span className="font-medium text-gray-600">
                    {isCalculating ? (
                      <span className="animate-pulse text-gray-400">
                        Calculating...
                      </span>
                    ) : calcError ? (
                      <span className="text-sm text-red-400">Distance N/A</span>
                    ) : (
                      <>
                        ~{' '}
                        <span className="text-lg font-bold text-[#01CCFF]">
                          {duration}
                        </span>
                      </>
                    )}
                  </span>
                )}
              </div>
              {showTransportation && !isCalculating && duration && (
                <p className="ml-44 text-[10px] text-gray-400">
                  (From user address ID: {userAddressId})
                </p>
              )}
            </div>

            <div>
              <h3 className="mb-4 font-medium text-gray-900">
                Public Transportation
              </h3>

              {!showTransportation ? (
                <button
                  onClick={() => setShowTransportation(true)}
                  className="rounded-full bg-[#01CCFF] px-6 py-3 font-semibold text-white transition-colors duration-200 hover:bg-[#00B8E6]"
                >
                  Share your location
                </button>
              ) : (
                <div className="flex flex-wrap gap-3">
                  <div className="min-w-20 rounded-full bg-[#01CCFF] px-6 py-3 text-center font-bold text-white">
                    21E
                  </div>
                  <div className="flex min-w-20 flex-col items-center rounded-full bg-[#01CCFF] px-6 py-3 text-center leading-tight font-bold text-white">
                    <div className="text-xs">BTS</div>
                    <div>Siam</div>
                  </div>
                  <div className="min-w-20 rounded-full bg-[#01CCFF] px-6 py-3 text-center font-bold text-white">
                    Taxi
                  </div>
                  <div className="min-w-20 rounded-full bg-[#01CCFF] px-6 py-3 text-center font-bold text-white">
                    Ferry
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Popup */}
      {isPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsPopupOpen(false)}
          />
          <div className="relative z-10">
            <EnrollmentPopup />
          </div>
        </div>
      )}
    </div>
  );
}
