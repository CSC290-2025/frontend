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
    <div className="flex flex-col gap-y-6 p-10">
      <div className="flex justify-start gap-x-4">
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

      <div className="grid grid-cols-2 gap-6">
        {courses?.map((course: any) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
