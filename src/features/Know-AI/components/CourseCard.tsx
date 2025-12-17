import { useNavigate } from '@/router';

export default function CourseCard({ course }: { course: any }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/Know-AI/:course/:id', {
      params: {
        course: 'courses',
        id: String(course.id),
      },
    });
  };

  const getBadgeStyle = (type: string) => {
    if (type === 'online') return 'bg-blue-100 text-blue-600';
    if (type === 'onsite') return 'bg-orange-100 text-orange-600';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div
      onClick={handleClick}
      className="grid h-full w-full cursor-pointer grid-rows-[auto_1fr] overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-200 hover:opacity-90 active:scale-95 active:brightness-90"
    >
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

      <div className="flex flex-col gap-y-2 p-4 sm:p-5 md:p-6">
        <h1 className="line-clamp-1 text-base font-bold text-gray-900 sm:text-lg md:text-xl">
          {course.course_name}
        </h1>

        {/* Dynamic Badge Color */}
        <div className="mt-auto pt-2">
          <span
            className={`rounded-full px-2 py-1 text-[10px] font-medium uppercase ${getBadgeStyle(course.course_type)}`}
          >
            {course.course_type}
          </span>
        </div>
      </div>
    </div>
  );
}
