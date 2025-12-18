import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface GenderDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

function GenderDropdown({ value, onChange }: GenderDropdownProps) {
  const [open, setOpen] = useState(false);
  const options = ['male', 'female', 'none'];

  const displayValue = (val: string) => {
    if (val === 'male') return 'Male';
    if (val === 'female') return 'Female';
    return 'Prefer not to say';
  };

  return (
    <div className="relative w-full">
      <div
        className="flex h-[38px] cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 transition-all duration-200 hover:border-gray-300 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
        onClick={() => setOpen(!open)}
      >
        <span>{displayValue(value)}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </div>

      {open && (
        <div className="absolute left-0 z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
          {options.map((opt) => (
            <div
              key={opt}
              className="cursor-pointer px-3 py-2 text-sm text-gray-900 transition-colors first:rounded-t-lg last:rounded-b-lg hover:bg-cyan-50"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {displayValue(opt)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GenderDropdown;
