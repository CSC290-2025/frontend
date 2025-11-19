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
  type ReceiverRequest,
} from '@/features/freecycle/api/freecycle.api';
import type { ApiPost } from '@/types/postItem';

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

// User Posts Hook
export function useUserPosts() {
  return useQuery({
    queryKey: ['posts', 'user'],
    queryFn: fetchUserPosts,
    retry: 2,
  });
}

// Delete Post Mutation
// export function useDeletePost() {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: deletePost,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['posts', 'user'] });
//     },
//   });
// }

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

// Mark Post as Given Mutation
// export function useMarkPostAsGiven() {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: markPostAsGiven,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['posts', 'user'] });
//     },
//   });
// }

export function useMarkPostAsGiven() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markPostAsGiven,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

// Mark Post as Not Given Mutation
// export function useMarkPostAsNotGiven() {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: markPostAsNotGiven,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['posts', 'user'] });
//     },
//   });
// }

export function useMarkPostAsNotGiven() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markPostAsNotGiven,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

// Categories Hooks
export function useCategories() {
  return useQuery({
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

// Discover Page Hook - Combines posts and categories for the discover page
export function useDiscoverPage(searchQuery: string) {
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

  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [postCategories, setPostCategories] = useState<Map<number, number[]>>(
    new Map()
  );

  // Fetch categories for posts when they load
  useEffect(() => {
    if (!posts || selectedCategories.length === 0) return;

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
  }, [posts, selectedCategories]);

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

    // Apply category filter (OR logic - show items in ANY selected category)
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((item) => {
        const itemCategories = postCategories.get(item.id) || [];
        return selectedCategories.some((cat) => itemCategories.includes(cat));
      });
    }

    return filtered;
  }, [posts, localSearch, selectedCategories, postCategories]);

  const toggleCategory = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

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
    toggleCategory,
  };
}

// User Requests Hook
export function useUserRequests() {
  return useQuery({
    queryKey: ['requests', 'user'],
    queryFn: fetchUserRequests,
    retry: 5,
  });
}

// Create Request Mutation
export function useCreateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests', 'user'] });
    },
  });
}

// Cancel Request Mutation
export function useCancelRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests', 'user'] });
    },
  });
}

// Update Request Status Mutation
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

// export function usePostsByUserId(userId?: number) {
//   return useQuery({
//     queryKey: ['posts', 'user', userId],
//     queryFn: () => fetchPostsByUserId(userId!),
//     enabled: Number.isFinite(userId),
//     retry: 2,
//   });
// }

// export function usePostsByUserId(userId: number | null) {
//   return useQuery({
//     queryKey: ['posts', 'user', userId],
//     queryFn: () => fetchPostsByUserId(userId!),
//     enabled: !!userId,
//     retry: 2,
//     meta: {
//       errorMessage: 'Failed to load user posts',
//     },
//   });
// };

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
