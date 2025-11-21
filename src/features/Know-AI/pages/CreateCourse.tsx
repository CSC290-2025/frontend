import { useState } from 'react';
import { useCreateCourse } from '../hooks/useCourse';
import CourseCoverUpload from '../components/CourseCoverUpload';
import VideoUpload from '../components/VideoUpload';
import type { CourseType, CreateCoursePayload } from '@/types/course';

export default function CreateCourse() {
  const { mutate: createCourse, isPending } = useCreateCourse();

  const [courseType, setCourseType] = useState<CourseType>('online');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [basicInfo, setBasicInfo] = useState({
    course_name: '',
    course_description: '',
  });

  const [videoData, setVideoData] = useState({
    video_name: '',
    video_description: '',
    duration_minutes: 0,
    video_file_path: '' as string | null,
  });

  const [onsiteData, setOnsiteData] = useState({
    address_id: undefined as number | undefined,
    event_at: '',
    registration_deadline: '',
    duration_hours: 0,
    total_seats: 1,
  });

  const handleSubmit = () => {
    if (!basicInfo.course_name) return alert('Please enter course name');

    const payload: CreateCoursePayload = {
      course_name: basicInfo.course_name,
      course_description: basicInfo.course_description || null,
      course_type: courseType,
      course_status: 'pending',
      cover_image: coverImage,
      author_id: null,
    };

    if (courseType === 'online') {
      payload.course_videos = [
        {
          video_name: videoData.video_name,
          video_description: videoData.video_description || null,
          duration_minutes: videoData.duration_minutes,
          video_order: 1,
          video_file_path: videoData.video_file_path,
        },
      ];
    } else if (courseType === 'onsite') {
      payload.onsite_sessions = [
        {
          address_id: onsiteData.address_id || null,
          duration_hours: onsiteData.duration_hours,
          total_seats: onsiteData.total_seats,
          event_at: onsiteData.event_at
            ? new Date(onsiteData.event_at).toISOString()
            : new Date().toISOString(),
          registration_deadline: onsiteData.registration_deadline
            ? new Date(onsiteData.registration_deadline).toISOString()
            : new Date().toISOString(),
        },
      ];
    }

    console.log('Submitting:', payload);
    createCourse(payload);
  };

  return (
    <div className="min-h-screen w-full bg-white p-6 font-sans text-black md:p-10 lg:p-16">
      <h1 className="mb-8 text-center text-3xl font-bold tracking-tight md:text-4xl lg:text-left">
        Create Course
      </h1>

      <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        <div className="flex w-full justify-center lg:w-1/2 lg:justify-center">
          <CourseCoverUpload
            currentImageUrl={coverImage}
            onUploadComplete={setCoverImage}
          />
        </div>
        <div className="flex w-full flex-col gap-6 md:gap-8 lg:w-1/2">
          <div className="space-y-2">
            <label className="text-lg font-medium">Course Title :</label>
            <input
              type="text"
              className="input-field h-12 px-6"
              value={basicInfo.course_name}
              onChange={(e) =>
                setBasicInfo({ ...basicInfo, course_name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-lg font-medium">Course Description :</label>
            <textarea
              rows={4}
              className="input-field rounded-2xl p-5"
              value={basicInfo.course_description}
              onChange={(e) =>
                setBasicInfo({
                  ...basicInfo,
                  course_description: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-3">
            <label className="text-lg font-medium">Course Type:</label>
            <div className="flex gap-4">
              {(['online', 'onsite'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setCourseType(type)}
                  className={`rounded-full px-6 py-2 font-semibold transition-all ${
                    courseType === type
                      ? type === 'online'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-orange-500 text-white shadow-md'
                      : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                  }`}
                >
                  {type === 'online' ? 'Online' : 'Onsite'}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border bg-gray-50 p-5 md:p-8">
            {courseType === 'online' ? (
              <div className="space-y-5">
                <h3 className="text-xl font-bold text-blue-600">
                  Video Details
                </h3>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="font-medium">Video Name</label>
                    <input
                      type="text"
                      className="input-field"
                      onChange={(e) =>
                        setVideoData({
                          ...videoData,
                          video_name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-medium">Duration (Min)</label>
                    <input
                      type="number"
                      className="input-field"
                      onChange={(e) =>
                        setVideoData({
                          ...videoData,
                          duration_minutes: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="font-medium">Description</label>
                  <input
                    type="text"
                    className="input-field"
                    onChange={(e) =>
                      setVideoData({
                        ...videoData,
                        video_description: e.target.value,
                      })
                    }
                  />
                </div>
                <VideoUpload
                  currentUrl={videoData.video_file_path}
                  onUploadComplete={(url) =>
                    setVideoData({ ...videoData, video_file_path: url })
                  }
                />
              </div>
            ) : (
              <div className="space-y-5">
                <h3 className="text-xl font-bold text-orange-600">
                  Event Details
                </h3>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="font-medium">Event Date</label>
                    <input
                      type="datetime-local"
                      className="input-field"
                      onChange={(e) =>
                        setOnsiteData({
                          ...onsiteData,
                          event_at: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-medium">Reg. Deadline</label>
                    <input
                      type="datetime-local"
                      className="input-field"
                      onChange={(e) =>
                        setOnsiteData({
                          ...onsiteData,
                          registration_deadline: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-medium">Duration (Hrs)</label>
                    <input
                      type="number"
                      step="0.5"
                      className="input-field"
                      onChange={(e) =>
                        setOnsiteData({
                          ...onsiteData,
                          duration_hours: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-medium">Address ID</label>
                    <input
                      type="number"
                      className="input-field"
                      onChange={(e) =>
                        setOnsiteData({
                          ...onsiteData,
                          address_id: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 pb-10 lg:pb-0">
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className={`rounded-2xl px-10 py-3 text-xl font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95 ${isPending ? 'cursor-wait bg-gray-400' : 'bg-green-400 hover:bg-green-500'}`}
            >
              {isPending ? 'Creating...' : 'create!'}
            </button>
          </div>
        </div>
      </div>

      <style>{`.input-field { width: 100%; border-radius: 9999px; background-color: white; border: 1px solid #e5e7eb; padding: 0.5rem 1rem; outline: none; } .input-field:focus { ring: 2px; ring-color: #bfdbfe; }`}</style>
    </div>
  );
}
