export type CourseType = 'online' | 'onsite' | 'online_and_onsite';
export type CourseStatus = 'pending' | 'approve' | 'not_approve';

export interface CreateCourseVideo {
  video_name: string;
  video_description?: string | null;
  duration_minutes: number;
  video_order: number;
  video_file_path?: string | null;
}

export interface CreateOnsiteSession {
  address_id?: number | null;
  duration_hours?: number | null;
  event_at: string;
  registration_deadline: string;
  total_seats: number;
}

export interface CreateCoursePayload {
  author_id?: number | null;
  course_name: string;
  course_description?: string | null;
  course_type: CourseType;
  course_status?: CourseStatus;
  cover_image?: string | null;
  course_videos?: CreateCourseVideo[];
  onsite_sessions?: CreateOnsiteSession[];
}

export interface AddressData {
  address_line: string;
  province: string;
  district: string;
  subdistrict: string;
  postal_code: string;
}

export interface EnrollCourse {
  onsite_id: number | null;
  user_id: number | null;
}
