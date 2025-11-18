import { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import type { Category } from '@/types/postItem';
import {
  createPost,
  fetchAllCategories,
  addCategoriesToPost,
} from '@/features/freecycle/api/freecycle.api';

interface PostItem {
  item_name: string;
  item_weight: number | null;
  photo_url: string | null;
  description: string;
  donate_to_department_id: number | null;
}

interface PostItemFormProps {
  onSuccess: () => void;
}

export default function PostItemForm({ onSuccess }: PostItemFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [formData, setFormData] = useState<PostItem>({
    item_name: '',
    item_weight: null,
    photo_url: null,
    description: '',
    donate_to_department_id: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchAllCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories:', err);
        setError('Failed to load categories');
      }
    };
    loadCategories();
  }, []);

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   console.log('Form submitted with data:', formData);
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Temporary user ID for demo (replace with actual auth later)
      const demoUserId = 1;

      // Step 1: Create the post with donater_id
      const createdPost = await createPost({
        item_name: formData.item_name,
        item_weight: formData.item_weight,
        photo_url: formData.photo_url || null,
        description: formData.description,
        donate_to_department_id: formData.donate_to_department_id,
        donater_id: demoUserId,
      });

      console.log('Post created successfully:', createdPost);

      // Step 2: Add categories to the post if any are selected
      if (selectedCategories.length > 0) {
        console.log('Adding categories:', selectedCategories);
        await addCategoriesToPost(
          createdPost.id,
          selectedCategories,
          demoUserId
        );
        console.log('Categories added successfully');
      }

      setLoading(false);
      onSuccess();
    } catch (err) {
      console.error('Full error:', err);
      if (err instanceof Error && 'response' in err) {
        const error = err as { response?: { data: unknown } };
        console.error('Error response:', error.response?.data);
      }
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
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Post an Item</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl bg-white p-8 shadow-md"
      >
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

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900">
            Category
          </label>
          <div className="grid grid-cols-3 gap-3">
            {categories.map((category) => {
              const isSelected = selectedCategories.includes(category.id);
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                      : 'border-gray-300 bg-gray-50 text-gray-700'
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

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gray-300 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-400 disabled:opacity-50"
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  );
}
