import { Edit, Trash2 } from 'lucide-react';
import type { PostItem } from '@/types/postItem';
import { mapApiPostToItem } from '@/types/postItem';
import ItemCard from '@/features/freecycle/components/ItemCard';
import {
  usePostsByUserId,
  useDeletePost,
  useMarkPostAsGiven,
  useMarkPostAsNotGiven,
} from '@/features/freecycle/hooks/useFreecycle';

//  MOCK USER
const MOCK_USER_ID = 1;

export default function MyItemsPage() {
  const userId = MOCK_USER_ID;

  const { data: posts, isLoading, isError, error } = usePostsByUserId(userId);

  const deletePostMutation = useDeletePost();
  const markAsGivenMutation = useMarkPostAsGiven();
  const markAsNotGivenMutation = useMarkPostAsNotGiven();

  const items = posts ? posts.map(mapApiPostToItem) : [];

  const handleDelete = async (itemId: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await deletePostMutation.mutateAsync(itemId);
    } catch (err) {
      alert('Failed to delete item');
      console.error(err);
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
      alert('Failed to update item status');
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-600">Loading your items...</p>
      </div>
    );
  }

  if (isError) {
    return <div className="p-12 text-center text-red-600">{String(error)}</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Items</h1>
        <p className="text-gray-600">{items.length} items</p>
      </div>

      {items.length === 0 ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50">
          <p className="text-gray-600">You have not posted anything yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <div key={item.id} className="group relative">
              <ItemCard
                item={item}
                onClick={() => {
                  window.location.href = `/items/${item.id}`;
                }}
              />

              {/* ACTION BUTTONS */}
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                {/* Mark Given / Not Given */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleGiven(item);
                  }}
                  disabled={
                    markAsGivenMutation.isPending ||
                    markAsNotGivenMutation.isPending
                  }
                  className={`rounded-full p-2 text-white shadow ${
                    item.is_given ? 'bg-green-500' : 'bg-gray-500'
                  } disabled:opacity-50`}
                >
                  <Edit className="h-4 w-4" />
                </button>

                {/* Delete */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  disabled={deletePostMutation.isPending}
                  className="rounded-full bg-red-500 p-2 text-white shadow disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* GIVEN TAG */}
              {item.is_given && (
                <div className="absolute top-2 left-2 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white shadow">
                  Given
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
