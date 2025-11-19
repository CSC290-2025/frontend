import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from '@/router';
import { useParams } from 'react-router-dom';

import type { PostItem, Category, CategoryWithName } from '@/types/postItem';
import { fetchCategoriesByPostId } from '@/features/freecycle/api/freecycle.api';
import {
  useCreateRequest,
  usePostById,
} from '@/features/freecycle/hooks/useFreecycle';

export default function ItemDetailPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const createRequestMutation = useCreateRequest();

  const { id: itemId } = useParams<{ id: string }>();
  const postId = Number(itemId);

  const { data: post, isLoading, isError } = usePostById(postId);

  const item: PostItem | null = post
    ? {
        id: post.id,
        item_name: post.item_name,
        description: post.description || '',
        photo_url: post.photo_url || '',
        item_weight:
          typeof post.item_weight === 'string'
            ? parseFloat(post.item_weight)
            : post.item_weight,
        is_given: post.is_given || false,
      }
    : null;

  useEffect(() => {
    if (item?.id) {
      fetchCategoriesByPostId(item.id)
        .then((cats: CategoryWithName[]) => {
          const transformedCategories: Category[] = cats.map((cat) => ({
            id: cat.category_id,
            category_name: cat.category_name,
          }));
          setCategories(transformedCategories);
        })
        .catch((err) => {
          console.error('Failed to load categories:', err);
        });
    }
  }, [item?.id]);

  const handleRequest = async () => {
    if (!item) return;

    try {
      await createRequestMutation.mutateAsync(item.id);
      alert('Request sent successfully!');
    } catch (err) {
      console.error('Failed to send request:', err);
      alert('Failed to send request. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-cyan-600"></div>
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="mx-auto max-w-4xl p-4">
        <h1 className="text-2xl font-bold text-red-600">Item Not Found</h1>
        <button
          onClick={() => navigate('/freecycle')}
          className="mt-4 flex items-center gap-2 font-medium text-cyan-600 hover:text-cyan-700"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-12 max-w-4xl p-4 sm:p-0">
      <button
        onClick={() => navigate('/freecycle/my-items')}
        className="mb-6 flex items-center gap-2 font-medium text-cyan-600 hover:text-cyan-700"
      >
        <ArrowLeft className="h-5 w-5" />
        Back
      </button>

      <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="flex aspect-square items-center justify-center bg-gray-200">
            {item.photo_url ? (
              <img
                src={item.photo_url}
                alt={item.item_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-lg text-gray-400">No photo</span>
            )}
          </div>

          <div className="flex flex-col p-8">
            <div className="flex-1">
              <h1 className="mb-4 text-3xl font-bold text-gray-900">
                {item.item_name}
              </h1>

              {item.is_given && (
                <span className="mb-4 inline-block rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600">
                  This item has been given away
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="mb-1 text-sm font-semibold text-gray-700">
                    Description
                  </h3>
                  <p className="text-gray-600">
                    {item.description || 'No description provided'}
                  </p>
                </div>

                {item.item_weight && (
                  <div>
                    <h3 className="mb-1 text-sm font-semibold text-gray-700">
                      Weight
                    </h3>
                    <p className="text-gray-600">{item.item_weight} kg</p>
                  </div>
                )}

                {/* Display Categories if available */}
                {categories.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-gray-700">
                      Categories
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <span
                          key={`category-${item.id}-${category.id}`}
                          className="inline-block rounded-full bg-cyan-100 px-3 py-1 text-sm text-cyan-800"
                        >
                          {category.category_name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {!item.is_given && (
              <button
                onClick={handleRequest}
                disabled={createRequestMutation.isPending}
                className="mt-6 w-full rounded-lg bg-cyan-500 py-3 font-medium text-white transition-colors hover:bg-cyan-600 disabled:opacity-50"
              >
                {createRequestMutation.isPending
                  ? 'Sending Request...'
                  : 'Request Item'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
