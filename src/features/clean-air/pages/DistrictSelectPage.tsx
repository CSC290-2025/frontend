import { useState } from 'react';
import DistrictSearch from '../components/DistrictSearch';
import DistrictList from '../components/DistrictList';

type Tab = 'all' | 'favorites';

export default function DistrictSelectPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('all');

  const isAllDistrictsActive = activeTab === 'all';

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-100 bg-transparent">
        <div className="mx-auto flex max-w-4xl px-9 lg:px-[100px]">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 p-4 text-center text-lg font-semibold transition-colors ${
              isAllDistrictsActive
                ? 'border-b-2 border-black text-black'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            All Districts
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 p-4 text-center text-lg font-semibold transition-colors ${
              !isAllDistrictsActive
                ? 'border-b-2 border-black text-black'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            My Districts
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-6 px-9 pt-6 lg:px-[100px]">
        <DistrictSearch onSearch={(t) => setSearchTerm(t)} />

        <div className="pb-10">
          <DistrictList
            searchTerm={searchTerm}
            isFavoriteList={!isAllDistrictsActive}
          />
        </div>
      </div>
    </div>
  );
}
