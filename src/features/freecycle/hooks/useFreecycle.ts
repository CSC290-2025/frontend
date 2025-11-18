import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import {
  fetchNotGivenPosts,
  fetchAllCategories,
  fetchCategoryById,
  fetchUserPosts,
  deletePost,
  markPostAsGiven,
  markPostAsNotGiven,
} from '@/features/freecycle/api/freecycle.api';

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
export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'user'] });
    },
  });
}

// Mark Post as Given Mutation
export function useMarkPostAsGiven() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markPostAsGiven,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'user'] });
    },
  });
}

// Mark Post as Not Given Mutation
export function useMarkPostAsNotGiven() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markPostAsNotGiven,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'user'] });
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

    // Apply category filter (when implemented in backend)
    if (selectedCategories.length > 0) {
      // filtered = filtered.filter((item) =>
      //   selectedCategories.includes(item.category_id)
      // );
    }

    return filtered;
  }, [posts, localSearch, selectedCategories]);

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
