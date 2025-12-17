import { useState } from 'react';
import { X } from 'lucide-react';

interface CourseDetail {
  id: number;
  course_name: string;
  teacher: string;
  time: string;
  place: string;
}

interface UserDetail {
  firstname: string;
  lastname: string;
  phone_number: string;
  email: string;
}

interface EnrollCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseDetail: CourseDetail;
  userDetail: UserDetail;
  onConfirmEnroll: () => void;
}

export default function EnrollCourseModal({
  isOpen,
  onClose,
  courseDetail,
  userDetail,
  onConfirmEnroll,
}: EnrollCourseModalProps) {
  const [isConfirmed, setIsConfirmed] = useState(false);

  if (!isOpen) return null;

  const handleEnrollNow = () => {
    setIsConfirmed(true);
    onConfirmEnroll();
  };

  const handleClose = () => {
    setIsConfirmed(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 transition-colors hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Content */}
        {!isConfirmed ? (
          // Enrollment Form
          <div>
            <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
              Enroll Course
            </h2>

            <div className="space-y-4">
              {/* User Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Firstname
                  </label>
                  <input
                    type="text"
                    value={userDetail.firstname}
                    disabled
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-700"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Lastname
                  </label>
                  <input
                    type="text"
                    value={userDetail.lastname}
                    disabled
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={userDetail.phone_number}
                    disabled
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-700"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="text"
                    value={userDetail.email}
                    disabled
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-700"
                  />
                </div>
              </div>

              {/* Course Details */}
              <div className="mt-6 space-y-2 border-t pt-4">
                <h3 className="font-semibold text-gray-900">Detail</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Course:</span>
                    <span className="font-medium text-cyan-500">
                      {courseDetail.course_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Teacher:</span>
                    <span className="font-medium text-cyan-500">
                      {courseDetail.teacher}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium text-cyan-500">
                      {courseDetail.time}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Place:</span>
                    <span className="font-medium text-cyan-500">
                      {courseDetail.place}
                    </span>
                  </div>
                </div>
              </div>

              {/* Enroll Button */}
              <button
                onClick={handleEnrollNow}
                className="mt-6 w-full rounded-full bg-green-400 py-3 text-lg font-medium text-white transition-colors hover:bg-green-500 active:scale-95"
              >
                Enroll now!
              </button>
            </div>
          </div>
        ) : (
          // Confirmation View
          <div>
            <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
              Confirmed Enroll
            </h2>

            <div className="space-y-4">
              {/* Attendee Information */}
              <div>
                <h3 className="mb-3 font-semibold text-gray-900">Attendee</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Firstname:</span>
                    <span className="font-medium text-cyan-500">
                      {userDetail.firstname}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lastname:</span>
                    <span className="font-medium text-cyan-500">
                      {userDetail.lastname}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone Number:</span>
                    <span className="font-medium text-cyan-500">
                      {userDetail.phone_number}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-cyan-500">
                      {userDetail.email}
                    </span>
                  </div>
                </div>
              </div>

              {/* Course Details */}
              <div className="border-t pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Course:</span>
                    <span className="font-medium text-cyan-500">
                      {courseDetail.course_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Teacher:</span>
                    <span className="font-medium text-cyan-500">
                      {courseDetail.teacher}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium text-cyan-500">
                      {courseDetail.time}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Place:</span>
                    <span className="font-medium text-cyan-500">
                      {courseDetail.place}
                    </span>
                  </div>
                </div>
              </div>

              {/* Done Button */}
              <button
                onClick={handleClose}
                className="mt-6 w-full rounded-full bg-green-400 py-3 text-lg font-medium text-white transition-colors hover:bg-green-500 active:scale-95"
              >
                Enroll now!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
