import { useState, useEffect, useRef } from 'react';
import { Upload, ArrowLeft, X } from 'lucide-react';
import { useNavigate } from '@/router';
import { useParams } from 'react-router';
import Sidebar from '@/components/main/Sidebar';
import type { Category } from '@/types/postItem';
import {
  fetchAllCategories,
  addCategoriesToPost,
  fetchCategoriesByPostId,
  updatePost,
  uploadImage,
} from '@/features/freecycle/api/freecycle.api';
import {
  usePostById,
  useCurrentUser,
} from '@/features/freecycle/hooks/useFreecycle';
import { useGetAuthMe } from '@/api/generated/authentication';
import Sidebar from '@/components/main/Sidebar';

interface PostItemFormData {
  item_name: string;
  item_weight: number | null;
  photo_url: string | null;
  description: string;
  donate_to_department_id: number | null;
}

export default function ItemEditForm() {
  const navigate = useNavigate();
  const { id: itemId } = useParams<{ id: string }>();
  const postId = Number(itemId);

  const { isLoading: isUserLoading } = useCurrentUser();
  const userId = useGetAuthMe().data?.data?.userId ?? null;

  const {
    data: originalPost,
    isLoading: isPostLoading,
    isError: isPostError,
  } = usePostById(postId);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  const [formData, setFormData] = useState<PostItemFormData>({
    item_name: '',
    item_weight: null,
    photo_url: null,
    description: '',
    donate_to_department_id: null,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    fetchAllCategories().then(setCategories).catch(console.error);

    if (originalPost) {
      fetchCategoriesByPostId(originalPost.id)
        .then((cats) => setSelectedCategories(cats.map((c) => c.category_id)))
        .catch(console.error);
    }
  }, [originalPost?.id]);

  useEffect(() => {
    if (originalPost && !isFormInitialized) {
      setFormData({
        item_name: originalPost.item_name || '',
        item_weight:
          typeof originalPost.item_weight === 'string'
            ? parseFloat(originalPost.item_weight)
            : originalPost.item_weight || null,
        photo_url: originalPost.photo_url || null,
        description: originalPost.description || '',
        donate_to_department_id: originalPost.donate_to_department_id ?? null,
      });

      if (originalPost.photo_url) {
        setPreviewUrl(originalPost.photo_url);
      }
      setIsFormInitialized(true);
    }
  }, [originalPost, isFormInitialized]);

  const isOwner = userId === originalPost?.donater_id;

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
    setFormData((prev) => ({ ...prev, photo_url: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!isOwner) {
      setError('You are not the owner.');
      return;
    }

    // Show confirmation dialog instead of using window.confirm
    setShowConfirmDialog(true);
  };

  const handleConfirmSave = async () => {
    setShowConfirmDialog(false);
    setLoading(true);
    setError(null);

    try {
      let finalPhotoUrl = formData.photo_url;
      if (selectedFile) {
        try {
          const uploadResult = await uploadImage(selectedFile);
          finalPhotoUrl = uploadResult.url;
        } catch (uploadErr) {
          console.error('Upload failed:', uploadErr);
          setError('Failed to upload image.');
          setLoading(false);
          return;
        }
      } else if (!previewUrl) {
        finalPhotoUrl = null;
      }

      await updatePost(postId, {
        ...formData,
        photo_url: finalPhotoUrl,
      });

      if (selectedCategories.length > 0) {
        await addCategoriesToPost(postId, selectedCategories, userId!);
      }

      setLoading(false);
      navigate('/freecycle' as any);
    } catch (err: any) {
      console.error('Update Error:', err);
      setError(err.message || 'Failed to update post.');
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

  if (isPostLoading || !isFormInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-cyan-600"></div>
      </div>
    );
  }

  if (isPostError || !originalPost || !isOwner) {
    return (
      <div className="mt-10 text-center text-red-500">
        Access Denied or Item Not Found
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="mx-auto max-w-3xl p-4 sm:p-6">
        <button
          onClick={() => navigate(`/freecycle/items/${postId}` as any)}
          className="mb-6 flex items-center gap-2 font-medium text-cyan-600 hover:text-cyan-700"
        >
          <ArrowLeft className="h-5 w-5" /> Back to Detail
        </button>

        <h1 className="mb-6 text-2xl font-bold text-gray-900 sm:text-3xl">
          Edit Item: {originalPost.item_name}
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl bg-white p-6 shadow-md sm:p-8"
        >
          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 transition-colors hover:bg-gray-100"
          >
            {previewUrl ? (
              <div className="relative flex h-full w-full justify-center">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-[300px] w-auto rounded-lg object-contain"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white shadow-md hover:bg-red-600"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <>
                <Upload className="mb-2 h-12 w-12 text-gray-400" />
                <p className="text-sm text-gray-600">
                  Click to upload new photo
                </p>
                <p className="mt-1 text-xs text-gray-400">Supports: JPG, PNG</p>
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

          {/* Inputs */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              Item name
            </label>
            <input
              type="text"
              required
              value={formData.item_name}
              onChange={(e) =>
                setFormData({ ...formData, item_name: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
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
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>

          {/* Categories */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              Category
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => {
                const isSelected = selectedCategories.includes(category.id);
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                        : 'border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${isSelected ? 'border-cyan-500 bg-cyan-500' : 'border-gray-400'}`}
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

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-cyan-500 py-3 font-medium text-white transition-colors hover:bg-cyan-600 disabled:opacity-50"
          >
            {loading ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </form>

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
              <h2 className="text-lg font-semibold text-gray-900">
                Save changes?
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Are you sure you want to save these changes? You can edit this
                item again later if needed.
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
                  onClick={handleConfirmSave}
                  disabled={loading}
                  className="flex-1 rounded-lg bg-cyan-500 py-2 font-medium text-white transition-colors hover:bg-cyan-600 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
