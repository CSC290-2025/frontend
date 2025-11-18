import { Edit, Trash2 } from 'lucide-react';
import type { PostItem } from '@/types/postItem';
import { mapApiPostToItem } from '@/types/postItem';
import ItemCard from '@/features/freecycle/components/ItemCard';
import {
  useUserPosts,
  useDeletePost,
  useMarkPostAsGiven,
  useMarkPostAsNotGiven,
} from '@/features/freecycle/hooks/useFreecycle';

interface MyItemsPageProps {
  _onViewItem?: (item: PostItem) => void;
}

export default function MyItemsPage({ _onViewItem }: MyItemsPageProps) {
  const { data: posts, isLoading, isError, error } = useUserPosts();
  const deletePostMutation = useDeletePost();
  const markAsGivenMutation = useMarkPostAsGiven();
  const markAsNotGivenMutation = useMarkPostAsNotGiven();

  const items = posts ? posts.map(mapApiPostToItem) : [];

  const handleDelete = async (itemId: number) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await deletePostMutation.mutateAsync(itemId);
    } catch (err) {
      console.error('Failed to delete item:', err);
      alert('Failed to delete item. Please try again.');
    }
  };

  const handleToggleGiven = async (item: PostItem) => {
    try {
      if (item.is_given) {
        await markAsNotGivenMutation.mutateAsync(item.id);
      } else {
        await markAsGivenMutation.mutateAsync(item.id);
      }
    } catch (err) {
      console.error('Failed to update item status:', err);
      alert('Failed to update item status. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Items</h1>
        <p className="text-gray-600">{items.length} items</p>
      </div>

      {isError && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          {error instanceof Error
            ? error.message
            : 'Failed to load your items. Please try again.'}
        </div>
      )}

      {isLoading ? (
        <div className="py-12 text-center">
          <p className="text-gray-600">Loading your items...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-gray-600">You haven&apos;t posted any items yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <div key={item.id} className="group relative">
              <ItemCard item={item} onClick={() => _onViewItem?.(item)} />
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleGiven(item);
                  }}
                  className={`rounded-full p-2 shadow-lg ${
                    item.is_given
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-gray-500 hover:bg-gray-600'
                  } text-white`}
                  title={item.is_given ? 'Mark as available' : 'Mark as given'}
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  className="rounded-full bg-red-500 p-2 text-white shadow-lg hover:bg-red-600"
                  title="Delete item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
