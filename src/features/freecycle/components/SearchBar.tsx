import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search for items',
}: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-gray-300 py-3 pr-4 pl-12 focus:border-transparent focus:ring-2 focus:ring-cyan-500 focus:outline-none"
      />
    </div>
  );
}
