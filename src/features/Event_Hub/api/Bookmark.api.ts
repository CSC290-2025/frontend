import { apiClient } from '@/lib/apiClient';

// Fetch all bookmarked events for the current user
export const fetchBookmarkedEvents = (params?: {
  page?: number;
  limit?: number;
  q?: string;
}) => {
  return apiClient.get('/bookmarks', { params });
};

// Check if a specific event is bookmarked by the current user
export const checkBookmarkStatus = (eventId: number) => {
  return apiClient.get(`/bookmarks/status/${eventId}`);
};

// Create a new bookmark
export const createBookmark = (data: { event_id: number }) => {
  return apiClient.post('/bookmarks', data);
};

// Delete a bookmark
export const deleteBookmark = (eventId: number) => {
  return apiClient.delete(`/bookmarks/${eventId}`);
};
