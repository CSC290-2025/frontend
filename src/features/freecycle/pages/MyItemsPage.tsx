import { useEffect, useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import type { PostItem } from '@/types/postItem';
import ItemCard from '@/features/freecycle/components/ItemCard';

interface MyItemsPageProps {
  _onViewItem?: (item: PostItem) => void;
}

// Mock data for My Items
const MOCK_ITEMS: PostItem[] = [
  {
    id: 1,
    item_name: 'Vintage Wooden Chair',
    description: 'A comfortable wooden chair in good condition',
    photo_url:
      'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=400',
    item_weight: 5,
    is_given: false,
  },
  {
    id: 2,
    item_name: 'Set of Books',
    description: 'Collection of fiction and non-fiction books',
    photo_url:
      'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=400',
    item_weight: 3,
    is_given: false,
  },
  {
    id: 3,
    item_name: 'Coffee Maker',
    description: 'Barely used coffee maker, works perfectly',
    photo_url:
      'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=400',
    item_weight: 1.5,
    is_given: true,
  },
];

export default function MyItemsPage({ _onViewItem }: MyItemsPageProps) {
  const [items, setItems] = useState<PostItem[]>(MOCK_ITEMS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate loading delay
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleDelete = (itemId: number) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleToggleGiven = (item: PostItem) => {
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_given: !i.is_given } : i))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Items</h1>
        <p className="text-gray-600">{items.length} items</p>
      </div>

      {loading ? (
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
