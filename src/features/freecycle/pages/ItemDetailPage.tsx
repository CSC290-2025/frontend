import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { PostItem, Category, CategoryWithName } from '@/types/postItem';
import { fetchCategoriesByPostId } from '@/features/freecycle/api/freecycle.api';

interface ItemDetailPageProps {
  _item?: PostItem;
  _onBack?: () => void;
}

export default function ItemDetailPage({
  _item,
  _onBack,
}: ItemDetailPageProps) {
  const [requesting, setRequesting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Load categories for the item
  useEffect(() => {
    if (_item?.id) {
      fetchCategoriesByPostId(_item.id)
        .then((cats: CategoryWithName[]) => {
          // Transform CategoryWithName to Category (map category_id to id)
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
  }, [_item?.id]);

  // Mock item for display when no item is provided
  const mockItem: PostItem = {
    id: 1,
    item_name: 'Vintage Wooden Chair',
    description:
      'A beautiful and comfortable wooden chair in excellent condition. Perfect for any room.',
    photo_url:
      'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=600',
    item_weight: 5,
    is_given: false,
  };

  const item = _item || mockItem;

  // TODO: INTEGRATION - Uncomment when backend integration is ready
  // const handleRequest = async () => {
  //   setRequesting(true);
  //   try {
  //     const response = await fetch('/api/requests', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({
  //         item_id: item.id,
  //         status: 'pending',
  //       }),
  //     });
  //     if (response.ok) {
  //       alert('Request sent successfully!');
  //     } else {
  //       alert('Failed to send request');
  //     }
  //   } catch (err) {
  //     alert('Failed to send request');
  //   }
  //   setRequesting(false);
  // };

  // Mock handler for now
  const handleRequest = () => {
    setRequesting(true);
    setTimeout(() => {
      alert('Request sent successfully! (Mock)');
      setRequesting(false);
    }, 500);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <button
        onClick={() => _onBack?.()}
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
              <h1 className="mb-4 text-3xl font-bold text-gray-900">
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

                {/* Display Categories if available */}
                {categories.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-gray-700">
                      Categories
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <span
                          key={`category-${_item?.id}-${category.id}`}
                          className="inline-block rounded-full bg-cyan-100 px-3 py-1 text-sm text-cyan-800"
                        >
                          {category.category_name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* TODO: INTEGRATION - Uncomment when phone and email are added to backend schema */}
                {/* {item.phone && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">
                      Contact
                    </h3>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{item.phone}</span>
                    </div>
                  </div>
                )}

                {item.email && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{item.email}</span>
                    </div>
                  </div>
                )} */}
              </div>
            </div>

            {!item.is_given && (
              <button
                onClick={handleRequest}
                disabled={requesting}
                className="mt-6 w-full rounded-lg bg-cyan-500 py-3 font-medium text-white transition-colors hover:bg-cyan-600 disabled:opacity-50"
              >
                {requesting ? 'Sending Request...' : 'Request Item'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
