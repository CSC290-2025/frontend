import { useState } from 'react';
import { useNavigate } from '@/router';
import { useCourses } from '../hooks/useCourse';
import { useMyProfile } from '../hooks/useUser';
import { useGetAuthMe } from '@/api/generated/authentication';
import CourseCard from '../components/CourseCard';
import { Button } from '@/components/ui/button';
import Layout from '@/components/main/Layout';

export default function Courses() {
  const navigate = useNavigate();
  const [type, setType] = useState<'onsite' | 'online' | undefined>();
  const {
    data: courses,
    isLoading: isCoursesLoading,
    isError,
  } = useCourses(type);

  const { data: authData } = useGetAuthMe();
  const userId = authData?.data?.userId ?? 0;
  const { data: profile } = useMyProfile(userId);

  const isAdmin = profile?.roleName === 'KnowAI Admin';
  const canCreateCourse = profile?.specialtyId === 1;
  const approvedCourses = courses?.filter(
    (course: any) => course.course_status === 'approve'
  );

  const handleManageCourseClick = () => {
    navigate('/Know-AI/adminAi');
  };

  const handleExerciseClick = () => {
    navigate('/Know-AI/exercises');
  };

  const handleCreateCourseClick = () => {
    navigate('/Know-AI/createCourse');
  };

  if (isCoursesLoading)
    return <div className="p-10 text-center">Loading courses...</div>;
  if (isError)
    return (
      <div className="p-10 text-center text-red-500">Error loading courses</div>
    );

  return (
    <>
      <Layout>
        <div className="flex flex-col gap-y-4 p-4 sm:gap-y-6 sm:p-6 md:p-8 lg:p-10">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap justify-start gap-2 sm:gap-3 md:gap-4">
              <Button
                variant={type === 'onsite' ? 'default' : 'KnowAICustom'}
                size="KnowAI"
                onClick={() => setType('onsite')}
              >
                Onsite
              </Button>
              <Button
                variant={type === 'online' ? 'default' : 'KnowAICustom'}
                size="KnowAI"
                onClick={() => setType('online')}
              >
                Online
              </Button>
              <Button
                onClick={handleExerciseClick}
                className="rounded-full bg-[#01CCFF] px-6 py-2 font-bold text-white shadow-md transition-all hover:bg-blue-700 active:scale-95"
              >
                AI Exercise
              </Button>
              {type && (
                <Button variant="ghost" onClick={() => setType(undefined)}>
                  Clear Filter
                </Button>
              )}
            </div>

            <div className="flex gap-x-2">
              {canCreateCourse && (
                <Button
                  onClick={handleCreateCourseClick}
                  className="rounded-full bg-green-500 px-6 py-2 font-bold text-white shadow-md transition-all hover:bg-green-600 active:scale-95"
                >
                  Create Course
                </Button>
              )}

              {isAdmin && (
                <Button
                  onClick={handleManageCourseClick}
                  className="rounded-full bg-amber-500 px-6 py-2 font-bold text-white shadow-md transition-all hover:bg-amber-600 active:scale-95"
                >
                  Manage Course
                </Button>
              )}
            </div>
          </div>

          {approvedCourses && approvedCourses.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6 lg:grid-cols-3">
              {approvedCourses.map((course: any) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="flex h-60 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
              No approved courses found.
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}
