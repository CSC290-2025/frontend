import { useState } from 'react';
import DistrictSearch from '../components/DistrictSearch';
import DistrictList from '../components/DistrictList';

type Tab = 'all' | 'favorites';

export default function DistrictSelectPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('all');

  const isAllDistrictsActive = activeTab === 'all';

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="w-full border-b border-gray-700 bg-gray-600 py-4 text-center shadow-md">
        <h1 className="text-xl font-bold text-white uppercase">
          CLEAN AIR MONITOR
        </h1>
      </header>

      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-2xl">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 p-4 text-center text-lg font-semibold transition-colors ${
              isAllDistrictsActive
                ? 'border-b-2 border-black text-black'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All Districts
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 p-4 text-center text-lg font-semibold transition-colors ${
              !isAllDistrictsActive
                ? 'border-b-2 border-black text-black'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            My Districts
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-4 p-4 pt-8">
        <DistrictSearch onSearch={(t) => setSearchTerm(t)} />
        <DistrictList
          searchTerm={searchTerm}
          isFavoriteList={!isAllDistrictsActive}
        />
      </div>
    </div>
  );
}
