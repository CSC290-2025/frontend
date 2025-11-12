import type { PostItem } from '@/types/postItem';

interface ItemCardProps {
  item: PostItem;
  onClick?: () => void;
}

export default function ItemCard({ item, onClick }: ItemCardProps) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-200 hover:scale-[1.03] hover:shadow-xl"
    >
      <div className="flex aspect-square items-center justify-center overflow-hidden bg-gray-200">
        {item.photo_url ? (
          <img
            src={item.photo_url}
            alt={item.item_name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-sm text-gray-400">No photo</span>
        )}
      </div>
      <div className="p-4">
        <h3 className="truncate text-lg font-semibold text-gray-900">
          {item.item_name}
        </h3>
        {item.description && (
          <p className="mt-1 line-clamp-2 text-sm text-gray-600">
            {item.description}
          </p>
        )}
        {item.is_given && (
          <span className="mt-2 inline-block rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
            Given Away
          </span>
        )}
      </div>
    </div>
  );
}
