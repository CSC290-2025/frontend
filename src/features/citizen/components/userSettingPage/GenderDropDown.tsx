import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface GenderDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

function GenderDropdown({ value, onChange }: GenderDropdownProps) {
  const [open, setOpen] = useState(false);
  const options = ['male', 'female', 'none'];

  return (
    <div className="relative w-full md:w-[187px] lg:w-[187px]">
      <div
        className="flex h-12 cursor-pointer items-center justify-between rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-4 py-3 text-sm text-[#2B5991] md:h-[50px] md:px-[16px] md:py-[13px] md:text-base lg:h-[50px] lg:px-[16px] lg:py-[13px] lg:text-[16px]"
        onClick={() => setOpen(!open)}
      >
        {value}
        {open ? (
          <ChevronUp className="h-5 w-5 md:h-6 md:w-6 lg:h-[24px] lg:w-[24px]" />
        ) : (
          <ChevronDown className="h-5 w-5 md:h-6 md:w-6 lg:h-[24px] lg:w-[24px]" />
        )}
      </div>

      {open && (
        <div className="absolute left-0 z-10 mt-1 w-full rounded-[10px] border border-[#00000040] bg-white shadow-lg">
          {options.map((opt) => (
            <div
              key={opt}
              className="cursor-pointer px-4 py-2 text-sm hover:bg-[#2B5991]/10 md:text-base"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GenderDropdown;
