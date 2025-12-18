import type { RoomFormData } from './room.type';
import type * as apartmentTypes from './apartment.type';
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

export interface Tenant {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  roomType: string;
  checkin: string;
}

export interface FormData {
  name: string;
  phone: string;
  description: string;
  apartment_type: apartmentTypes.ApartmentType;
  apartment_location: apartmentTypes.ApartmentLocation;
  address_line: string;
  province: string;
  district: string;
  subdistrict: string;
  postal_code: string;
  electric_price: number;
  water_price: number;
  internet_price: number;
  internetFree: boolean;
  roomTypes: RoomFormData[];
  confirmed: boolean;
}

export interface FieldErrors {
  name?: string;
  phone?: string;
  address_line?: string;
  province?: string;
  district?: string;
  subdistrict?: string;
  postal_code?: string;
  electric_price?: string;
  water_price?: string;
  internet_price?: string;
  roomTypes?: { [key: number]: { [key: string]: string } };
  confirmed?: string;
}
