import { useNavigate } from '@/router';
import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import {
  useApproveCourse,
  useDeleteCourse,
  useUpdateCourse,
} from '../hooks/useAdmin';
import ApproveConfirmModal from './ApprovePopup';
import DeclineConfirmModal from './DeclinePopup';
import EditCourseModal from './EditCourse';

export default function PendingCard({ course }: { course: any }) {
  const navigate = useNavigate();
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleClick = () => {
    navigate('/Know-AI/:course/:id', {
      params: {
        course: 'courses',
        id: String(course.id),
      },
    });
  };

  const { mutate: approveCourse, isPending } = useApproveCourse();
  const { mutate: deleteCourse } = useDeleteCourse();
  const { mutate: updateCourseAction } = useUpdateCourse();

  const handleApprove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowApproveModal(true);
  };

  const handleConfirmApprove = () => {
    // Approve API call here
    approveCourse(course.id);
    console.log('Approved course:', course.id);
    // Example: approveCourse(course.id);
    setShowApproveModal(false);
  };

  const handleDecline = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeclineModal(true);
    console.log('Decline:', course.id);
  };

  const handleConfirmDecline = () => {
    // Decline(Delete) API call here Chokun add here loei
    deleteCourse(course.id);
    console.log('Decline course:', course.id);
    // Example: approveCourse(course.id);
    setShowDeclineModal(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditModal(true);
    console.log('Edit:', course.id);
  };
  const handleConfirmEdit = (updatedData: any) => {
    updateCourseAction({
      id: course.id,
      data: updatedData,
    });
    console.log('Updating course:', course.id);
    setShowEditModal(false);
  };

  const getBadgeStyle = (type: string) => {
    if (type === 'online') return 'bg-blue-100 text-blue-600';
    if (type === 'onsite') return 'bg-orange-100 text-orange-600';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <>
      <div
        onClick={handleClick}
        className="grid h-full w-full cursor-pointer grid-rows-[auto_1fr] overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-200 hover:opacity-90 active:scale-95 active:brightness-90"
      >
        {/* Cover Image */}
        <div className="relative h-40 w-full bg-gray-200 sm:h-48 md:h-56 lg:h-64">
          {course.cover_image ? (
            <img
              src={course.cover_image}
              alt={course.course_name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              <span className="text-xs sm:text-sm">No Image</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-2 p-4">
          {/* Course Name */}
          <h3 className="line-clamp-1 text-base font-bold text-gray-900 sm:text-lg md:text-xl">
            {course.course_name}
          </h3>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={handleApprove}
              className="rounded-full bg-green-400 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-500"
            >
              Approve
            </button>
            <button
              onClick={handleDecline}
              className="rounded-full bg-red-500 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-600"
            >
              Decline
            </button>
            <button
              onClick={handleEdit}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 transition-colors hover:bg-gray-300"
            >
              <Pencil className="h-4 w-4 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Approve Confirmation Modal */}
      <ApproveConfirmModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleConfirmApprove}
      />

      {/* Decline Confirmation Modal */}
      <DeclineConfirmModal
        isOpen={showDeclineModal}
        onClose={() => setShowDeclineModal(false)}
        onConfirm={handleConfirmDecline}
      />

      {/* Edit Confirmation Modal */}
      <EditCourseModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        course={course}
        onSave={handleConfirmEdit}
      />
    </>
  );
}
