import { useNavigate } from '@/router';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import DeleteConfirmModal from './DeletePopup';
import EditCourseModal from './EditCourse';

export default function AdminCard({ course }: { course: any }) {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleClick = () => {
    navigate('/Know-AI/:course/:id', {
      params: {
        course: 'courses',
        id: String(course.id),
      },
    });
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditModal(true);
    console.log('Edit:', course.id);
  };
  const handleConfirmEdit = () => {
    // Edit API call here Chokun add hereeee

    console.log('Edit course:', course.id);
    // Example: approveCourse(course.id);
    setShowEditModal(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
    console.log('Delete:', course.id);
  };

  const handleConfirmDelete = () => {
    // Delte API call here

    console.log('Deleted course:', course.id);
    // Example: approveCourse(course.id);
    setShowDeleteModal(false);
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
          <div className="flex items-center justify-between gap-2">
            <span
              className={`rounded-full px-2 py-1 text-[10px] font-medium uppercase ${getBadgeStyle(course.course_type)}`}
            >
              {course.course_type}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleEdit}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 transition-colors hover:bg-gray-300"
              >
                <Pencil className="h-4 w-4 text-gray-700" />
              </button>
              <button
                onClick={handleDelete}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 transition-colors hover:bg-gray-300"
              >
                <Trash2 className="h-4 w-4 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
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
