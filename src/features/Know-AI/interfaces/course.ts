export type CourseType = 'online' | 'onsite' | 'online_and_onsite';

export type CourseStatus = 'pending' | 'approve' | 'not_approve';

export interface Course {
  id: number;
  author_id: number;
  course_name: string;
  course_description?: string;
  course_type: CourseType;
  course_status: CourseStatus;
  cover_image?: string;
  created_at: string;
  updated_at: string;
}

export type CreateCourseDto = Omit<
  Course,
  'id' | 'created_at' | 'updated_at' | 'course_status'
> & { course_status?: CourseStatus };

export type UpdateCourseDto = Partial<
  Omit<Course, 'id' | 'created_at' | 'updated_at'>
>;

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
