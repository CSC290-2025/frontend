// import { useQuery } from '@tanstack/react-query';
// import { fetchItemsById } from '../api/freecycle.api';

// //get item id
// export function useItems(id: number) {
//   return useQuery({
//     queryKey: ['items', id],
//     queryFn: () => fetchItemsById(id),
//     enabled: !!id,
//   });
// }

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAllPosts,
  fetchPostById,
  fetchNotGivenPosts,
  fetchMyPosts,
  createPost,
  updatePost,
  deletePost,
  markPostAsGiven,
  markPostAsNotGiven,
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../api/freecycle.api';
import type { PostItem, Category } from '../pages/Constants';

// ดึงโพสต์ทั้งหมด
export function useAllPosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: fetchAllPosts,
  });
}

// ดึงโพสต์ตาม ID
export function usePostById(id?: number) {
  return useQuery({
    queryKey: ['post', id],
    queryFn: () => fetchPostById(id!),
    enabled: !!id,
  });
}

// ดึงโพสต์ที่ยังไม่ได้ให้
export function useNotGivenPosts() {
  return useQuery({
    queryKey: ['posts', 'not-given'],
    queryFn: fetchNotGivenPosts,
  });
}

// ดึงโพสต์ของ user เอง
export function useMyPosts() {
  return useQuery({
    queryKey: ['posts', 'me'],
    queryFn: fetchMyPosts,
  });
}

// สร้างโพสต์ใหม่
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<PostItem>) => createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts', 'me'] });
    },
  });
}

// แก้ไขโพสต์
export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation<PostItem, Error, { id: number; data: Partial<PostItem> }>({
    mutationFn: ({ id, data }) => updatePost(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['post', data.item_id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

// ลบโพสต์
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

// Mark เป็น “ให้แล้ว”
export function useMarkPostAsGiven() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => markPostAsGiven(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts', 'not-given'] });
    },
  });
}

// Mark เป็น “ยังไม่ได้ให้”
export function useMarkPostAsNotGiven() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => markPostAsNotGiven(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts', 'not-given'] });
    },
  });
}

// ดึงทุก category
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });
}

// สร้าง category
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Category>) => createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// อัปเดต category
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Category> }) =>
      updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// ลบ category
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
