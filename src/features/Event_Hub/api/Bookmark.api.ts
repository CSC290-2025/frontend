import { apiClient } from '@/lib/apiClient';
// Fetch all bookmarked events (auth)
export const fetchUserBookmarks = (params?: {
  page?: number;
  limit?: number;
}) => {
  return apiClient.get('/bookmarks', { params });
};

// Check if user bookmarked specific event (auth)
export const checkBookmarkStatus = (eventId: number) => {
  return apiClient.get(`/bookmarks/status/${eventId}`);
};

// Create bookmark (auth)
export const createBookmark = (data: { event_id: number }) => {
  return apiClient.post('/bookmarks', data);
};

// Delete bookmark (auth)
export const deleteBookmark = (eventId: number) => {
  return apiClient.delete(`/bookmarks/${eventId}`);
};
