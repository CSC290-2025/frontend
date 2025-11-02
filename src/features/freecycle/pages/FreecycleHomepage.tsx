import { useState } from 'react';
import DiscoverPage from './DiscoverPage';
import PostItemForm from './PostItemForm';
import PostEventForm from './PostEventForm';
import ItemDetailPage from './ItemDetailPage';
import type { PostItem } from '@/features/freecycle/pages/Constants';

type Page =
  | 'home'
  | 'discover'
  | 'my-items'
  | 'my-requests'
  | 'post-item'
  | 'post-event'
  | 'item-detail';

export default function FreecycleHomepage() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [_searchQuery, _setSearchQuery] = useState('');
  const [_selectedItem, _setSelectedItem] = useState<PostItem | null>(null);

  const handleSearch = () => {
    setCurrentPage('discover');
  };

  const _handleViewItem = (item: PostItem) => {
    _setSelectedItem(item);
    setCurrentPage('item-detail');
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'discover':
        return (
          <DiscoverPage
            searchQuery={_searchQuery}
            onViewItem={_handleViewItem}
          />
        );
      case 'my-items':
        return <h1>My Items</h1>;
      case 'my-requests':
        return <h1>My Requests</h1>;
      case 'post-item':
        return <PostItemForm onSuccess={() => setCurrentPage('my-items')} />;
      case 'post-event':
        return <PostEventForm />;
      case 'item-detail':
        return <ItemDetailPage />;
      default:
        return (
          <div className="space-y-8">
            <div className="relative h-48 w-full overflow-hidden rounded-2xl shadow-lg">
              <img
                src="https://images.pexels.com/photos/3184460/pexels-photo-3184460.jpeg?auto=compress&cs=tinysrgb&w=1260"
                alt="Freecycle Community"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-teal-600/80 to-cyan-600/80">
                <div className="px-4 text-center text-white">
                  <h1 className="mb-2 text-4xl font-bold">Freecycle</h1>
                  <p className="text-lg">Share, Reuse, Build Community</p>
                </div>
              </div>
            </div>

            <div className="mx-auto max-w-2xl">
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
