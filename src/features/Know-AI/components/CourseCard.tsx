export default function CourseCard({ course }: { course: any }) {
  return (
    <div className="grid h-full w-full grid-rows-2 rounded-2xl bg-white shadow-lg transition-all duration-200 hover:opacity-90 active:scale-95 active:brightness-90">
      <div className="flex items-center justify-center p-5">
        <h1>{course.course_name}</h1>
      </div>
      <div className="flex flex-col gap-y-2 p-6">
        <h1 className="text-xl font-bold">{course.course_name}</h1>
        <p className="text-xs font-normal">{course.course_description}</p>
        <h2 className="text-xs font-medium">{course.author_id}</h2>
      </div>
    </div>
  );
}
