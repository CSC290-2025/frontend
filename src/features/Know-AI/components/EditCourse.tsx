import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import type { Course, CourseVideo } from '@/types/course';

interface EditCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  onSave: (updatedCourse: Course) => void;
}

export default function EditCourseModal({
  isOpen,
  onClose,
  course,
  onSave,
}: EditCourseModalProps) {
  const [formData, setFormData] = useState<Course>(course);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          cover_image: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (videoId: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      course_videos: prev.course_videos?.map((video) =>
        video.id === videoId ? { ...video, [field]: value } : video
      ),
    }));
  };

  const handleDeleteVideo = (videoId: number) => {
    setFormData((prev) => ({
      ...prev,
      course_videos: prev.course_videos?.filter(
        (video) => video.id !== videoId
      ),
    }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Edit Course</h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Course Title */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Course Title:
            </label>
            <input
              type="text"
              name="course_name"
              value={formData.course_name}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Course Description */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Course Description:
            </label>
            <textarea
              name="course_description"
              value={formData.course_description}
              onChange={handleInputChange}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Course Type Badge */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Course Type:
            </label>
            <span
              className={`inline-block rounded-full px-4 py-1 text-sm font-medium ${
                formData.course_type === 'online'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-orange-100 text-orange-600'
              }`}
            >
              {formData.course_type}
            </span>
          </div>

          {/* Cover Image */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Cover Image:
            </label>
            <div className="flex items-center gap-4">
              {formData.cover_image && (
                <img
                  src={formData.cover_image}
                  alt="Cover"
                  className="h-20 w-32 rounded-lg object-cover"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverImageChange}
                className="rounded-2xl bg-amber-100 text-sm text-gray-600"
              />
            </div>
          </div>

          {/* Online Course - Video Details */}
          {formData.course_type === 'online' && formData.course_videos && (
            <div className="space-y-3 rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900">Video Details:</h3>
              {formData.course_videos.map((video) => (
                <div
                  key={video.id}
                  className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={video.video_name}
                        onChange={(e) =>
                          handleVideoChange(
                            video.id,
                            'video_name',
                            e.target.value
                          )
                        }
                        placeholder="Video Name"
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                      />
                      <input
                        type="text"
                        value={video.video_file_path}
                        onChange={(e) =>
                          handleVideoChange(
                            video.id,
                            'video_file_path',
                            e.target.value
                          )
                        }
                        placeholder="Video URL"
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                      />
                    </div>
                    <button
                      onClick={() => handleDeleteVideo(video.id)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Onsite Course - Event Details */}
          {formData.course_type === 'onsite' && (
            <div className="space-y-3 rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900">Event Details:</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Event Date:
                  </label>
                  <input
                    type="date"
                    name="event_date"
                    value={formData.event_date || ''}
                    onChange={handleInputChange}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Duration (Hrs):
                  </label>
                  <input
                    type="number"
                    name="duration_hrs"
                    value={formData.duration_hrs || ''}
                    onChange={handleInputChange}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Reg. Deadline:
                  </label>
                  <input
                    type="date"
                    name="reg_deadline"
                    value={formData.reg_deadline || ''}
                    onChange={handleInputChange}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Address:
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address || ''}
                    onChange={handleInputChange}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={handleSave}
            className="rounded-full bg-green-400 px-6 py-2 font-medium text-white transition-colors hover:bg-green-500"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="rounded-full bg-red-500 px-6 py-2 font-medium text-white transition-colors hover:bg-red-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
