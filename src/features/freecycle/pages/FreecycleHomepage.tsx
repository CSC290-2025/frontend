import { useState } from 'react';
import DiscoverPage from './DiscoverPage';
import PostItemForm from './PostItemForm';
import PostEventForm from './postEventForm';
import ItemDetailPage from './ItemDetailPage';
import type { PostItem } from '@/types/postItem';
import DiscoverBanner from '@/features/freecycle/components/DiscoverBanner';
import MyItemsPage from './MyItemsPage';
import MyRequestsPage from './MyRequestsPage';
import SearchBar from '@/features/freecycle/components/SearchBar';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from '@/router';

type Page =
  | 'home'
  | 'discover'
  | 'my-items'
  | 'my-requests'
  | 'post-item'
  | 'post-event'
  | 'item-detail';

export default function FreecycleHomepage() {
  const navigate = useNavigate();

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
      // case 'my-items':
      //   return <MyItemsPage _onViewItem={handleViewItem} />;
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
          <div className="space-y-6">
            <div className="relative w-full overflow-hidden rounded-2xl">
              <DiscoverBanner />
            </div>

            <div className="flex flex-col items-center gap-4 md:flex-row">
              {/* <div className="w-full md:flex-1">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search for items"
                />
              </div> */}

              <div className="flex w-full justify-stretch gap-3 md:w-auto md:justify-start">
                <button
                  onClick={() => navigate('/freecycle/my-items')}
                  className="flex-1 rounded-full bg-cyan-500 px-6 py-3 text-sm font-medium text-white shadow-md transition-colors hover:bg-cyan-600 md:flex-none"
                >
                  My Items
                </button>
                <button
                  onClick={() => setCurrentPage('my-requests')}
                  className="flex-1 rounded-full bg-cyan-500 px-6 py-3 text-sm font-medium text-white shadow-md transition-colors hover:bg-cyan-600 md:flex-none"
                >
                  Request Items
                </button>
              </div>
            </div>

            <div>
              <DiscoverPage
                searchQuery={searchQuery}
                onViewItem={handleViewItem}
                onPostItem={() => setCurrentPage('post-item')}
              />
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
            className="mb-6 flex items-center gap-1 font-medium text-cyan-600 hover:text-cyan-700"
          >
            {/* ← Back to Home */}
            <ArrowLeft className="h-5 w-5" /> Back to Home
          </button>
        )}
        {renderContent()}
      </div>
    </div>
  );
}
