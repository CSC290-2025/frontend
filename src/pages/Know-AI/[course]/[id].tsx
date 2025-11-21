import { useParams } from '@/router';
import { useCourseById } from '@/features/Know-AI/hooks/useCourse';
import OnsiteDetail from '@/features/Know-AI/pages/onsiteDetail';
import OnlineDetail from '@/features/Know-AI/pages/onlineDetail';
export default function CourseDetailController() {
  const { id } = useParams('/Know-AI/:course/:id');
  const { data: course, isLoading, isError } = useCourseById(id);

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  if (isError || !course)
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Course not found
      </div>
    );
  if (course.course_type === 'online') {
    return <OnlineDetail />;
  }

  return <OnsiteDetail />;
}
