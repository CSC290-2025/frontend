export default interface Rating {
  id: number;
  apartmentId: number;
  userId: number;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface createRating {
  apartmentId: number;
  userId: number;
  rating: number;
  comment: string;
}

export interface updateRating {
  rating?: number;
  comment?: string;
}

export interface RatingResponse {
  data: Rating;
}
