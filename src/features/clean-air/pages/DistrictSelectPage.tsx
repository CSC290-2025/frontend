import { useState } from 'react';
import DistrictSearch from '../components/DistrictSearch';
import DistrictList from '../components/DistrictList';

export default function DistrictSelectPage() {
  console.debug('DistrictSelectPage mounted');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="w-full border-b border-gray-700 bg-gray-600 py-4 text-center shadow-md">
        <h1 className="text-xl font-bold text-white uppercase">
          CLEAN AIR MONITOR
        </h1>
      </header>

      <div className="mx-auto max-w-xl space-y-4 p-4 pt-8">
        <DistrictSearch onSearch={(t) => setSearchTerm(t)} />
        <DistrictList searchTerm={searchTerm} />
      </div>
    </div>
  );
}
