import { useState } from 'react';
import { useCreateCourse } from '../hooks/useCourse';
import CourseCoverUpload from '../components/CourseCoverUpload';
import VideoUpload from '../components/VideoUpload';
import { createAddress, createVolunteerEvent } from '../api/knowAi.api';
import type {
  CourseType,
  CreateCoursePayload,
  AddressData,
} from '@/types/course';
import type { CreateCourseVideo } from '@/types/course';
import Layout from '@/components/main/Layout';

interface VideoFormState extends CreateCourseVideo {
  id: number;
  video_order: number;
  video_file_path: string | null;
}

interface VideoInputFormProps {
  video: VideoFormState;
  updateVideoField: (id: number, field: string, value: any) => void;
}

const VideoInputForm = ({ video, updateVideoField }: VideoInputFormProps) => {
  return (
    <div className="space-y-5 rounded-xl border border-blue-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-blue-800">
        Video Lesson #{video.video_order}
      </h3>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className="font-medium text-gray-700">Video Name</label>
          <input
            type="text"
            className="input-field"
            value={video.video_name}
            onChange={(e) =>
              updateVideoField(video.id, 'video_name', e.target.value)
            }
          />
        </div>
        <div className="space-y-2">
          <label className="font-medium text-gray-700">Duration (Min)</label>
          <input
            type="number"
            className="input-field"
            value={video.duration_minutes || ''}
            onChange={(e) =>
              updateVideoField(
                video.id,
                'duration_minutes',
                parseInt(e.target.value) || 0
              )
            }
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="font-medium text-gray-700">Description</label>
        <input
          type="text"
          className="input-field"
          value={video.video_description || ''}
          onChange={(e) =>
            updateVideoField(video.id, 'video_description', e.target.value)
          }
        />
      </div>
      <VideoUpload
        currentUrl={video.video_file_path}
        onUploadComplete={(url) =>
          updateVideoField(video.id, 'video_file_path', url)
        }
      />
    </div>
  );
};

