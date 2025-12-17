import { useState } from 'react';
import { useParams } from '@/router';
import { useCourseById, useEnrollCourse } from '../hooks/useCourse';
import { useCurrentUser, useMyProfile } from '../hooks/useUser';
import { useTravelDuration } from '../hooks/useTravelTime';
import { useAddress } from '../hooks/useAddress';
import { useTransitLines } from '../hooks/useTransitLines';
import { formatAddressToString } from '../api/knowAi.api';
import EnrollCourseModal from '../components/EnrollmentPopup';
import { useGetAuthMe } from '@/api/generated/authentication';
import Layout from '@/components/main/Layout';

export default function OnsiteDetail() {
  const { id } = useParams('/Know-AI/:course/:id');
  const { data: course, isLoading, isError } = useCourseById(id);

  const { data: authData } = useGetAuthMe();
  const userId = authData?.data?.userId ?? null;
  const { data: users } = useCurrentUser();
  const { data: profile } = useMyProfile(userId ?? 0);

  const [showTransportation, setShowTransportation] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  const { mutate: enrollCourse } = useEnrollCourse();

  const userAddressString =
    profile?.address && profile.address !== 'N/A' ? profile.address : undefined;

  const session = course?.onsite_sessions?.[0];
  const courseAddressId = session?.address_id;

  const { data: addressData, isLoading: isAddressLoading } =
    useAddress(courseAddressId);

  const {
    data: duration,
    isLoading: isCalculating,
    error: calcError,
  } = useTravelDuration(userAddressString, courseAddressId, showTransportation);

  const { data: transitLines, isLoading: isTransitLoading } = useTransitLines(
    userAddressString,
    courseAddressId,
    showTransportation
  );

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

  const courseDetail = {
    id: course.id,
    course_name: course.course_name,
    teacher: `Instructor ID: ${course.author_id}`,
    time: `${startTime} - ${endTime}`,
    place: addressData ? formatAddressToString(addressData) : 'Loading...',
    onsite_session_id: session?.id,
  };

  const userDetail = {
    id: userId ?? 0,
    firstname: profile?.firstName || '',
    lastname: profile?.lastName || '',
    phone_number: users?.phone || '',
    email: users?.email || '',
  };

  const handleConfirmEnroll = () => {
    if (!session?.id || !userId) return;
    enrollCourse({ onsite_id: session.id, user_id: userId });
    setShowEnrollModal(false);
  };

  return (
    <Layout>
      <div className="flex flex-col gap-y-6 p-10">
        <div className="flex justify-start gap-x-4">
          <div className="h-100 w-full overflow-hidden rounded-4xl bg-gray-200">
            {course.cover_image && (
              <img
                src={course.cover_image}
                alt={course.course_name}
                className="h-full w-full object-cover"
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
            <h1 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              {course.course_name}
            </h1>
            <p className="mb-6 leading-relaxed text-gray-600">
              {course.course_description}
            </p>
            <div className="mb-8 space-y-4 text-gray-900">
              <p>
                <span className="font-medium text-[#01CCFF]">Date:</span>{' '}
                {dateString}
              </p>
              <p>
                <span className="font-medium">Time:</span> {startTime} -{' '}
                {endTime}{' '}
                <span className="ml-2 text-[#01CCFF]">
                  ({session?.duration_hours} hours)
                </span>
              </p>
            </div>
            <button
              onClick={() => setShowEnrollModal(true)}
              className="rounded-full bg-[#7FFF7F] px-12 py-4 text-lg font-semibold text-white shadow-md hover:bg-[#6FEF6F]"
            >
              Enroll now!
            </button>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
            <h1 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              Location Details
            </h1>
            <div className="mb-8">
              {isAddressLoading ? (
                <p className="animate-pulse text-gray-400">
                  Loading address...
                </p>
              ) : (
                addressData && (
                  <p className="text-xl font-medium text-gray-800">
                    {formatAddressToString(addressData)}
                  </p>
                )
              )}
            </div>

            <h2 className="mb-6 text-xl font-semibold text-gray-900">
              Transportation :
            </h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="w-40 font-medium text-gray-900">
                  Personal Car
                </span>
                {showTransportation && (
                  <span className="font-medium text-gray-600">
                    {isCalculating
                      ? 'Calculating...'
                      : duration
                        ? `~ ${duration} mins`
                        : 'Distance N/A'}
                  </span>
                )}
              </div>

              <div>
                <h3 className="mb-4 font-medium text-gray-900">
                  Public Transportation
                </h3>
                {!showTransportation ? (
                  <button
                    onClick={() => setShowTransportation(true)}
                    className="rounded-full bg-[#01CCFF] px-6 py-3 font-semibold text-white hover:bg-[#00B8E6]"
                  >
                    Share your location
                  </button>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {isTransitLoading ? (
                      <span className="animate-pulse text-sm text-gray-400">
                        Finding transit lines...
                      </span>
                    ) : (
                      transitLines?.map((line, idx) => (
                        <div
                          key={idx}
                          className="flex min-w-20 items-center justify-center rounded-full bg-[#01CCFF] px-5 py-3 text-xs font-bold text-white shadow-sm"
                        >
                          {line}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <EnrollCourseModal
          isOpen={showEnrollModal}
          onClose={() => setShowEnrollModal(false)}
          courseDetail={courseDetail}
          userDetail={userDetail}
          onConfirmEnroll={handleConfirmEnroll}
        />
      </div>
    </Layout>
  );
}
