import { useState, useEffect } from 'react';
import { ArrowLeft, Edit, CheckCircle, RotateCw } from 'lucide-react';
import { useNavigate } from '@/router';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import type { PostItem, Category, CategoryWithName } from '@/types/postItem';

import type { ReceiverRequest } from '@/features/freecycle/api/freecycle.api';

import { fetchCategoriesByPostId } from '@/features/freecycle/api/freecycle.api';

import {
  useCreateRequest,
  usePostById,
  useCurrentUser,
  usePostRequests,
  useUpdateRequestStatus,
  useMarkPostAsGiven,
  useMarkPostAsNotGiven,
} from '@/features/freecycle/hooks/useFreecycle';

interface RequestsListProps {
  postId: number;
  requests: (ReceiverRequest & { id: number })[] | undefined;
  isLoading: boolean;
  isError: boolean;
}

function RequestsList({
  postId,
  requests,
  isLoading,
  isError,
}: RequestsListProps) {
  const queryClient = useQueryClient();
  const { mutate: updateStatus } = useUpdateRequestStatus();

  const handleUpdateStatus = (
    requestId: number,
    status: 'accepted' | 'rejected'
  ) => {
    updateStatus(
      { id: requestId, status },
      {
        onSuccess: () => {
          alert(`Request ${requestId} ${status} successfully.`);
          queryClient.invalidateQueries({
            queryKey: ['posts', postId, 'requests'],
          });
        },
        onError: (err) => {
          console.error(`Failed to update status for ${requestId}:`, err);
          alert(`Failed to ${status} request.`);
        },
      }
    );
  };

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  if (isLoading) return <p className="text-gray-500">Loading requests...</p>;
  if (isError)
    return <p className="text-red-500">Failed to load request list.</p>;

  if (!requests || requests.length === 0) {
    return (
      <p className="text-gray-500">
        No requests have been made for this item yet.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {requests.map((req) => (
        <li
          key={req.id}
          className="flex flex-col items-start justify-between rounded-xl border bg-white p-4 shadow-sm md:flex-row md:items-center"
        >
          <div className="mb-2 md:mb-0">
            <span className="font-semibold text-gray-800">
              Receiver ID: {req.receiver_id}
            </span>
            <span
              className={`ml-3 rounded-full px-3 py-1 text-sm font-semibold ${getStatusClasses(req.status)}`}
            >
              {req.status}
            </span>
          </div>

          {req.status === 'pending' && (
            <div className="flex gap-2">
              <button
                onClick={() => handleUpdateStatus(req.id, 'accepted')}
                className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-600"
              >
                Accept
              </button>
              <button
                onClick={() => handleUpdateStatus(req.id, 'rejected')}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
              >
                Deny
              </button>
            </div>
          )}

          {req.status !== 'pending' && (
            <span className="text-sm text-gray-500">Action Taken</span>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function ItemDetailPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const createRequestMutation = useCreateRequest();

  const { id: itemId } = useParams<{ id: string }>();
  const postId = Number(itemId);

  const {
    data: post,
    isLoading: postLoading,
    isError: postError,
  } = usePostById(postId);

  const markAsGivenMutation = useMarkPostAsGiven(); // <-- NEW
  const markAsNotGivenMutation = useMarkPostAsNotGiven(); // <-- NEW

  const { data: currentUser } = useCurrentUser();
  const currentUserId = currentUser?.id;

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
        owner_id: post.donater_id ?? 0,
      }
    : null;

  const isOwner = currentUserId === item?.owner_id;

  const {
    data: requests,
    isLoading: requestsLoading,
    isError: requestsError,
  } = usePostRequests(postId, isOwner);

  // Toggle Given/Not Given
  const handleToggleGiven = async () => {
    if (!item) return;
    if (!isOwner) return alert('You are not authorized to change the status.');

    try {
      if (item.is_given) {
        await markAsNotGivenMutation.mutateAsync(item.id);
        alert('Item marked as Available!');
      } else {
        await markAsGivenMutation.mutateAsync(item.id);
        alert('Item marked as Given!');
      }
    } catch (err) {
      alert('Failed to update item status');
      console.error(err);
    }
  };

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

  if (postLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-cyan-600"></div>
      </div>
    );
  }

  if (postError || !item) {
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
              {/* Item Name + Edit Button */}
              <div className="flex items-start justify-between">
                <h1 className="mb-4 pr-4 text-3xl font-bold text-gray-900">
                  {item.item_name}
                </h1>

                {isOwner && (
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        navigate(`/freecycle/items/edit/${item.id}` as any)
                      }
                      className="flex-shrink-0 rounded-full bg-gray-100 p-2 text-cyan-600 transition-colors hover:bg-gray-200 hover:text-cyan-700"
                      title="Edit Item Details"
                    >
                      <Edit className="h-5 w-5" />
                    </button>

                    {/* TOGGLE GIVEN / NOT GIVEN */}
                    <button
                      onClick={handleToggleGiven}
                      disabled={
                        markAsGivenMutation.isPending ||
                        markAsNotGivenMutation.isPending
                      }
                      className={`flex-shrink-0 rounded-full p-2 text-white transition-colors disabled:opacity-50 ${
                        item.is_given
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'bg-cyan-500 hover:bg-cyan-600'
                      }`}
                      title={
                        item.is_given ? 'Mark as Available' : 'Mark as Given'
                      }
                    >
                      {item.is_given ? (
                        <RotateCw className="h-5 w-5" />
                      ) : (
                        <CheckCircle className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {item.is_given && (
                <span className="mb-4 inline-block rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600">
                  This item has been given away
                </span>
              )}

              <div className="space-y-4">
                {/* ... (Description, Weight, Categories sections) ... */}
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

            {/* Requests List (Only shown to owner) */}
            {isOwner && (
              <div className="mt-6 border-t pt-6">
                <h3 className="mb-4 text-xl font-bold text-gray-900">
                  Item Requests ({requests?.length || 0})
                </h3>
                <RequestsList
                  postId={postId}
                  requests={requests}
                  isLoading={requestsLoading}
                  isError={requestsError}
                />
              </div>
            )}

            {/* Request Button */}
            {!item.is_given &&
              (isOwner ? (
                <button
                  disabled
                  className="mt-6 w-full cursor-not-allowed rounded-lg bg-gray-400 py-3 font-medium text-white opacity-80"
                >
                  You own this item
                </button>
              ) : (
                <button
                  onClick={handleRequest}
                  disabled={createRequestMutation.isPending}
                  className="mt-6 w-full rounded-lg bg-cyan-500 py-3 font-medium text-white transition-colors hover:bg-cyan-600 disabled:opacity-50"
                >
                  {createRequestMutation.isPending
                    ? 'Sending Request...'
                    : 'Request Item'}
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