export default function CreateCourse() {
  const { mutate: createCourse, isPending } = useCreateCourse();

  const [courseType, setCourseType] =
    useState<Exclude<CourseType, 'online_and_onsite'>>('online');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [basicInfo, setBasicInfo] = useState({
    course_name: '',
    course_description: '',
  });
  const [volunteerNeed, setVolunteerNeed] = useState<number>(0);

  const [addressForm, setAddressForm] = useState<AddressData>({
    address_line: '',
    province: '',
    district: '',
    subdistrict: '',
    postal_code: '',
  });

  const [videoList, setVideoList] = useState<VideoFormState[]>([
    {
      id: Date.now(),
      video_name: '',
      video_description: '',
      duration_minutes: 0,
      video_file_path: null,
      video_order: 1,
    },
  ]);

  const [onsiteData, setOnsiteData] = useState({
    event_at: '',
    registration_deadline: '',
    duration_hours: 0,
    total_seats: 1,
  });

  const updateVideoField = (id: number, field: string, value: any) => {
    setVideoList((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const addVideo = () => {
    setVideoList((prev) => [
      ...prev,
      {
        id: Date.now(),
        video_name: '',
        video_description: '',
        duration_minutes: 0,
        video_file_path: null,
        video_order: prev.length + 1,
      },
    ]);
  };

  const handleSubmit = async () => {
    if (!basicInfo.course_name) return alert('Please enter course name');

    try {
      let finalAddressId: number | null = null;

      if (courseType === 'onsite') {
        if (!addressForm.address_line || !addressForm.province)
          return alert('Please complete location details.');
        const newAddr = await createAddress(addressForm);
        finalAddressId = newAddr.id;
      }

      if (courseType === 'onsite' && volunteerNeed > 0 && finalAddressId) {
        const volunteerPayload = {
          title: `Volunteer: ${basicInfo.course_name}`,
          description:
            basicInfo.course_description ||
            `Volunteer needed for ${basicInfo.course_name} course.`,
          image_url: coverImage,
          total_seats: volunteerNeed,
          start_at: onsiteData.event_at
            ? new Date(onsiteData.event_at).toISOString()
            : new Date().toISOString(),
          end_at: onsiteData.event_at
            ? new Date(
                new Date(onsiteData.event_at).getTime() +
                  onsiteData.duration_hours * 3600000
              ).toISOString()
            : new Date().toISOString(),
          registration_deadline: onsiteData.registration_deadline
            ? new Date(onsiteData.registration_deadline).toISOString()
            : new Date().toISOString(),
          department_id: 1,
          address_id: finalAddressId,
          created_by_user_id: 1,
        };
        await createVolunteerEvent(volunteerPayload);
      }

      const coursePayload: CreateCoursePayload = {
        course_name: basicInfo.course_name,
        course_description: basicInfo.course_description || null,
        course_type: courseType,
        course_status: 'pending',
        cover_image: coverImage,
        author_id: null,
      };

      if (courseType === 'online') {
        coursePayload.course_videos = videoList
          .filter((v) => v.video_file_path || v.video_name)
          .map((v) => ({
            video_name: v.video_name || `Video ${v.video_order}`,
            video_description: v.video_description || null,
            duration_minutes: v.duration_minutes,
            video_order: v.video_order,
            video_file_path: v.video_file_path,
          }));
      } else {
        coursePayload.onsite_sessions = [
          {
            address_id: finalAddressId,
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

      createCourse(coursePayload);
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to process. Please check your data.');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen w-full bg-white p-6 md:p-10 lg:p-16">
        <h1 className="mb-8 text-center text-3xl font-bold md:text-4xl lg:text-left">
          Create Course
        </h1>
        <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-start">
          <div className="flex w-full justify-center lg:w-1/2">
            <CourseCoverUpload
              currentImageUrl={coverImage}
              onUploadComplete={setCoverImage}
            />
          </div>

          <div className="flex w-full flex-col gap-6 lg:w-1/2">
            <div className="space-y-2">
              <label className="text-lg font-medium">Course Title</label>
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
              <label className="text-lg font-medium">Description</label>
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
              <label className="text-lg font-medium">Course Type</label>
              <div className="flex gap-4">
                <button
                  onClick={() => setCourseType('online')}
                  className={`rounded-full px-6 py-2 font-semibold ${courseType === 'online' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}
                >
                  Online
                </button>
                <button
                  onClick={() => setCourseType('onsite')}
                  className={`rounded-full px-6 py-2 font-semibold ${courseType === 'onsite' ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}
                >
                  Onsite
                </button>
              </div>
            </div>

            <div className="rounded-2xl border bg-gray-50 p-5 md:p-8">
              {courseType === 'online' ? (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-blue-600">
                    Video Lessons ({videoList.length})
                  </h3>
                  {videoList.map((video) => (
                    <VideoInputForm
                      key={video.id}
                      video={video}
                      updateVideoField={updateVideoField}
                    />
                  ))}
                  <button
                    onClick={addVideo}
                    className="rounded-full bg-blue-500 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-600"
                  >
                    + Add Another Video
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <h3 className="text-xl font-bold text-orange-600">
                    Location & Session
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="col-span-2 space-y-2">
                      <label className="text-sm font-medium">
                        Address Line
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        value={addressForm.address_line}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            address_line: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Subdistrict</label>
                      <input
                        type="text"
                        className="input-field"
                        value={addressForm.subdistrict}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            subdistrict: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">District</label>
                      <input
                        type="text"
                        className="input-field"
                        value={addressForm.district}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            district: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Province</label>
                      <input
                        type="text"
                        className="input-field"
                        value={addressForm.province}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            province: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Postal Code</label>
                      <input
                        type="text"
                        className="input-field"
                        value={addressForm.postal_code}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            postal_code: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 border-t pt-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Event Date
                      </label>
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
                      <label className="text-sm font-medium text-gray-700">
                        Reg. Deadline
                      </label>
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
                      <label className="font-medium text-gray-700">
                        Duration (Hrs)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        className="input-field"
                        onChange={(e) =>
                          setOnsiteData({
                            ...onsiteData,
                            duration_hours: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Total Course Seats
                      </label>
                      <input
                        type="number"
                        className="input-field"
                        min="1"
                        onChange={(e) =>
                          setOnsiteData({
                            ...onsiteData,
                            total_seats: parseInt(e.target.value) || 1,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Volunteer Need
                      </label>
                      <input
                        type="number"
                        className="input-field"
                        min="0"
                        value={volunteerNeed}
                        onChange={(e) =>
                          setVolunteerNeed(parseInt(e.target.value) || 0)
                        }
                        placeholder="Specify amount if needed"
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
                className={`rounded-2xl px-10 py-3 text-xl font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95 ${isPending ? 'bg-gray-400' : 'bg-green-400 hover:bg-green-500'}`}
              >
                {isPending ? 'Creating...' : 'create!'}
              </button>
            </div>
          </div>
        </div>
        <style>{`.input-field { width: 100%; border-radius: 9999px; background-color: white; border: 1px solid #e5e7eb; padding: 0.5rem 1rem; outline: none; } .input-field:focus { border-color: #01CCFF; }`}</style>
      </div>
    </Layout>
  );
}
