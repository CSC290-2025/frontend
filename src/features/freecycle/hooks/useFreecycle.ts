import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo, useEffect } from 'react';
import {
  fetchNotGivenPosts,
  fetchAllCategories,
  fetchCategoryById,
  fetchUserPosts,
  deletePost,
  markPostAsGiven,
  markPostAsNotGiven,
  fetchCategoriesByPostId,
  fetchPostsByUserId,
  fetchUserRequests,
  createRequest,
  cancelRequest,
  updateRequestStatus,
  fetchPostById,
  type ReceiverRequest,
} from '@/features/freecycle/api/freecycle.api';
import type { ApiPost, Category } from '@/types/postItem';

export function useNotGivenPosts() {
  return useQuery({
    queryKey: ['posts', 'not-given'],
    queryFn: fetchNotGivenPosts,
    retry: 2,
    meta: {
      errorMessage: 'Failed to load items',
    },
  });
}

export function useUserPosts() {
  return useQuery({
    queryKey: ['posts', 'user'],
    queryFn: fetchUserPosts,
    retry: 2,
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useMarkPostAsGiven() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markPostAsGiven,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useMarkPostAsNotGiven() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markPostAsNotGiven,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

// --- Categories Hooks ---

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: fetchAllCategories,
  });
}

export function useCategory(categoryId: number) {
  return useQuery({
    queryKey: ['categories', categoryId],
    queryFn: () => fetchCategoryById(categoryId),
    enabled: !!categoryId,
  });
}

export function useDiscoverPage(
  searchQuery: string,
  selectedCategories: number[],
  onToggleCategory: (categoryId: number) => void
) {
  const {
    data: posts,
    isLoading: postsLoading,
    isError: postsError,
    error: postsErrorDetail,
  } = useNotGivenPosts();
  const {
    data: categories,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useCategories();

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [postCategories, setPostCategories] = useState<Map<number, number[]>>(
    new Map()
  );

  useEffect(() => {
    if (!posts) return;

    const fetchCategoriesForPosts = async () => {
      const categoriesMap = new Map<number, number[]>();
      for (const post of posts) {
        try {
          const postCats = await fetchCategoriesByPostId(post.id);
          categoriesMap.set(
            post.id,
            postCats.map((cat) => cat.category_id)
          );
        } catch (error) {
          console.error(
            `Failed to fetch categories for post ${post.id}:`,
            error
          );
        }
      }
      setPostCategories(categoriesMap);
    };

    fetchCategoriesForPosts();
  }, [posts]);

  // Filter and map posts
  const filteredItems = useMemo(() => {
    if (!posts) return [];

    let filtered = posts;

    // Apply search filter
    if (localSearch.trim()) {
      const query = localSearch.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.item_name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((item) => {
        const itemCategories = postCategories.get(item.id) || [];
        return selectedCategories.some((cat) => itemCategories.includes(cat));
      });
    }

    return filtered;
  }, [posts, localSearch, selectedCategories, postCategories]);

  const loading = postsLoading || categoriesLoading;
  const hasError = postsError || categoriesError;
  const categoriesData = categories || [];

  // Log errors for debugging
  if (postsError) {
    console.error('Posts loading error:', postsErrorDetail);
  }
  if (categoriesError) {
    console.error('Categories loading error:', categoriesError);
  }

  return {
    filteredItems,
    categories: categoriesData,
    selectedCategories,
    localSearch,
    showFilters,
    loading,
    hasError,
    setLocalSearch,
    setShowFilters,
    toggleCategory: onToggleCategory,
  };
}

export function useUserRequests() {
  return useQuery<ReceiverRequest[]>({
    queryKey: ['requests', 'user'],
    queryFn: fetchUserRequests,
    retry: 5,
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests', 'user'] });
    },
  });
}

export function useCancelRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests', 'user'] });
    },
  });
}

export function useUpdateRequestStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number;
      status: 'pending' | 'accepted' | 'rejected';
    }) => updateRequestStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests', 'user'] });
    },
  });
}

export function usePostsByUserId(userId?: number) {
  return useQuery({
    queryKey: ['posts', 'user', userId],
    queryFn: () => fetchPostsByUserId(userId!),
    enabled: Number.isFinite(userId),
    retry: 2,
    meta: {
      errorMessage: 'Failed to load user posts',
    },
  });
}

export function useCurrentUser() {
  const MOCK_CURRENT_USER_ID = 2; // mock User ID
  return {
    data: { id: MOCK_CURRENT_USER_ID, name: 'CurrentUser' },
    isLoading: false,
  };
}

export function usePostById(postId: number) {
  return useQuery({
    queryKey: ['posts', postId],
    queryFn: () => fetchPostById(postId),
    enabled: !!postId && Number.isFinite(postId),
    retry: 2,
    meta: {
      errorMessage: 'Failed to load item details',
    },
  });
}
