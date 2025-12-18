// Room types and types
export type RoomStatus = 'occupied' | 'pending' | 'available';

export interface Room {
  id: number;
  name: string;
  type: string;
  size: string;
  room_status: RoomStatus;
  price_start: number;
  price_end: number;
  apartment_id: number;
}

export type RoomList = Room[];

export interface CreateRoom {
  name: string;
  type: string;
  size: string;
  price_start: number;
  price_end: number;
}

export interface UpdateRoom {
  name?: string;
  type?: string;
  size?: string;
  price_start?: number;
  price_end?: number;
  room_status?: RoomStatus;
}

export interface RoomIdParam {
  roomId: number;
}

export interface RoomParam {
  id: number;
  roomId: number;
}

export interface RoomFormData {
  name: string;
  type: string;
  size: string;
  price_start: number;
  price_end: number;
  room_status: RoomStatus;
}
