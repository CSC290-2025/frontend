import { useMemo, useState } from 'react';
import DistrictItem from './DistrictItem';
import { useDistrictsQuery } from '@/features/clean-air';
import type { District } from '@/types/district';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

interface SearchProps {
  onSearch: (searchTerm: string) => void;
}

function SearchComponent({ onSearch }: SearchProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(event.target.value);
  };

  return (
    <div className="w-full">
      <div className="flex w-full items-center rounded-lg border border-black bg-white p-3 shadow-md">
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          className="mr-3 text-lg text-gray-500"
        />
        <input
          type="text"
          placeholder="search for city"
          onChange={handleChange}
          className="w-full border-none bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none"
        />
      </div>
    </div>
  );
}

export default function DistrictList() {
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: districts = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetched,
  } = useDistrictsQuery();

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const filtered = useMemo(() => {
    if (!searchTerm) return districts;
    const q = searchTerm.toLowerCase();
    return districts.filter((d: District) =>
      (d.district ?? (d as any).name ?? '').toString().toLowerCase().includes(q)
    );
  }, [searchTerm, districts]);
  if (isLoading)
    return <div className="p-8 text-center">Loading districts...</div>;
  if (isError)
    return (
      <div className="p-8 text-center">
        Error: {(error as Error).message}
        <div className="mt-2">
          <button
            onClick={() => refetch()}
            className="rounded bg-blue-500 px-2 py-1 text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-6 pt-6">
      <SearchComponent onSearch={handleSearch} />

      {isFetched && filtered.length === 0 ? (
        <div className="py-10 text-center text-gray-700">
          Area/Zone not found{searchTerm ? ` for "${searchTerm}"` : '.'}
        </div>
      ) : (
        filtered.map((item: District) => (
          <DistrictItem
            key={(item.district ?? (item as any).name) as string}
            district={item.district ?? (item as any).name}
            aqi={item.aqi}
            category={item.category}
            pm25={item.pm25}
            measured_at={item.measured_at}
          />
        ))
      )}
    </div>
  );
}
