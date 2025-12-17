import { apiClient } from '@/lib/apiClient';

// Fetch all bookmarked events for the current user
export const fetchUserBookmarks = (params?: {
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
export const createBookmark = (eventId: number) => {
  return apiClient.post('/bookmarks', { event_id: eventId });
};

// Delete a bookmark
export const deleteBookmark = (eventId: number) => {
  return apiClient.delete(`/bookmarks/${eventId}`);
};
