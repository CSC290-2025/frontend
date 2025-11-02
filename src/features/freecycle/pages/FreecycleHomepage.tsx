import { useEffect, useRef, useState } from 'react';
import DiscoverPage from './DiscoverPage';
import PostItemForm from './PostItemForm';
import PostEventForm from './PostEventForm';
import ItemDetailPage from './ItemDetailPage';
import type { PostItem } from '@/features/freecycle/pages/Constants';
import { banners } from './Constants';

function DiscoverBanner() {
  const [currentBanner, setCurrentBanner] = useState(0);
  const bannerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (bannerRef.current) {
        const scrollLeft = bannerRef.current.scrollLeft;
        const width = bannerRef.current.offsetWidth;
        const newIndex = Math.round(scrollLeft / width);
        setCurrentBanner(newIndex);
      }
    };

    const banner = bannerRef.current;
    if (banner) {
      banner.addEventListener('scroll', handleScroll, { passive: true });
      return () => banner.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className="mb-8">
      {' '}
      <div
        ref={bannerRef}
        className="scrollbar-hide w-full snap-x snap-mandatory overflow-x-auto rounded-2xl shadow-lg"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex">
          {banners.map((banner, index) => (
            <div
              key={index}
              className={`h-56 min-w-full bg-gradient-to-r ${banner.gradient} flex snap-start items-center justify-center`}
            >
              <div className="text-center text-black">
                <h2 className="mb-2 text-3xl font-bold">{banner.title}</h2>
                <p className="text-lg opacity-90">{banner.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Banner Indicators */}
      <div className="flex justify-center gap-2 py-4">
        {banners.map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-all duration-300 ${
              currentBanner === index ? 'w-8 bg-cyan-500' : 'w-2 bg-gray-300'
            }`}
          />
        ))}
      </div>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
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
            <DiscoverBanner />
            {/* <div className="relative h-48 w-full overflow-hidden rounded-2xl shadow-lg">
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
            </div> */}

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
