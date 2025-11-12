import { useState } from 'react';
import DiscoverPage from './DiscoverPage';
import PostItemForm from './PostItemForm';
import PostEventForm from './PostEventForm';
import ItemDetailPage from './ItemDetailPage';
import type { PostItem } from '@/types/postItem';
import DiscoverBanner from '@/features/freecycle/components/DiscoverBanner';
import MyItemsPage from './MyItemsPage';
import MyRequestsPage from './MyRequestsPage';
import SearchBar from '@/features/freecycle/components/SearchBar';

type Page =
  | 'home'
  | 'discover'
  | 'my-items'
  | 'my-requests'
  | 'post-item'
  | 'post-event'
  | 'item-detail';

export default function FreecycleHomepage() {
  // State to manage current page
  const [currentPage, setCurrentPage] = useState<Page>('home');
  // State to manage search query
  const [searchQuery, setSearchQuery] = useState('');
  // State to hold the selected item for detail view
  const [selectedItem, setSelectedItem] = useState<PostItem | null>(null);

  const handleSearch = () => {
    setCurrentPage('discover');
  };

  const handleViewItem = (item: PostItem) => {
    setSelectedItem(item);
    setCurrentPage('item-detail');
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'discover':
        return (
          <DiscoverPage searchQuery={searchQuery} onViewItem={handleViewItem} />
        );
      case 'my-items':
        return <MyItemsPage _onViewItem={handleViewItem} />;
      case 'my-requests':
        return <MyRequestsPage />;
      case 'post-item':
        return <PostItemForm onSuccess={() => setCurrentPage('my-items')} />;
      case 'post-event':
        return <PostEventForm _onSuccess={() => setCurrentPage('home')} />;
      case 'item-detail':
        return (
          <ItemDetailPage
            _item={selectedItem!}
            _onBack={() => setCurrentPage('discover')}
          />
        );
      default:
        return (
          <div className="space-y-8">
            <div className="relative h-48 w-full overflow-hidden rounded-2xl shadow-lg">
              <DiscoverBanner />
            </div>

            <div className="mx-auto max-w-2xl">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search for items"
              />
              <div className="mt-4 text-center">
                <button
                  onClick={handleSearch}
                  className="rounded-full bg-cyan-500 px-6 py-2 text-white transition-colors hover:bg-cyan-600"
                >
                  Search
                </button>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <button
                onClick={() => setCurrentPage('discover')}
                className="rounded-2xl bg-white p-6 text-center shadow-md transition-all hover:shadow-lg"
              >
                <div className="mb-2 text-3xl text-cyan-500">🔍</div>
                <h3 className="font-semibold text-gray-900">Discover Items</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Browse available donations
                </p>
              </button>

              {/* I want to show Discoverpage on Homepage */}
              <div>
                <DiscoverPage
                  searchQuery={searchQuery}
                  onViewItem={handleViewItem}
                />
              </div>

              <button
                onClick={() => setCurrentPage('post-item')}
                className="rounded-2xl bg-white p-6 text-center shadow-md transition-all hover:shadow-lg"
              >
                <div className="mb-2 text-3xl text-cyan-500">➕</div>
                <h3 className="font-semibold text-gray-900">Post Item</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Donate something you do not need
                </p>
              </button>
            </div>

            {/* DiscoverPage integrated into homepage */}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {currentPage !== 'home' && (
          <button
            onClick={() => setCurrentPage('home')}
            className="mb-6 font-medium text-cyan-600 hover:text-cyan-700"
          >
            ← Back to Home
          </button>
        )}

        {currentPage === 'home' && (
          <div className="mb-6 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setCurrentPage('my-items')}
              className="rounded-full bg-cyan-500 px-6 py-3 font-medium text-white transition-colors hover:bg-cyan-600"
            >
              My Items
            </button>
            <button
              onClick={() => setCurrentPage('my-requests')}
              className="rounded-full bg-cyan-500 px-6 py-3 font-medium text-white transition-colors hover:bg-cyan-600"
            >
              Request Items
            </button>
          </div>
        )}

        {renderContent()}
      </div>
    </div>
  );
}
