import { useState, useEffect } from 'react';
import { useParams } from '@/router';
import { useCourseById } from '../hooks/useCourse';
import EnrollmentPopup from '../components/EnrollmentPopup';
import type { CourseVideo } from '@/types/course';

export default function OnlineDetail() {
  const { id } = useParams('/Know-AI/:course/:id');
  const { data: course, isLoading, isError } = useCourseById(id);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<CourseVideo | null>(null);
  const videos: CourseVideo[] = course?.course_videos || [];

  useEffect(() => {
    if (videos.length > 0 && !selectedVideo) {
      setSelectedVideo(videos.find((v) => v.video_order === 1) || videos[0]);
    }
  }, [course, videos, selectedVideo]);

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

  const totalDuration = videos.reduce(
    (sum, video) => sum + (video.duration_minutes || 0),
    0
  );
  const courseType = course.course_type.toUpperCase();

  return (
    <div className="flex flex-col gap-y-6 p-10">
      {/* Cover Image */}
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
              {courseType} Course
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-sm font-bold ${
                courseType === 'ONLINE'
                  ? 'bg-blue-100 text-blue-600'
                  : courseType === 'ONSITE'
                    ? 'bg-orange-100 text-orange-600'
                    : 'bg-purple-100 text-purple-600'
              }`}
            >
              {courseType}
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
                <span className="font-medium">Total Lessons:</span>{' '}
                {videos.length} Lessons
              </p>
              <p className="mt-1 text-gray-900">
                <span className="font-medium">Total Duration:</span>{' '}
                <span className="font-bold text-[#01CCFF]">
                  {totalDuration}
                </span>{' '}
                Minutes
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
            <h1 className="mb-4 text-2xl font-bold text-gray-900">
              Course Preview: {selectedVideo?.video_name || 'Course Intro'}
            </h1>

            <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-inner">
              {selectedVideo && selectedVideo.video_file_path ? (
                <video
                  controls
                  className="h-full w-full"
                  src={selectedVideo.video_file_path}
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
                  <span>Select a video from the list below</span>
                </div>
              )}
            </div>

            <div className="mt-6">
              <h3 className="mb-2 text-lg font-semibold text-gray-800">
                {selectedVideo?.video_name || 'No video selected'}
              </h3>
              <p className="text-sm text-gray-500">
                {selectedVideo?.video_description ||
                  'This section provides a detailed view of the selected lesson.'}
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
                <span>{selectedVideo?.duration_minutes || 0} Minutes</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Course Content (Playlist)
            </h2>
            <div className="max-h-80 space-y-3 overflow-y-auto pr-2">
              {videos.map((video) => (
                <div
                  key={video.video_order}
                  onClick={() => setSelectedVideo(video)}
                  className={`flex cursor-pointer items-center justify-between rounded-xl p-4 transition-colors ${
                    selectedVideo?.video_order === video.video_order
                      ? 'border-2 border-blue-400 bg-blue-50'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex flex-col">
                    <span
                      className={`font-semibold ${selectedVideo?.video_order === video.video_order ? 'text-blue-700' : 'text-gray-800'}`}
                    >
                      {video.video_order}. {video.video_name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {video.video_description || 'No description.'}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-medium ${selectedVideo?.video_order === video.video_order ? 'text-blue-600' : 'text-gray-500'}`}
                  >
                    {video.duration_minutes || 0} min
                  </span>
                </div>
              ))}
              {videos.length === 0 && (
                <p className="text-sm text-gray-400 italic">
                  No video content available for this course.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
