import { useState, useEffect, useRef } from 'react';
import { Upload, X } from 'lucide-react';
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
}

export default function PostItemForm({ onSuccess }: PostItemFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      setLoading(false);
      if (typeof onSuccess === 'function') onSuccess();
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
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Post an Item</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl bg-white p-8 shadow-md"
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
              <p className="text-sm text-gray-600">Click to upload photo</p>
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
            value={formData.item_weight || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                item_weight: e.target.value ? Number(e.target.value) : null,
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
          disabled={loading || isUserLoading}
          className="w-full rounded-lg bg-cyan-500 py-3 font-medium text-white transition-colors hover:bg-cyan-600 disabled:opacity-50"
        >
          {loading ? 'Posting...' : 'Post Item'}
        </button>
      </form>
    </div>
  );
}
