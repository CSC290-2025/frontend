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

// Post Categories API
export const addCategoriesToPost = async (
  postId: number,
  categoryIds: number[],
  donaterId: number = 1
): Promise<void> => {
  await apiClient.post(`/posts/${postId}/categories/add`, {
    category_ids: categoryIds,
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

// export const fetchPostsByUserId = async (userId: number): Promise<ApiPost[]> => {
//   const res = await apiClient.get(`/posts/user/${userId}`);
//   return res.data.data.posts;
// };

// // Make for fetching Freecycle data from the Freecycle API

// // import { apiClient } from '@/lib/apiClient';

// // export const fetchItemsById = (id: number) => {
// //   apiClient.get(`/items/${id}`);
// // };

// // Freecycle API integration

// import { apiClient } from '@/lib/apiClient';
// import type { PostItem, Category } from '../pages/Constants';

// // Get all posts
// export const fetchAllPosts = async (): Promise<PostItem[]> => {
//   const res = await apiClient.get('/posts');
//   return res.data?.data?.posts || [];
// };

// // Get post by ID
// export const fetchPostById = async (id: number): Promise<PostItem> => {
//   const res = await apiClient.get(`/posts/${id}`);
//   return res.data?.data?.post;
// };

// // Get posts not given
// export const fetchNotGivenPosts = async (): Promise<PostItem[]> => {
//   const res = await apiClient.get('/posts/not-given');
//   return res.data?.data?.posts || [];
// };

// // Get posts by user
// export const fetchMyPosts = async (): Promise<PostItem[]> => {
//   const res = await apiClient.get('/posts/me');
//   return res.data?.data?.posts || [];
// };

// // Create post
// export const createPost = async (
//   data: Partial<PostItem>
// ): Promise<PostItem> => {
//   const res = await apiClient.post('/posts', data);
//   return res.data?.data?.post;
// };

// // Update post
// export const updatePost = async (
//   id: number,
//   data: Partial<PostItem>
// ): Promise<PostItem> => {
//   const res = await apiClient.put(`/posts/${id}`, data);
//   return res.data?.data?.post;
// };

// // Delete post
// export const deletePost = async (id: number): Promise<void> => {
//   await apiClient.delete(`/posts/${id}`);
// };

// // Mark post as given / not-given
// export const markPostAsGiven = async (id: number): Promise<PostItem> => {
//   const res = await apiClient.put(`/posts/${id}/given`);
//   return res.data?.data?.post;
// };

// export const markPostAsNotGiven = async (id: number): Promise<PostItem> => {
//   const res = await apiClient.put(`/posts/${id}/not-given`);
//   return res.data?.data?.post;
// };

// export const fetchCategories = async (): Promise<Category[]> => {
//   const res = await apiClient.get('/categories');
//   return res.data?.data?.categories || [];
// };

// export const fetchCategoryById = async (id: number): Promise<Category> => {
//   const res = await apiClient.get(`/categories/${id}`);
//   return res.data?.data?.category;
// };

// export const createCategory = async (
//   data: Partial<Category>
// ): Promise<Category> => {
//   const res = await apiClient.post('/categories', data);
//   return res.data?.data?.category;
// };

// export const updateCategory = async (
//   id: number,
//   data: Partial<Category>
// ): Promise<Category> => {
//   const res = await apiClient.put(`/categories/${id}`, data);
//   return res.data?.data?.category;
// };

// export const deleteCategory = async (id: number): Promise<void> => {
//   await apiClient.delete(`/categories/${id}`);
// };
