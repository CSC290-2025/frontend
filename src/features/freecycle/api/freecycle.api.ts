// Make for fetching Freecycle data from the Freecycle API

// import { apiClient } from '@/lib/apiClient';

// export const fetchItemsById = (id: number) => {
//   apiClient.get(`/items/${id}`);
// };

// Freecycle API integration

import { apiClient } from '@/lib/apiClient';
import type { PostItem, Category } from '../pages/Constants';

// Get all posts
export const fetchAllPosts = async (): Promise<PostItem[]> => {
  const res = await apiClient.get('/posts');
  return res.data?.data?.posts || [];
};

// Get post by ID
export const fetchPostById = async (id: number): Promise<PostItem> => {
  const res = await apiClient.get(`/posts/${id}`);
  return res.data?.data?.post;
};

// Get posts not given
export const fetchNotGivenPosts = async (): Promise<PostItem[]> => {
  const res = await apiClient.get('/posts/not-given');
  return res.data?.data?.posts || [];
};

// Get posts by user
export const fetchMyPosts = async (): Promise<PostItem[]> => {
  const res = await apiClient.get('/posts/me');
  return res.data?.data?.posts || [];
};

// Create post
export const createPost = async (
  data: Partial<PostItem>
): Promise<PostItem> => {
  const res = await apiClient.post('/posts', data);
  return res.data?.data?.post;
};

// Update post
export const updatePost = async (
  id: number,
  data: Partial<PostItem>
): Promise<PostItem> => {
  const res = await apiClient.put(`/posts/${id}`, data);
  return res.data?.data?.post;
};

// Delete post
export const deletePost = async (id: number): Promise<void> => {
  await apiClient.delete(`/posts/${id}`);
};

// Mark post as given / not-given
export const markPostAsGiven = async (id: number): Promise<PostItem> => {
  const res = await apiClient.put(`/posts/${id}/given`);
  return res.data?.data?.post;
};

export const markPostAsNotGiven = async (id: number): Promise<PostItem> => {
  const res = await apiClient.put(`/posts/${id}/not-given`);
  return res.data?.data?.post;
};

export const fetchCategories = async (): Promise<Category[]> => {
  const res = await apiClient.get('/categories');
  return res.data?.data?.categories || [];
};

export const fetchCategoryById = async (id: number): Promise<Category> => {
  const res = await apiClient.get(`/categories/${id}`);
  return res.data?.data?.category;
};

export const createCategory = async (
  data: Partial<Category>
): Promise<Category> => {
  const res = await apiClient.post('/categories', data);
  return res.data?.data?.category;
};

export const updateCategory = async (
  id: number,
  data: Partial<Category>
): Promise<Category> => {
  const res = await apiClient.put(`/categories/${id}`, data);
  return res.data?.data?.category;
};

export const deleteCategory = async (id: number): Promise<void> => {
  await apiClient.delete(`/categories/${id}`);
};
