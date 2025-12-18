export type IncidentStatus = 'pending' | 'resolved';

export type IncidentCategory =
  | 'fire'
  | 'accident'
  | 'medical'
  | 'crime'
  | 'natural_disaster'
  | 'other';

export interface Incident {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  category: IncidentCategory;
  description: string;
  status: IncidentStatus;
  latitude: number;
  longitude: number;
  address: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
  isSOS: boolean;
}

export interface ChatMessage {
  id: string;
  incidentId: string;
  senderId: string;
  senderType: 'user' | 'admin';
  message: string;
  createdAt: Date;
  isInternal?: boolean;
}

export interface Hotline {
  id: string;
  name: string;
  number: string;
  category: string;
  isActive: boolean;
}

export interface StatsData {
  pending: number;
  inProgress: number;
  resolved: number;
  ambulancesAvailable: number;
}
