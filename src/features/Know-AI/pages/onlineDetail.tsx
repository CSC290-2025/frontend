import { useState } from 'react';
import { useParams } from '@/router';
import { useCourseById } from '../hooks/useCourse';
import EnrollmentPopup from '../components/EnrollmentPopup';

export default function OnlineDetail() {
  const { id } = useParams('/Know-AI/:course/:id');
  const { data: course, isLoading, isError } = useCourseById(id);

  const [isPopupOpen, setIsPopupOpen] = useState(false);

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center text-lg">
        Loading...
      </div>
    );
  if (isError || !course)
    return (
      <div className="flex h-screen items-center justify-center text-lg text-red-500">
        Course not found
      </div>
    );

  const videos = course.course_videos || [];
  const mainVideo = videos.length > 0 ? videos[0] : null;

  return (
    <div className="flex flex-col gap-y-6 p-10">
      <div className="flex justify-start gap-x-4">
        <div className="h-80 w-full overflow-hidden rounded-4xl bg-gray-200">
          {course.cover_image ? (
            <img
              src={course.cover_image}
              alt={course.course_name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-blue-600 text-2xl text-white">
              Online Course
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-600">
              ONLINE
            </span>
            <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
              {course.course_name}
            </h1>
          </div>

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
                <span className="font-medium">Total Videos:</span>{' '}
                {videos.length} Lessons
              </p>
              <p className="mt-1 text-gray-900">
                <span className="font-medium">Main Topic:</span>{' '}
                {mainVideo?.video_name || '-'}
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

        <div className="flex flex-col rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            Course Preview
          </h1>

          <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-inner">
            {mainVideo && mainVideo.video_file_path ? (
              <video
                controls
                className="h-full w-full"
                src={mainVideo.video_file_path}
                poster={course.cover_image || undefined}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-12 w-12"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z"
                  />
                </svg>
                <span>No Video Available</span>
              </div>
            )}
          </div>

          <div className="mt-6">
            <h3 className="mb-2 text-lg font-semibold text-gray-800">
              {mainVideo?.video_name || 'Course Intro'}
            </h3>
            <p className="text-sm text-gray-500">
              {mainVideo?.video_description ||
                'Watch this introduction to understand the core concepts of this course.'}
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{mainVideo?.duration_minutes || 0} Minutes</span>
            </div>
          </div>
        </div>
      </div>

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
