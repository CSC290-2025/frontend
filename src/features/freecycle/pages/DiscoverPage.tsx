import { Filter, Plus, Sparkles } from 'lucide-react';
import ItemCard from '@/features/freecycle/components/ItemCard';
import CategoryFilter from '@/features/freecycle/components/CategoryFilter';
import type { PostItem } from '@/types/postItem';
import { mapApiPostToItem } from '@/types/postItem';
import { useDiscoverPage } from '@/features/freecycle/hooks/useFreecycle';
import SearchBar from '../components/SearchBar';
import { useNavigate } from '@/router';

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
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-cyan-500" />
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Discover Items
              </h1>
              <p className="text-sm text-gray-500">
                Browse items shared by your community
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onPostItem}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              Post Item
            </button>
            <button
              onClick={() => navigate(`/freecycle/post-event` as any)}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              Post Event
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-400 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
            >
              <Filter className="h-5 w-5" />
              Filter
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <SearchBar
          value={localSearch}
          onChange={setLocalSearch}
          placeholder="Search for items..."
        />
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="rounded-lg bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 p-4">
          {/* <h3 className="mb-4 text-lg font-bold text-gray-900">
            Filter by Category
          </h3> */}
          <CategoryFilter
            categories={categoriesData}
            selectedCategories={selectedCategories}
            onToggleCategory={toggleCategory}
          />
        </div>
      )}

      {/* Content Section */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="inline-block">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-cyan-500"></div>
            <p className="font-medium text-gray-600">Loading items...</p>
          </div>
        </div>
      ) : hasError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="font-semibold text-red-600">Failed to load items</p>
          <p className="mt-2 text-sm text-red-500">Please try again later</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-12 text-center">
          <Sparkles className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <p className="font-semibold text-gray-600">No items found</p>
          <p className="mt-2 text-sm text-gray-500">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => {
            const displayItem = mapApiPostToItem(item);
            return (
              <ItemCard
                key={displayItem.id}
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
