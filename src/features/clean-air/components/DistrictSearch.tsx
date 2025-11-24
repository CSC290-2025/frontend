import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

interface DistrictSearchProps {
  onSearch: (searchTerm: string) => void;
}

export default function DistrictSearch({ onSearch }: DistrictSearchProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(event.target.value);
  };

  return (
    <div className="w-full">
           {' '}
      <div className="flex w-full items-center rounded-xl border border-gray-300 bg-white p-3 shadow-md">
               {' '}
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          className="mr-3 text-lg text-gray-500"
        />
               {' '}
        <input
          type="text"
          placeholder="Search for your location"
          onChange={handleChange}
          className="w-full border-none bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none"
        />
             {' '}
      </div>
         {' '}
    </div>
  );
}
