import {
  Edit,
  Trash2,
  ArrowLeft,
  CheckCircle,
  RotateCw,
  Inbox, // ✅ เพิ่ม Icon Inbox สำหรับ Request
  Users, // หรือจะใช้ Icon Users ก็ได้
} from 'lucide-react';
import type { PostItem } from '@/types/postItem';
import { mapApiPostToItem } from '@/types/postItem';
import ItemCard from '@/features/freecycle/components/ItemCard';
import { useNavigate } from '@/router';
import {
  useDeletePost,
  useMarkPostAsGiven,
  useMarkPostAsNotGiven,
  useCurrentUser,
  useMyPosts,
} from '@/features/freecycle/hooks/useFreecycle';
import { useGetAuthMe } from '@/api/generated/authentication';
import Sidebar from '@/components/main/Sidebar';

export default function MyItemsPage() {
  const navigate = useNavigate();

  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const userId = useGetAuthMe().data?.data?.userId ?? null;

  const { data: posts, isLoading, isError, error } = useMyPosts();

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
      <div className="p-4 text-center text-red-500">Error loading items</div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="min-h-screen min-w-full bg-gray-50">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <button
              onClick={() => navigate('/freecycle')}
              className="mb-4 flex items-center gap-2 font-medium text-cyan-600 transition-colors hover:text-cyan-700 sm:mb-6"
            >
              {/* Back Button Content */}
            </button>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
                My Items
              </h1>
              <div className="rounded-full bg-cyan-100 px-4 py-2">
                <p className="text-sm font-medium text-cyan-700">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {items.length === 0 ? (
            <div className="flex min-h-[400px] items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white p-8">
              <div className="text-center">
                <p className="text-gray-500">No items found</p>
                <button
                  onClick={() => navigate('/freecycle/post-item')}
                  className="mt-4 text-cyan-600 underline"
                >
                  Post Item
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => (
                <div key={item.id} className="group relative">
                  <ItemCard
                    item={item}
                    onClick={() => {
                      navigate(`/freecycle/items/${item.id}` as any);
                    }}
                  />

                  <div className="absolute top-2 left-2 z-10 flex flex-col items-start gap-1">
                    {item.is_given && (
                      <div className="rounded-full bg-cyan-600 px-2 py-1 text-[10px] font-bold tracking-wide text-white uppercase shadow-md">
                        Given Away
                      </div>
                    )}

                    {(item.request_count || 0) > 0 && (
                      <div className="flex items-center gap-1.5 rounded-full border border-yellow-200 bg-yellow-100 px-2.5 py-1 text-xs font-bold text-yellow-800 shadow-md">
                        <Inbox className="h-3.5 w-3.5" />
                        <span>
                          {item.request_count}{' '}
                          {item.request_count === 1 ? 'Request' : 'Requests'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
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
                      }`}
                      title={item.is_given ? 'Not given' : 'Given away'}
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
                      className="rounded-full bg-red-500 p-2 text-white shadow-lg transition-all hover:bg-red-600 hover:shadow-xl"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Loading Overlay */}
                  {(deletePostMutation.isPending ||
                    markAsGivenMutation.isPending ||
                    markAsNotGivenMutation.isPending) && (
                    <div className="bg-opacity-75 absolute inset-0 z-20 flex items-center justify-center rounded-lg bg-white">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-cyan-600"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
