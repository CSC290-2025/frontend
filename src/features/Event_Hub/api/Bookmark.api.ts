import { apiClient } from '@/lib/apiClient';
// List user's bookmarks
export const fetchBookmarks = (params?: { page?: number; limit?: number }) => {
  return apiClient.get('/bookmarks', { params });
};

// Create a bookmark for an event
export const createBookmark = (data: { event_id: number }) => {
  return apiClient.post('/bookmarks', data);
};

// Delete a bookmark by event_id
export const deleteBookmark = (event_id: number) => {
  return apiClient.delete(`/bookmarks/${event_id}`);
};

// Check if user bookmarked a specific event
export const checkBookmarkStatus = (event_id: number) => {
  return apiClient.get(`/bookmarks/status/${event_id}`);
};
