import { Filter, Plus } from 'lucide-react';
import ItemCard from '@/features/freecycle/components/ItemCard';
import CategoryFilter from '@/features/freecycle/components/CategoryFilter';
import type { PostItem } from '@/types/postItem';
import { mapApiPostToItem } from '@/types/postItem';
import { useDiscoverPage } from '@/features/freecycle/hooks/useFreecycle';
import SearchBar from '../components/SearchBar';

interface DiscoverPageProps {
  searchQuery: string;
  onViewItem: (item: PostItem) => void;
  onPostItem?: () => void;
  selectedCategories: number[];
  onToggleCategory: (categoryId: number) => void;
}

export default function DiscoverPage({
  searchQuery,
  onViewItem,
  onPostItem,
  selectedCategories,
  onToggleCategory,
}: DiscoverPageProps) {
  const {
    filteredItems,
    categories: categoriesData,
    localSearch,
    showFilters,
    loading,
    hasError,
    setLocalSearch,
    setShowFilters,
    toggleCategory,
  } = useDiscoverPage(searchQuery, selectedCategories, onToggleCategory);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-start gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Discover Items</h1>
        <button
          onClick={onPostItem}
          className="flex items-center gap-1 rounded-full bg-cyan-500 px-3 py-1 text-sm font-medium text-white shadow-sm transition-colors hover:bg-cyan-600"
        >
          <Plus className="h-4 w-4" />
          Post Item
        </button>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1 rounded-full border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-cyan-500"
        >
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      <SearchBar
        value={localSearch}
        onChange={setLocalSearch}
        placeholder="Search items..."
      />

      {showFilters && (
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <h3 className="mb-4 font-semibold text-gray-900">Categories</h3>
          <CategoryFilter
            categories={categoriesData}
            selectedCategories={selectedCategories}
            onToggleCategory={toggleCategory}
          />
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center">
          <p className="text-gray-600">Loading items...</p>
        </div>
      ) : hasError ? (
        <div className="py-12 text-center">
          <p className="text-red-600">
            Failed to load items. Please try again.
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-gray-600">No items found</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
          {filteredItems.map((item) => {
            const displayItem = mapApiPostToItem(item);
            return (
              <ItemCard
                key={item.id}
                item={displayItem}
                onClick={() => onViewItem(displayItem)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
