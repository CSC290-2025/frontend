import { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import type { Category } from '@/features/freecycle/pages/Constants';

interface PostItemFormProps {
  onSuccess: () => void;
}

export default function PostItemForm({ onSuccess }: PostItemFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    item_name: '',
    description: '',
    phone: '',
    email: '',
    photo: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
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
            type="text"
            placeholder="Photo URL (Pexels link)"
            value={formData.photo}
            onChange={(e) =>
              setFormData({ ...formData, photo: e.target.value })
            }
            className="mt-4 w-full max-w-md rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          />
        </div>

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
            placeholder="item name"
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900">
            Category
          </label>
          <div className="grid grid-cols-3 gap-3">
            {categories.map((category) => {
              const isSelected = selectedCategories.includes(
                category.category_id
              );
              return (
                <button
                  key={category.category_id}
                  type="button"
                  onClick={() => toggleCategory(category.category_id)}
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

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900">
            Phone number
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          />
        </div>

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
