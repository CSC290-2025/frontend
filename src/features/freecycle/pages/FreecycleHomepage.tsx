import { useState } from 'react';
import DiscoverPage from './DiscoverPage';
import PostItemForm from './PostItemForm';
import PostEventForm from './PostEventForm';
import MyRequestsPage from './MyRequestsPage';
import type { PostItem } from '@/types/postItem';
import { mapApiPostToItem } from '@/types/postItem';
import DiscoverBanner from '@/features/freecycle/components/DiscoverBanner';
import ItemCard from '@/features/freecycle/components/ItemCard';
import { useNavigate } from '@/router';
import { Compass, ShoppingBag, Heart } from 'lucide-react';
import {
  useMyPosts,
  useDeletePost,
  useMarkPostAsGiven,
  useMarkPostAsNotGiven,
} from '@/features/freecycle/hooks/useFreecycle';

type Tab = 'discover' | 'my-items' | 'my-requests';
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

  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [activeTab, setActiveTab] = useState<Tab>('discover');
  const [searchQuery] = useState('');

  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  // Fetch user's posts for "My Items" tab
  const { data: userPosts, isLoading: postsLoading } = useMyPosts();
  const deletePostMutation = useDeletePost();
  const markAsGivenMutation = useMarkPostAsGiven();
  const markAsNotGivenMutation = useMarkPostAsNotGiven();

  const handleViewItem = (item: PostItem) => {
    navigate(`/freecycle/items/${item.id}` as any);
  };

  const handleToggleCategory = (categoryId: number) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      }
      return [...prev, categoryId];
    });
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'discover':
        return (
          <DiscoverPage
            searchQuery={searchQuery}
            onViewItem={handleViewItem}
            selectedCategories={selectedCategories}
            onToggleCategory={handleToggleCategory}
          />
        );
      case 'my-requests':
        return <MyRequestsPage />;
      case 'post-item':
        return (
          <PostItemForm
            onSuccess={() => setCurrentPage('home')}
            onBack={() => setCurrentPage('home')}
          />
        );
      case 'post-event':
        return <PostEventForm _onSuccess={() => setCurrentPage('home')} />;

      default:
        return (
          <div className="space-y-6">
            {/* Banner Section */}
            <div className="relative w-full overflow-hidden rounded-3xl">
              <DiscoverBanner />
            </div>

            {/* Tabs Navigation */}
            <div className="flex gap-2 border-b border-gray-200">
              {[
                { id: 'discover' as Tab, label: 'Discover', icon: Compass },
                { id: 'my-items' as Tab, label: 'My Items', icon: ShoppingBag },
                { id: 'my-requests' as Tab, label: 'My Requests', icon: Heart },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 font-semibold transition-all duration-200 ${
                    activeTab === id
                      ? 'border-cyan-500 text-cyan-600'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-4">
              {activeTab === 'discover' && (
                <DiscoverPage
                  searchQuery={searchQuery}
                  onViewItem={handleViewItem}
                  onPostItem={() => setCurrentPage('post-item')}
                  selectedCategories={selectedCategories}
                  onToggleCategory={handleToggleCategory}
                />
              )}

              {activeTab === 'my-items' && (
                <div>
                  {postsLoading ? (
                    <div className="py-16 text-center">
                      <div className="inline-block">
                        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-cyan-500"></div>
                        <p className="font-medium text-gray-600">
                          Loading your items...
                        </p>
                      </div>
                    </div>
                  ) : !userPosts || userPosts.length === 0 ? (
                    <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-lg">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-100">
                        <ShoppingBag className="h-8 w-8 text-cyan-600" />
                      </div>
                      <h2 className="mb-2 text-2xl font-bold text-gray-900">
                        No items yet
                      </h2>
                      <p className="mb-6 text-gray-600">
                        You have not posted anything yet. Start sharing items
                        you no longer need!
                      </p>
                      <button
                        onClick={() => setCurrentPage('post-item')}
                        className="rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 px-6 py-3 font-bold text-white shadow-lg transition-all duration-200 hover:shadow-xl"
                      >
                        Post Your First Item
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">
                          My Items ({userPosts.length})
                        </h2>
                        <button
                          onClick={() => setCurrentPage('post-item')}
                          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
                        >
                          Post New Item
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {userPosts.map((post) => {
                          const item = mapApiPostToItem(post);
                          return (
                            <ItemCard
                              key={item.id}
                              item={item}
                              onClick={() =>
                                navigate(`/freecycle/items/${item.id}` as any)
                              }
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'my-requests' && <MyRequestsPage />}
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {renderContent()}
      </div>
    </div>
  );
}
