// Booking types and interfaces
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Booking {
  id: number;
  user_id: number;
  room_id: number;
  apartment_id: number;
  guest_name: string | null;
  guest_phone: string | null;
  guest_email: string | null;
  room_type: string;
  check_in: string;
  booking_status: BookingStatus;
  created_at: Date;
  updated_at: Date;
}

export type BookingList = Booking[];

export interface CreateBooking {
  user_id: number;
  room_id: number;
  apartment_id: number;
  guest_name: string | null;
  guest_phone: string | null;
  guest_email: string | null;
  room_type: string;
  check_in: string;
}

export interface UpdateBooking {
  user_id: number;
  room_id?: number;
  apartment_id?: number;
  guest_name?: string | null;
  guest_phone?: string | null;
  guest_email?: string | null;
  room_type?: string | null;
  booking_status?: BookingStatus;
  check_in?: string;
}

export interface BookingIdParam {
  id: number;
}

export interface UpdateBookingParams {
  id: number;
}

export interface DeleteBookingParams {
  id: number;
}
