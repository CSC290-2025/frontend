import { useEffect, useState } from 'react';
import { Filter } from 'lucide-react';
import type { PostItem, Category } from '@/features/freecycle/pages/Constants';
import ItemCard from '@/features/freecycle/components/ItemCard';

interface DiscoverPageProps {
  searchQuery: string;
  onViewItem: (item: PostItem) => void;
}

export default function DiscoverPage({
  searchQuery,
  onViewItem,
}: DiscoverPageProps) {
  const [items, setItems] = useState<PostItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<PostItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {}, []);

  const filterItems = () => {
    let filtered = items;

    if (localSearch.trim()) {
      const query = localSearch.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.item_name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
      );
    }

    setFilteredItems(filtered);
  };

  const toggleCategory = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Discover Items</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50"
        >
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      <div>Search bar</div>

      {showFilters && (
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <h3 className="mb-4 font-semibold text-gray-900">Categories</h3>
          <div>Category filters</div>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center">
          <p className="text-gray-600">Loading items...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-gray-600">No items found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.item_id}
              item={item}
              onClick={() => onViewItem(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
