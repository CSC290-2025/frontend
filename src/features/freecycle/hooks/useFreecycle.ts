import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import {
  fetchNotGivenPosts,
  fetchAllCategories,
  fetchCategoryById,
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
// // import { useQuery } from '@tanstack/react-query';
// // import { fetchItemsById } from '../api/freecycle.api';

// // //get item id
// // export function useItems(id: number) {
// //   return useQuery({
// //     queryKey: ['items', id],
// //     queryFn: () => fetchItemsById(id),
// //     enabled: !!id,
// //   });
// // }

// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import {
//   fetchAllPosts,
//   fetchPostById,
//   fetchNotGivenPosts,
//   fetchMyPosts,
//   createPost,
//   updatePost,
//   deletePost,
//   markPostAsGiven,
//   markPostAsNotGiven,
//   fetchCategories,
//   createCategory,
//   updateCategory,
//   deleteCategory,
// } from '../api/freecycle.api';
// import type { PostItem, Category } from '../pages/Constants';

// // ดึงโพสต์ทั้งหมด
// export function useAllPosts() {
//   return useQuery({
//     queryKey: ['posts'],
//     queryFn: fetchAllPosts,
//   });
// }

// // ดึงโพสต์ตาม ID
// export function usePostById(id?: number) {
//   return useQuery({
//     queryKey: ['post', id],
//     queryFn: () => fetchPostById(id!),
//     enabled: !!id,
//   });
// }

// // ดึงโพสต์ที่ยังไม่ได้ให้
// export function useNotGivenPosts() {
//   return useQuery({
//     queryKey: ['posts', 'not-given'],
//     queryFn: fetchNotGivenPosts,
//   });
// }

// // ดึงโพสต์ของ user เอง
// export function useMyPosts() {
//   return useQuery({
//     queryKey: ['posts', 'me'],
//     queryFn: fetchMyPosts,
//   });
// }

// // สร้างโพสต์ใหม่
// export function useCreatePost() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (data: Partial<PostItem>) => createPost(data),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['posts'] });
//       queryClient.invalidateQueries({ queryKey: ['posts', 'me'] });
//     },
//   });
// }

// // แก้ไขโพสต์
// export function useUpdatePost() {
//   const queryClient = useQueryClient();

//   return useMutation<PostItem, Error, { id: number; data: Partial<PostItem> }>({
//     mutationFn: ({ id, data }) => updatePost(id, data),
//     onSuccess: (data) => {
//       queryClient.invalidateQueries({ queryKey: ['post', data.item_id] });
//       queryClient.invalidateQueries({ queryKey: ['posts'] });
//     },
//   });
// }

// // ลบโพสต์
// export function useDeletePost() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (id: number) => deletePost(id),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['posts'] });
//     },
//   });
// }

// // Mark เป็น “ให้แล้ว”
// export function useMarkPostAsGiven() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (id: number) => markPostAsGiven(id),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['posts'] });
//       queryClient.invalidateQueries({ queryKey: ['posts', 'not-given'] });
//     },
//   });
// }

// // Mark เป็น “ยังไม่ได้ให้”
// export function useMarkPostAsNotGiven() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (id: number) => markPostAsNotGiven(id),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['posts'] });
//       queryClient.invalidateQueries({ queryKey: ['posts', 'not-given'] });
//     },
//   });
// }

// // ดึงทุก category
// export function useCategories() {
//   return useQuery({
//     queryKey: ['categories'],
//     queryFn: fetchCategories,
//   });
// }

// // สร้าง category
// export function useCreateCategory() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (data: Partial<Category>) => createCategory(data),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['categories'] });
//     },
//   });
// }

// // อัปเดต category
// export function useUpdateCategory() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: ({ id, data }: { id: number; data: Partial<Category> }) =>
//       updateCategory(id, data),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['categories'] });
//     },
//   });
// }

// // ลบ category
// export function useDeleteCategory() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (id: number) => deleteCategory(id),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['categories'] });
//     },
//   });
// }
