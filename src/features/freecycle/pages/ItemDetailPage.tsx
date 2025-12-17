import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Edit,
  CheckCircle,
  RotateCw,
  Mail,
  Phone,
  User,
  Check,
  X,
  RotateCcw,
  Trash2,
  Loader2,
} from 'lucide-react';
import { useNavigate } from '@/router';
import { useParams, useLocation } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';

import type { PostItem, Category, CategoryWithName } from '@/types/postItem';
import type { ReceiverRequest } from '@/features/freecycle/api/freecycle.api';
import { fetchCategoriesByPostId } from '@/features/freecycle/api/freecycle.api';
import { useGetAuthMe } from '@/api/generated/authentication';
import Sidebar from '../../../components/main/Sidebar';

import {
  useCreateRequest,
  usePostById,
  useCurrentUser,
  usePostRequests,
  useUpdateRequestStatus,
  useMarkPostAsGiven,
  useMarkPostAsNotGiven,
  useDeletePost,
  useUserRequests,
  useCancelRequest,
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
    status: 'accepted' | 'rejected' | 'pending'
  ) => {
    updateStatus(
      { id: requestId, status },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ['posts', postId, 'requests'],
          });
        },
        onError: (err) => {
          console.error(`Failed to update status for ${requestId}:`, err);
          alert(`Failed to update request.`);
        },
      }
    );
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'rejected':
        return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'pending':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-100';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-24 w-full animate-pulse rounded-xl bg-gray-100"
          ></div>
        ))}
      </div>
    );
  }

  if (isError)
    return (
      <p className="text-center text-red-500">Failed to load request list.</p>
    );

  if (!requests || requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-8 text-center">
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gray-50">
          <User className="h-5 w-5 text-gray-400" />
        </div>
        <p className="text-gray-500">No requests yet.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {requests.map((req) => {
        const username = req.users?.username || `User #${req.receiver_id}`;
        const initial = username.charAt(0).toUpperCase();

        return (
          <li
            key={req.id}
            className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md"
          >
            {/* Status Stripe */}
            <div
              className={`absolute top-0 left-0 h-full w-1 ${
                req.status === 'accepted'
                  ? 'bg-cyan-500'
                  : req.status === 'rejected'
                    ? 'bg-rose-500'
                    : 'bg-amber-400'
              }`}
            />

            <div className="flex flex-col gap-4 p-5 md:flex-col md:justify-between">
              {/* User Info */}
              <div className="flex flex-col items-start gap-4 pl-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-900">{username}</h4>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusStyles(req.status)}`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <div className="mt-1 flex flex-col space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="max-w-[200px] truncate">
                        {req.users?.email || 'No email'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{req.users?.phone || 'No phone'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pl-16 md:pl-0">
                {req.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(req.id, 'accepted')}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-200 active:scale-95"
                    >
                      <Check className="h-4 w-4" /> Accept
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(req.id, 'rejected')}
                      className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 active:scale-95"
                    >
                      <X className="h-4 w-4" /> Deny
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-medium ${req.status === 'accepted' ? 'text-emerald-600' : 'text-rose-500'}`}
                    >
                      {req.status === 'accepted' ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" /> Accepted
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <X className="h-4 w-4" /> Rejected
                        </span>
                      )}
                    </span>
                    <button
                      onClick={() => handleUpdateStatus(req.id, 'pending')}
                      className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 active:scale-95"
                      title="Undo action"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Undo
                    </button>
                  </div>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default function ItemDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [backPath, setBackPath] = useState<string>('/freecycle');

  useEffect(() => {
    // Get backPath from location state if provided
    if (
      location.state &&
      typeof location.state === 'object' &&
      'backPath' in location.state
    ) {
      setBackPath((location.state as { backPath: string }).backPath);
    }
    // Get activeTab from location state if provided and store it
    if (
      location.state &&
      typeof location.state === 'object' &&
      'activeTab' in location.state
    ) {
      const activeTab = (location.state as { activeTab: string }).activeTab;
      localStorage.setItem('freecycle_activeTab', activeTab);
    }
  }, [location.state]);

  const createRequestMutation = useCreateRequest();
  const cancelRequestMutation = useCancelRequest();
  const markAsGivenMutation = useMarkPostAsGiven();
  const markAsNotGivenMutation = useMarkPostAsNotGiven();
  const deletePostMutation = useDeletePost();

  const { id: itemId } = useParams<{ id: string }>();
  const postId = Number(itemId);

  const {
    data: post,
    isLoading: postLoading,
    isError: postError,
  } = usePostById(postId);

  const {
    data: currentUser,
    isLoading: isUserLoading,
    isAuthenticated,
  } = useCurrentUser();
  const currentUserId = useGetAuthMe().data?.data?.userId ?? null;

  console.log('Current User Data:', currentUser);
  console.log(' User ID:', currentUserId);

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
        owner_name: post.users?.username || 'Unknown User',
        owner_email: post.users?.email || '',
        owner_phone: post.users?.phone || '',
      }
    : null;

  const isOwner = currentUserId === item?.owner_id;

  const {
    data: requests,
    isLoading: requestsLoading,
    isError: requestsError,
  } = usePostRequests(postId, isOwner);

  const { data: myRequests } = useUserRequests();

  const myExistingRequest = myRequests?.find(
    (req) =>
      Number(req.post_id) === Number(postId) &&
      req.receiver_id === currentUserId
  );
  const hasRequested = !!myExistingRequest;

  const handleToggleGiven = async () => {
    if (!item) return;
    if (!isOwner) {
      alert('You are not authorized to change the status.');
      return;
    }
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

  const handleDelete = async (itemId: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await deletePostMutation.mutateAsync(itemId);
      navigate('/freecycle/my-items', { replace: true });
    } catch (err) {
      alert('Failed to delete item');
      console.error(err);
    }
  };

  const handleRequestToggle = async () => {
    if (!isAuthenticated || !currentUserId) {
      alert('Please log in to manage requests.');
      return;
    }
    if (!item) return;

    if (hasRequested) {
      if (!confirm('Do you want to cancel your request?')) return;
      try {
        await cancelRequestMutation.mutateAsync(myExistingRequest!.id);
      } catch (err) {
        console.error('Failed to cancel request:', err);
        alert('Failed to cancel request.');
      }
    } else {
      const payload = {
        postId: item.id,
        receiverId: currentUserId,
      };
      try {
        await createRequestMutation.mutateAsync(payload);
      } catch (err: any) {
        console.error('Failed to send request:', err);
        const msg = err.response?.data?.message || err.message || 'Error';
        alert(msg);
      }
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

  if (postLoading || isUserLoading) {
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
          onClick={() => navigate(backPath)}
          className="mt-4 flex items-center gap-2 font-medium text-cyan-600 hover:text-cyan-700"
        >
          {/* <ArrowLeft className="h-5 w-5" /> Back to Home */}
        </button>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />

      <div className="mx-auto max-w-6xl p-4">
        <button
          onClick={() => navigate(backPath)}
          className="group mb-6 flex items-center gap-2 font-medium text-gray-500 transition-colors hover:text-cyan-600"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white transition-all group-hover:bg-cyan-50 group-hover:text-cyan-600">
            {/* <ArrowLeft className="h-5 w-5" /> */}
          </div>
          {/* Back to Freecycle */}
        </button>

        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Left: Image */}
            <div className="m-6 flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-gray-100">
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

            {/* Right: Details */}
            <div className="flex flex-col p-8 pr-8 pb-8">
              <div className="flex-1">
                {/* Header & Owner Actions */}
                <div className="flex flex-col items-start justify-between">
                  {isOwner && (
                    <div className="mb-4 flex w-full justify-end gap-2">
                      <button
                        onClick={() =>
                          navigate(`/freecycle/items/edit/${item.id}` as any)
                        }
                        className="flex-shrink-0 rounded-full bg-gray-100 p-2 text-cyan-600 transition-colors hover:bg-gray-200 hover:text-cyan-700"
                        title="Edit Item Details"
                      >
                        <Edit className="h-5 w-5" />
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletePostMutation.isPending}
                        className="flex-shrink-0 rounded-full bg-red-50 p-2 text-red-500 transition-colors hover:bg-red-100 hover:text-red-700 disabled:opacity-50"
                        title="Delete Item"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>

                      <button
                        onClick={handleToggleGiven}
                        disabled={
                          markAsGivenMutation.isPending ||
                          markAsNotGivenMutation.isPending
                        }
                        className={`flex-shrink-0 rounded-full p-2 text-white transition-colors disabled:opacity-50 ${item.is_given ? 'bg-red-500 hover:bg-red-600' : 'bg-cyan-500 hover:bg-cyan-600'}`}
                        title={
                          item.is_given ? 'Mark as Available' : 'Mark as Given'
                        }
                      >
                        {item.is_given ? (
                          <div className="flex items-center justify-center gap-2">
                            <RotateCw className="h-5 w-5" />
                            mark as not given
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircle className="h-5 w-5" />
                            mark as given
                          </div>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <h1 className="mb-4 pr-4 text-3xl font-bold text-gray-900">
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

                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <h3 className="mb-2 text-sm font-semibold text-gray-700">
                      Donater Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="h-4 w-4 text-cyan-600" />
                        <span className="font-medium">{item.owner_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4 text-cyan-600" />
                        <span>{item.owner_email || 'No email provided'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4 text-cyan-600" />
                        <span>{item.owner_phone || 'No phone provided'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Owner Section: Requests List */}
              {isOwner && (
                <div className="mt-8 border-t pt-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">
                      Item Requests
                    </h3>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                      {requests?.length || 0}
                    </span>
                  </div>
                  <RequestsList
                    postId={postId}
                    requests={requests}
                    isLoading={requestsLoading}
                    isError={requestsError}
                  />
                </div>
              )}

              {/* Non-Owner Section: Request Button */}
              {!item.is_given && !isOwner && (
                <button
                  onClick={handleRequestToggle}
                  disabled={
                    createRequestMutation.isPending ||
                    cancelRequestMutation.isPending ||
                    !isAuthenticated
                  }
                  className={`mt-6 flex w-full items-center justify-center gap-2 rounded-lg py-3 font-medium text-white shadow-md transition-all active:scale-95 disabled:scale-100 disabled:opacity-70 ${
                    hasRequested
                      ? 'bg-red-500 shadow-red-200 hover:bg-red-600'
                      : 'bg-cyan-500 shadow-cyan-200 hover:bg-cyan-600'
                  }`}
                >
                  {(createRequestMutation.isPending ||
                    cancelRequestMutation.isPending) && (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  )}

                  {!isAuthenticated ? (
                    'Please Login to Request'
                  ) : createRequestMutation.isPending ? (
                    'Sending...'
                  ) : cancelRequestMutation.isPending ? (
                    'Cancelling...'
                  ) : hasRequested ? (
                    <>
                      <X className="h-5 w-5" /> Cancel Request
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5" /> Request Item
                    </>
                  )}
                </button>
              )}

              {/* Owner Warning Button */}
              {!item.is_given && isOwner && (
                <button
                  disabled
                  className="mt-6 w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 py-3 font-medium text-gray-400"
                >
                  You own this item
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
