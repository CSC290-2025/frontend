// API functions for fetching Freecycle data from the backend
import { apiClient } from '@/lib/apiClient';
import type { ApiPost, Category } from '@/types/postItem';

// Response types matching backend structure
interface ApiResponseWrapper<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

interface PostsData {
  posts: ApiPost[];
}

interface PostData {
  post: ApiPost;
}

interface CategoriesData {
  categories: Category[];
}

interface CategoryData {
  category: Category;
}

interface CreatePostPayload {
  item_name: string;
  item_weight: number | null;
  photo_url: string | null;
  description: string | null;
  donate_to_department_id: number | null;
}

// Posts API
export const fetchAllPosts = async (): Promise<ApiPost[]> => {
  const response = await apiClient.get<ApiResponseWrapper<PostsData>>('/posts');
  return response.data.data.posts;
};

export const fetchPostById = async (id: number): Promise<ApiPost> => {
  const response = await apiClient.get<ApiResponseWrapper<PostData>>(
    `/posts/${id}`
  );
  return response.data.data.post;
};

export const fetchNotGivenPosts = async (): Promise<ApiPost[]> => {
  const response =
    await apiClient.get<ApiResponseWrapper<ApiPost[]>>('/posts/not-given');
  return response.data.data;
};

export const fetchUserPosts = async (): Promise<ApiPost[]> => {
  const response =
    await apiClient.get<ApiResponseWrapper<PostsData>>('/posts/me');
  return response.data.data.posts;
};

export const createPost = async (
  payload: CreatePostPayload
): Promise<ApiPost> => {
  const response = await apiClient.post<ApiResponseWrapper<PostData>>(
    '/posts',
    payload
  );
  return response.data.data.post;
};

export const updatePost = async (
  id: number,
  payload: Partial<CreatePostPayload>
): Promise<ApiPost> => {
  const response = await apiClient.put<ApiResponseWrapper<PostData>>(
    `/posts/${id}`,
    payload
  );
  return response.data.data.post;
};

// Removed: createPost, updatePost (would need PostFormData type definition)

export const deletePost = async (id: number): Promise<void> => {
  await apiClient.delete(`/posts/${id}`);
};

export const markPostAsGiven = async (id: number): Promise<ApiPost> => {
  const response = await apiClient.put<ApiResponseWrapper<PostData>>(
    `/posts/${id}/given`,
    { is_given: true }
  );
  return response.data.data.post;
};

export const markPostAsNotGiven = async (id: number): Promise<ApiPost> => {
  const response = await apiClient.put<ApiResponseWrapper<PostData>>(
    `/posts/${id}/not-given`,
    { is_given: false }
  );
  return response.data.data.post;
};

// Categories API
export const fetchAllCategories = async (): Promise<Category[]> => {
  const response =
    await apiClient.get<ApiResponseWrapper<CategoriesData>>('/categories');
  return response.data.data.categories;
};

export const fetchCategoryById = async (
  categoryId: number
): Promise<Category> => {
  const response = await apiClient.get<ApiResponseWrapper<CategoryData>>(
    `/categories/${categoryId}`
  );
  return response.data.data.category;
};

export const createCategory = async (
  categoryName: string
): Promise<Category> => {
  const response = await apiClient.post<ApiResponseWrapper<CategoryData>>(
    '/categories',
    {
      category_name: categoryName,
    }
  );
  return response.data.data.category;
};

export const updateCategory = async (
  categoryId: number,
  categoryName: string
): Promise<Category> => {
  const response = await apiClient.put<ApiResponseWrapper<CategoryData>>(
    `/categories/${categoryId}`,
    {
      category_name: categoryName,
    }
  );
  return response.data.data.category;
};

export const deleteCategory = async (categoryId: number): Promise<void> => {
  await apiClient.delete(`/categories/${categoryId}`);
};
