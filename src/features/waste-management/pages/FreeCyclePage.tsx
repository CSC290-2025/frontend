import { useState } from 'react';
import { Search, Plus, Filter, Bookmark, Package, User } from 'lucide-react';
import { Header } from '../components/Header';
import { PageWrapper } from '../components/PageWrapper';
import { useItems } from '../hooks/useItems';

interface FreeCyclePageProps {
  onNavigate: (page: string) => void;
}

export default function FreeCyclePage({ onNavigate }: FreeCyclePageProps) {
  const { items, loading } = useItems();
  const [activeTab, setActiveTab] = useState('My Items');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'All',
    'Books',
    'Furniture',
    'Electronics',
    'Clothing',
    'Toys',
  ];

  const filteredItems =
    selectedCategory === 'All'
      ? items
      : items.filter((item) => item.category === selectedCategory);

  return (
    <PageWrapper>
      <Header onNavigate={onNavigate} />

      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search for items"
          className="w-full rounded-lg border border-gray-200 px-4 py-3 pl-10"
        />
        <Search className="absolute top-3.5 left-3 text-gray-400" size={20} />
      </div>

      <div className="mb-6 flex justify-center gap-4">
        <button
          onClick={() => setActiveTab('My Items')}
          className={`rounded-full px-8 py-3 font-medium transition-colors ${
            activeTab === 'My Items'
              ? 'bg-cyan-400 text-white'
              : 'bg-white text-gray-700'
          }`}
        >
          My Items
        </button>
        <button
          onClick={() => setActiveTab('Request Items')}
          className={`rounded-full px-8 py-3 font-medium transition-colors ${
            activeTab === 'Request Items'
              ? 'bg-cyan-400 text-white'
              : 'bg-white text-gray-700'
          }`}
        >
          Request Items
        </button>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold">Items</h2>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-lg bg-cyan-400 px-6 py-2 text-white hover:bg-cyan-500">
            <Plus size={20} />
            create
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-6 py-2 text-gray-700 hover:bg-gray-50">
            <Filter size={20} />
            Filter
          </button>
        </div>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-4 py-2 font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-cyan-400 text-white'
                : 'border border-gray-200 bg-white text-gray-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group cursor-pointer overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:shadow-lg"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute top-2 right-2 rounded-full bg-white p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <Bookmark size={18} className="text-gray-600" />
                </div>
                <div className="absolute top-2 left-2">
                  <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-medium text-white">
                    {item.condition}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <span className="rounded bg-cyan-100 px-2 py-1 text-xs text-cyan-700">
                    {item.category}
                  </span>
                </div>
                <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                  {item.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <User size={14} />
                    {item.postedBy}
                  </span>
                  <span>{item.postedDate}</span>
                </div>
                <button className="mt-3 w-full rounded-lg bg-cyan-400 py-2 text-white transition-colors hover:bg-cyan-500">
                  Request Item
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredItems.length === 0 && !loading && (
        <div className="py-16 text-center">
          <Package size={64} className="mx-auto mb-4 text-gray-300" />
          <h3 className="mb-2 text-xl font-semibold text-gray-600">
            No items found
          </h3>
          <p className="text-gray-500">Try selecting a different category</p>
        </div>
      )}
    </PageWrapper>
  );
}
