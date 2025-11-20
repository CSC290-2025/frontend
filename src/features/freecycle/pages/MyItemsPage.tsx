import { Edit, Trash2, ArrowLeft, CheckCircle, RotateCw } from 'lucide-react';
import type { PostItem } from '@/types/postItem';
import { mapApiPostToItem } from '@/types/postItem';
import ItemCard from '@/features/freecycle/components/ItemCard';
import { useNavigate } from '@/router';
import {
  usePostsByUserId,
  useDeletePost,
  useMarkPostAsGiven,
  useMarkPostAsNotGiven,
} from '@/features/freecycle/hooks/useFreecycle';

//  MOCK USER
const MOCK_USER_ID = 23;

export default function MyItemsPage() {
  const navigate = useNavigate();
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-cyan-600"></div>
          <p className="text-gray-600">Loading your items...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <h2 className="mb-2 text-xl font-semibold text-red-700">Error</h2>
          <p className="text-red-600">{String(error)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section - Responsive */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => navigate('/freecycle')}
            className="mb-4 flex items-center gap-2 font-medium text-cyan-600 transition-colors hover:text-cyan-700 sm:mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Back</span>
          </button>

          {/* Title and Count - Responsive Layout */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
              My Items
            </h1>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-cyan-100 px-4 py-2">
                <p className="text-sm font-medium text-cyan-700">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Responsive Container */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {items.length === 0 ? (
          // Empty State - Responsive
          <div className="flex min-h-[400px] items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white p-8">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <svg
                  className="h-8 w-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <h3 className="mb-1 text-lg font-semibold text-gray-900">
                No items yet
              </h3>
              <p className="mb-4 text-gray-600">
                You have not posted anything yet.
              </p>
              <button
                onClick={() => navigate('/freecycle/post-item')}
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-300 px-6 py-3 text-sm font-medium text-cyan-700 transition-colors hover:bg-cyan-100"
              >
                Post Your First Item
              </button>
            </div>
          </div>
        ) : (
          // Items Grid - Responsive: 3 cols mobile, 3 cols tablet, 4 cols large
          <div className="grid grid-cols-3 gap-4 sm:gap-6 xl:grid-cols-4">
            {items.map((item) => (
              <div key={item.id} className="group relative">
                <ItemCard
                  item={item}
                  onClick={() => {
                    // *** Router Navigation ***
                    navigate(`/freecycle/items/${item.id}` as any);
                  }}
                />

                {/* ACTION BUTTONS */}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  {/* <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleGiven(item);
                    }}
                    disabled={
                      markAsGivenMutation.isPending ||
                      markAsNotGivenMutation.isPending
                    }
                    className={`rounded-full p-2 text-white shadow-lg transition-all hover:shadow-xl ${
                      item.is_given
                        ? 'bg-cyan-500 hover:bg-cyan-600'
                        : 'bg-gray-500 hover:bg-gray-600'
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <Edit className="h-4 w-4" />
                  </button> */}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleGiven(item);
                    }}
                    disabled={
                      markAsGivenMutation.isPending ||
                      markAsNotGivenMutation.isPending
                    }
                    className={`rounded-full p-2 text-white shadow-lg transition-all hover:shadow-xl ${
                      item.is_given
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-cyan-500 hover:bg-cyan-600'
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                    title={
                      item.is_given ? 'Mark as Not Given' : 'Mark as Given'
                    }
                  >
                    {item.is_given ? (
                      <RotateCw className="h-4 w-4" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                    disabled={deletePostMutation.isPending}
                    className="rounded-full bg-red-500 p-2 text-white shadow-lg transition-all hover:bg-red-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* GIVEN TAG */}
                {item.is_given && (
                  <div className="absolute top-2 left-2 rounded-full bg-cyan-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                    Given Away
                  </div>
                )}

                {/* Loading Overlay */}
                {(deletePostMutation.isPending ||
                  markAsGivenMutation.isPending ||
                  markAsNotGivenMutation.isPending) && (
                  <div className="bg-opacity-75 absolute inset-0 flex items-center justify-center rounded-lg bg-white">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-cyan-600"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
