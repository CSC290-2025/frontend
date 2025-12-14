// API functions for fetching Freecycle data from the backend
import { apiClient } from '@/lib/apiClient';
import type { ApiPost, Category, CategoryWithName } from '@/types/postItem';

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
  category_ids?: number[];
  donater_id?: number | null;
}

// Receiver Requests API Types
export interface ReceiverRequest {
  id: number;
  post_id: number;
  receiver_id: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;

  users: {
    username: string;
    email: string;
    phone: string | null;
  };
}

interface RequestsData {
  requests: ReceiverRequest[];
}

interface RequestData {
  request: ReceiverRequest;
}

interface PostsResponse {
  data: {
    posts: ApiPost[];
  };
}

export const fetchMyPosts = async (): Promise<ApiPost[]> => {
  const response = await apiClient.get<PostsResponse>('/posts/me');
  return response.data.data.posts;
};

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

// --- Categories API ---

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

// --- Post Categories API ---

export const addCategoriesToPost = async (
  postId: number,
  categoryIds: number[],
  donaterId: number = 1
): Promise<void> => {
  await apiClient.post(`/posts/${postId}/categories/add`, {
    category_id: categoryIds,
    donater_id: donaterId,
  });
};

export const fetchCategoriesByPostId = async (
  postId: number
): Promise<CategoryWithName[]> => {
  const response = await apiClient.get<
    ApiResponseWrapper<{ categories: CategoryWithName[] }>
  >(`/posts/${postId}/categories`);
  return response.data.data.categories;
};

export const fetchPostsByUserId = async (
  userId: number
): Promise<ApiPost[]> => {
  const response = await apiClient.get<ApiResponseWrapper<PostsData>>(
    `/posts/user/${userId}`
  );
  return response.data.data.posts;
};

// --- Receiver Requests API ---

export const fetchPostRequests = async (
  postId: number
): Promise<ReceiverRequest[]> => {
  const response = await apiClient.get<ApiResponseWrapper<RequestsData>>(
    `/posts/${postId}/requests`
  );
  const data = response.data.data;
  return Array.isArray(data.requests) ? data.requests : [];
};

export const fetchUserRequests = async (): Promise<ReceiverRequest[]> => {
  const response =
    await apiClient.get<ApiResponseWrapper<RequestsData>>('/requests/me');
  const data = response.data.data;
  console.log('Fetched user requests:', data);
  return Array.isArray(data.requests) ? data.requests : [];
};

export const fetchRequestById = async (
  id: number
): Promise<ReceiverRequest> => {
  const response = await apiClient.get<ApiResponseWrapper<RequestData>>(
    `/requests/${id}`
  );
  return response.data.data.request;
};

export const createRequest = async (
  postId: number,
  receiverId: number
): Promise<ReceiverRequest> => {
  const response = await apiClient.post<ApiResponseWrapper<RequestData>>(
    '/requests',
    { post_id: postId, receiver_id: receiverId }
  );
  return response.data.data.request;
};

export const cancelRequest = async (requestId: number) => {
  const { data } = await apiClient.delete(`/requests/${requestId}`);
  return data;
};
export const updateRequestStatus = async (
  id: number,
  status: 'pending' | 'accepted' | 'rejected'
): Promise<ReceiverRequest> => {
  const response = await apiClient.put<ApiResponseWrapper<RequestData>>(
    `/requests/${id}/status`,
    { status }
  );
  return response.data.data.request;
};
