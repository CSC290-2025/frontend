import { useState, useEffect, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import type { Category } from '@/types/postItem';
import {
  createPost,
  fetchAllCategories,
  addCategoriesToPost,
  uploadImage,
} from '@/features/freecycle/api/freecycle.api';
import { useCurrentUser } from '@/features/freecycle/hooks/useFreecycle';
import { useGetAuthMe } from '@/api/generated/authentication';

interface PostItem {
  item_name: string;
  item_weight: number | null;
  photo_url: string | null;
  description: string;
  donate_to_department_id: number | null;
}

interface PostItemFormProps {
  onSuccess?: () => void;
  onBack?: () => void;
}

export default function PostItemForm({ onSuccess, onBack }: PostItemFormProps) {
  const queryClient = useQueryClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { isLoading: isUserLoading } = useCurrentUser();
  const userId = useGetAuthMe().data?.data?.userId ?? null;

  const [formData, setFormData] = useState<PostItem>({
    item_name: '',
    item_weight: null,
    photo_url: null,
    description: '',
    donate_to_department_id: null,
  });

  useEffect(() => {
    fetchAllCategories()
      .then(setCategories)
      .catch(() => setError('Failed to load categories'));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isUserLoading) return;
    if (!userId) {
      setError('Please log in to post an item.');
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmPost = async () => {
    if (!userId) {
      setError('User not found. Please log in.');
      setShowConfirmDialog(false);
      return;
    }
    setShowConfirmDialog(false);
    setLoading(true);
    setError(null);

    try {
      let finalPhotoUrl = null;

      if (selectedFile) {
        try {
          console.log('Uploading image...');
          const uploadResult = await uploadImage(selectedFile);
          finalPhotoUrl = uploadResult.url;
        } catch (uploadErr) {
          console.error('Upload failed:', uploadErr);
          setError('Failed to upload image.');
          setLoading(false);
          return;
        }
      }

      const createdPost = await createPost({
        ...formData,
        photo_url: finalPhotoUrl,
        donater_id: userId,
      });

      if (selectedCategories.length > 0) {
        await addCategoriesToPost(createdPost.id, selectedCategories, userId);
      }

      // Invalidate the MyPosts query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['posts', 'me'] });
      setLoading(false);
      setShowSuccessModal(true);
      setTimeout(() => {
        if (typeof onSuccess === 'function') onSuccess();
      }, 1500);
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post. Please try again.');
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                aria-label="Back"
              >
                <svg
                  className="h-6 w-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}
            <div>
              <h1 className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-4xl font-bold text-transparent">
                Post an Item
              </h1>
              <p className="mt-2 text-gray-600">
                Share items you no longer need with the community
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl border border-gray-100 bg-white p-8 shadow-xl"
        >
          {/* Upload Area */}
          <div>
            <label className="mb-3 block text-sm font-semibold text-gray-900">
              Photo
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative flex min-h-[240px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-cyan-300 bg-gradient-to-br from-cyan-50 to-blue-50 p-8 transition-all duration-300 hover:border-cyan-500 hover:bg-cyan-100/50"
            >
              {previewUrl ? (
                <div className="relative flex h-full w-full justify-center">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-[300px] w-auto rounded-lg object-contain shadow-md"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 rounded-full bg-red-500 p-2 text-white shadow-lg transition-all duration-200 hover:scale-110 hover:bg-red-600"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-3 rounded-full bg-cyan-100 p-4">
                    <Upload className="h-8 w-8 text-cyan-600" />
                  </div>
                  <p className="text-base font-semibold text-gray-900">
                    Click to upload photo
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    JPG, PNG • Max 5MB
                  </p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Item Details Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-3 block text-sm font-semibold text-gray-900">
                Item Name *
              </label>
              <input
                type="text"
                required
                value={formData.item_name}
                onChange={(e) =>
                  setFormData({ ...formData, item_name: e.target.value })
                }
                placeholder="e.g., Wooden Chair"
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 placeholder-gray-400 transition-all duration-200 focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-3 block text-sm font-semibold text-gray-900">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.item_weight ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    item_weight:
                      e.target.value !== '' ? Number(e.target.value) : null,
                  })
                }
                placeholder="e.g., 5.5"
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 placeholder-gray-400 transition-all duration-200 focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:outline-none"
              />
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="mb-3 block text-sm font-semibold text-gray-900">
              Category
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {categories.map((category) => {
                const isSelected = selectedCategories.includes(category.id);
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className={`flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-700 shadow-md'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-cyan-300'
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${isSelected ? 'border-cyan-500 bg-cyan-500' : 'border-gray-400'}`}
                    >
                      {isSelected && (
                        <div className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </div>
                    {category.category_name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-3 block text-sm font-semibold text-gray-900">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe the condition, features, and any defects..."
              rows={4}
              className="w-full resize-none rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 placeholder-gray-400 transition-all duration-200 focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:outline-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-500">
                <span className="text-xs text-white">!</span>
              </div>
              <div>
                <p className="font-semibold text-red-900">{error}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || isUserLoading}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 py-3 font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                Posting...
              </div>
            ) : (
              'Post Item'
            )}
          </button>
        </form>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-gray-900">
              Post this item?
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Once posted, your item will be visible to the community. You can
              edit or delete it later if needed.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 rounded-lg border border-gray-300 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPost}
                disabled={loading}
                className="flex-1 rounded-lg bg-cyan-500 py-2 font-medium text-white transition-colors hover:bg-cyan-600 disabled:opacity-50"
              >
                {loading ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex justify-center">
              <svg
                className="h-16 w-16 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-center text-lg font-semibold text-gray-900">
              Item Posted Successfully!
            </h2>
            <p className="mt-2 text-center text-gray-600">
              Your item is now visible to the community.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
