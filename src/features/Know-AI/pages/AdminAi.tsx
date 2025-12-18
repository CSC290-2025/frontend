import { useState } from 'react';
import { usePendingCourses, useFetchApproveCourses } from '../hooks/useAdmin';
import { Button } from '@/components/ui/button';
import PendingCard from './../components/PendingCard';
import AdminCard from './../components/AdminCourses';
import Layout from '@/components/main/Layout';

export default function Courses() {
  const [type, setType] = useState<'onsite' | 'online' | undefined>();
  const { data: pendingCourses, isLoading, isError } = usePendingCourses();
  const { data: approveCourse } = useFetchApproveCourses();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading courses</div>;

  return (
    <Layout>
      <div className="flex flex-col gap-y-4 p-4 sm:gap-y-6 sm:p-6 md:p-8 lg:p-10">
        <div className="flex flex-wrap justify-start gap-2 sm:gap-3 md:gap-4">
          <h1 className="text-4xl font-bold">Course Status</h1>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 sm:gap-5 md:gap-6">
          {pendingCourses?.map((course: any) => (
            <PendingCard key={course.id} course={course} />
          ))}
        </div>
        <div className="flex flex-wrap justify-start gap-2 sm:gap-3 md:gap-4">
          <h1 className="text-4xl font-bold">Courses</h1>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 sm:gap-5 md:gap-6">
          {approveCourse?.map((course: any) => (
            <AdminCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
