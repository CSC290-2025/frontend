import type { ReceiverRequest } from '@/features/freecycle/api/freecycle.api';
import type { ApiPost } from '@/types/postItem';
import { X } from 'lucide-react';

interface RequestCardProps {
  request: ReceiverRequest;
  post?: ApiPost | null;
  onCancel?: (requestId: number) => void;
  onClick?: () => void;
}

export default function RequestCard({
  request,
  post,
  onCancel,
  onClick,
}: RequestCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'accepted':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  return (
    <div
      className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-200 hover:shadow-xl"
      onClick={onClick}
    >
      {/* Photo section */}
      {post?.photo_url ? (
        <div className="flex aspect-square items-center justify-center overflow-hidden bg-gray-200">
          <img
            src={post.photo_url}
            alt={post.item_name}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-square bg-gray-100"></div>
      )}

      <div className="p-3">
        {/* Item name */}
        {post?.item_name && (
          <h3 className="mb-1 truncate text-sm font-semibold text-gray-900">
            {post.item_name}
          </h3>
        )}

        {/* Description */}
        {post?.description && (
          <p className="mb-2 line-clamp-1 text-xs text-gray-600">
            {post.description}
          </p>
        )}

        <div className="mb-2 space-y-0.5 text-xs text-gray-600">
          <p>
            <span className="font-semibold">Requested:</span>{' '}
            {new Date(request.created_at).toLocaleDateString()}
          </p>
        </div>

        {request.status === 'pending' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCancel?.(request.id);
            }}
            className="mt-1 flex w-full items-center justify-center gap-1 rounded bg-red-500 px-2 py-1 text-xs text-white transition-colors hover:bg-red-600"
            title="Cancel request"
          >
            <X className="h-3 w-3" />
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
