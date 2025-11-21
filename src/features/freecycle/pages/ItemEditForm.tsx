import { useState, useEffect } from 'react';
import { Upload, ArrowLeft } from 'lucide-react';
import { useNavigate } from '@/router';
import { useParams } from 'react-router';
import type { Category } from '@/types/postItem';
import {
  fetchAllCategories,
  addCategoriesToPost,
  fetchCategoriesByPostId,
  updatePost,
} from '@/features/freecycle/api/freecycle.api';
import {
  usePostById,
  useCurrentUser,
} from '@/features/freecycle/hooks/useFreecycle';

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

  const { data: currentUser } = useCurrentUser();
  const currentUserId = currentUser?.id;

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  // Load Categories และ Existing Post Categories
  useEffect(() => {
    const loadData = async () => {
      // Load Categories
      try {
        const catData = await fetchAllCategories();
        setCategories(catData);
      } catch (err) {
        console.error('Failed to load categories:', err);
        setError('Failed to load categories');
        return;
      }

      // Load Existing Categories for this Post
      if (originalPost) {
        try {
          const postCats = await fetchCategoriesByPostId(originalPost.id);
          setSelectedCategories(postCats.map((c) => c.category_id));
        } catch (err) {
          console.error('Failed to load post categories:', err);
        }
      }
    };
    loadData();
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
      setIsFormInitialized(true);
    }
  }, [originalPost, isFormInitialized]);

  const isOwner = currentUserId === originalPost?.donater_id;

  if (isPostLoading || !isFormInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-cyan-600"></div>
      </div>
    );
  }

  if (isPostError || !originalPost || !isOwner) {
    return (
      <div className="mx-auto max-w-4xl p-4">
        <h1 className="text-2xl font-bold text-red-600">
          {isOwner === false
            ? 'Access Denied'
            : 'Item Not Found / Access Error'}
        </h1>
        <p className="text-red-500">
          {isOwner === false
            ? 'You do not have permission to edit this item.'
            : 'The item could not be loaded.'}
        </p>
        <button
          onClick={() => navigate(`/freecycle/items/${postId}` as any)}
          className="mt-4 flex items-center gap-2 font-medium text-cyan-600 hover:text-cyan-700"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Item Detail
        </button>
      </div>
    );
  }

  // Submit Handler UPDATE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    if (!isOwner) {
      setError('Authorization failed. You are not the owner.');
      setLoading(false);
      return;
    }

    const donaterId = originalPost.donater_id;

    try {
      // Step 1: Update the main post details
      const updatedPost = await updatePost(postId, {
        item_name: formData.item_name,
        item_weight: formData.item_weight,
        photo_url: formData.photo_url || null,
        description: formData.description,
        donate_to_department_id: formData.donate_to_department_id,
      });

      console.log('Post updated successfully:', updatedPost);

      // Step 2: Update categories
      if (selectedCategories.length > 0) {
        if (donaterId === null || donaterId === undefined) {
          throw new Error('Owner ID is missing.');
        }

        await addCategoriesToPost(postId, selectedCategories, donaterId);
        console.log('Categories updated successfully');
      }

      setLoading(false);

      //  Navigate back to item detail page after success
      navigate(`/freecycle/items/${postId}` as any);
    } catch (err: any) {
      console.error('Full error (Form Submission Failed):', err);
      let errorMessage = 'Failed to update post. Please try again.';
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
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
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <button
        onClick={() => navigate(`/freecycle/items/${postId}` as any)}
        className="mb-6 flex items-center gap-2 font-medium text-cyan-600 hover:text-cyan-700"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Detail
      </button>

      <h1 className="mb-6 text-2xl font-bold text-gray-900 sm:text-3xl">
        Edit Item: {originalPost.item_name}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl bg-white p-6 shadow-md sm:p-8"
      >
        {/* Photo URL */}
        <div className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 transition-colors hover:bg-gray-100">
          <Upload className="mb-2 h-12 w-12 text-gray-400" />
          <p className="text-sm text-gray-600">upload photo</p>
          <input
            id="photo-url"
            name="photo_url"
            type="text"
            placeholder="Photo URL (Pexels link)"
            value={formData.photo_url || ''}
            onChange={(e) =>
              setFormData({ ...formData, photo_url: e.target.value })
            }
            className="mt-4 w-full max-w-md rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          />
        </div>

        {/* Item name */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900">
            Item name
          </label>
          <input
            id="item-name"
            name="item_name"
            type="text"
            required
            value={formData.item_name}
            onChange={(e) =>
              setFormData({ ...formData, item_name: e.target.value })
            }
            placeholder="item name"
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          />
        </div>

        {/* Weight */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900">
            Weight (kg)
          </label>
          <input
            id="item-weight"
            name="item_weight"
            type="number"
            step="0.01"
            value={formData.item_weight || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                item_weight: e.target.value ? Number(e.target.value) : null,
              })
            }
            placeholder="e.g. 2.5"
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          />
        </div>

        {/* Category Select */}
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
                    className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-500'
                        : 'border-gray-400'
                    }`}
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

          {/* Selected Categories Display */}
          {selectedCategories.length > 0 && (
            <div className="mt-4 rounded-lg bg-cyan-50 p-4">
              <p className="mb-2 text-sm font-medium text-cyan-900">
                Selected Categories ({selectedCategories.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {categories
                  .filter((cat) => selectedCategories.includes(cat.id))
                  .map((category) => (
                    <span
                      key={category.id}
                      className="inline-flex items-center gap-2 rounded-full bg-cyan-200 px-3 py-1 text-sm text-cyan-800"
                    >
                      {category.category_name}
                      <button
                        type="button"
                        onClick={() => toggleCategory(category.id)}
                        className="font-bold hover:text-cyan-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={4}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-cyan-500 py-3 font-medium text-white transition-colors hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
