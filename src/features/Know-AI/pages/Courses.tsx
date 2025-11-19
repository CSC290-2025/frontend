import { useState } from 'react';
import { useCourses } from '../hooks/useCourse';
import CourseCard from '../components/CourseCard';
import { Button } from '@/components/ui/button';

export default function Courses() {
  const [type, setType] = useState<'onsite' | 'online' | undefined>();
  const { data: courses, isLoading, isError } = useCourses(type);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading courses</div>;

  return (
    <div className="flex flex-col gap-y-4 p-4 sm:gap-y-6 sm:p-6 md:p-8 lg:p-10">
      <div className="flex flex-wrap justify-start gap-2 sm:gap-3 md:gap-4">
        <Button
          variant="KnowAICustom"
          size="KnowAI"
          onClick={() => setType('onsite')}
        >
          Onsite
        </Button>
        <Button
          variant="KnowAICustom"
          size="KnowAI"
          onClick={() => setType('online')}
        >
          Online
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6">
        {courses?.map((course: any) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
