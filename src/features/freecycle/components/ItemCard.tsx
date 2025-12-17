import React from 'react';
import type { PostItem } from '@/types/postItem';

interface ItemCardProps {
  item: PostItem;
  onClick?: () => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-200 hover:scale-[1.03] hover:shadow-xl"
    >
      {/* Image Container */}
      <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-gray-200">
        {item.photo_url ? (
          <>
            <img
              src={item.photo_url}
              alt={item.item_name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            {/* Given Away Overlay */}
            {item.is_given && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-gray-800 shadow-lg">
                  Given Away
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm text-gray-400">No photo</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="truncate text-lg font-semibold text-gray-900">
          {item.item_name}
        </h3>
        {item.description && (
          <p className="mt-1 line-clamp-2 text-sm text-gray-600">
            {item.description}
          </p>
        )}
        {/* Given Away Badge */}
        {/* {item.is_given && (
          <span className="mt-2 inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            Given Away
          </span>
        )} */}
      </div>
    </div>
  );
};

export default React.memo(ItemCard);
