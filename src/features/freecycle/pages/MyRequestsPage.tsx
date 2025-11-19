import { useEffect, useState } from 'react';
import {
  useUserRequests,
  useCancelRequest,
} from '@/features/freecycle/hooks/useFreecycle';
import { fetchPostById } from '@/features/freecycle/api/freecycle.api';
import RequestCard from '@/features/freecycle/components/RequestCard';
import ItemDetailPage from './ItemDetailPage';
import type { ReceiverRequest } from '@/features/freecycle/api/freecycle.api';
import type { ApiPost, PostItem } from '@/types/postItem';

export default function MyRequestsPage() {
  const { data: requests, isLoading, isError, error } = useUserRequests();
  const cancelRequestMutation = useCancelRequest();
  const [localRequests, setLocalRequests] = useState<ReceiverRequest[]>([]);
  const [postsMap, setPostsMap] = useState<Record<number, ApiPost | null>>({});
  const [selectedPost, setSelectedPost] = useState<ApiPost | null>(null);

  useEffect(() => {
    if (Array.isArray(requests)) {
      setLocalRequests(requests);
      // Fetch post details for each request
      const fetchPosts = async () => {
        const newPostsMap: Record<number, ApiPost | null> = {};
        for (const request of requests) {
          try {
            const post = await fetchPostById(request.post_id);
            newPostsMap[request.post_id] = post;
          } catch (err) {
            console.error(`Failed to fetch post ${request.post_id}:`, err);
            newPostsMap[request.post_id] = null;
          }
        }
        setPostsMap(newPostsMap);
      };
      fetchPosts();
    } else {
      setLocalRequests([]);
      setPostsMap({});
    }
  }, [requests]);

  const handleCancelRequest = async (requestId: number) => {
    if (!confirm('Are you sure you want to cancel this request?')) {
      return;
    }

    try {
      await cancelRequestMutation.mutateAsync(requestId);
    } catch (err) {
      console.error('Failed to cancel request:', err);
      alert('Failed to cancel request. Please try again.');
    }
  };

  const handleRequestCardClick = (post: ApiPost | null | undefined) => {
    if (post) {
      setSelectedPost(post);
    }
  };

  const getStatusCount = (status: string) => {
    return localRequests.filter((r) => r.status === status).length;
  };

  const getRequestsByStatus = (status: string) => {
    return localRequests.filter((r) => r.status === status);
  };

  // Show detail page when a post is selected
  if (selectedPost) {
    const itemWeight =
      typeof selectedPost.item_weight === 'string'
        ? parseFloat(selectedPost.item_weight)
        : selectedPost.item_weight;

    return (
      <ItemDetailPage
        _item={{
          id: selectedPost.id,
          item_name: selectedPost.item_name,
          description: selectedPost.description || '',
          photo_url: selectedPost.photo_url || '',
          item_weight: itemWeight,
          is_given: selectedPost.is_given || false,
        }}
        _onBack={() => setSelectedPost(null)}
        _isRequestView={true}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-4 text-3xl font-bold text-gray-900">Request Items</h1>
        <div className="flex flex-wrap gap-4">
          <div className="rounded-lg bg-yellow-50 px-4 py-2">
            <span className="text-sm text-yellow-800">
              Pending: {getStatusCount('pending')}
            </span>
          </div>
          <div className="rounded-lg bg-green-50 px-4 py-2">
            <span className="text-sm text-green-800">
              Accepted: {getStatusCount('accepted')}
            </span>
          </div>
          <div className="rounded-lg bg-red-50 px-4 py-2">
            <span className="text-sm text-red-800">
              Rejected: {getStatusCount('rejected')}
            </span>
          </div>
        </div>
      </div>

      {isError && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          {error instanceof Error
            ? error.message
            : 'Failed to load your requests. Please try again.'}
        </div>
      )}

      {isLoading ? (
        <div className="py-12 text-center">
          <p className="text-gray-600">Loading your requests...</p>
        </div>
      ) : localRequests.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-gray-600">
            You haven&apos;t made any requests yet
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pending Requests */}
          {getRequestsByStatus('pending').length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold text-yellow-800">
                Pending Requests
              </h2>
              <div className="overflow-x-auto">
                <div
                  className="flex gap-6 pb-2"
                  style={{ minWidth: 'min-content' }}
                >
                  {getRequestsByStatus('pending').map((request) => (
                    <div key={request.id} className="w-48 shrink-0">
                      <RequestCard
                        request={request}
                        post={postsMap[request.post_id]}
                        onCancel={handleCancelRequest}
                        onClick={() =>
                          handleRequestCardClick(postsMap[request.post_id])
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Accepted Requests */}
          {getRequestsByStatus('accepted').length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold text-green-800">
                Accepted Requests
              </h2>
              <div className="overflow-x-auto">
                <div
                  className="flex gap-6 pb-2"
                  style={{ minWidth: 'min-content' }}
                >
                  {getRequestsByStatus('accepted').map((request) => (
                    <div key={request.id} className="w-48 shrink-0">
                      <RequestCard
                        request={request}
                        post={postsMap[request.post_id]}
                        onCancel={handleCancelRequest}
                        onClick={() =>
                          handleRequestCardClick(postsMap[request.post_id])
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Rejected Requests */}
          {getRequestsByStatus('rejected').length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold text-red-800">
                Rejected Requests
              </h2>
              <div className="overflow-x-auto">
                <div
                  className="flex gap-6 pb-2"
                  style={{ minWidth: 'min-content' }}
                >
                  {getRequestsByStatus('rejected').map((request) => (
                    <div key={request.id} className="w-48 shrink-0">
                      <RequestCard
                        request={request}
                        post={postsMap[request.post_id]}
                        onCancel={handleCancelRequest}
                        onClick={() =>
                          handleRequestCardClick(postsMap[request.post_id])
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
