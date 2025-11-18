import { useState } from 'react';

interface BloodTypeDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

function BloodTypeDropdown({ value, onChange }: BloodTypeDropdownProps) {
  const [open, setOpen] = useState(false);
  const options = ['A', 'B', 'AB', 'O'];

  return (
    <div className="relative w-[187px]">
      <div
        className="flex cursor-pointer items-center justify-between rounded-[10px] border border-[#00000040] bg-[#FAFAFA] text-[#2B5991] lg:h-[50px] lg:px-[16px] lg:py-[13px] lg:text-[16px]"
        onClick={() => setOpen(!open)}
      >
        {value}
        <span className="text-gray-500">▼</span>{' '}
        {/* change this icon to library later */}
      </div>

      {open && (
        <div className="absolute z-10 w-full rounded-[10px] border border-[#00000040] bg-white shadow-lg lg:left-0 lg:mt-1">
          {options.map((opt) => (
            <div
              key={opt}
              className="cursor-pointer px-4 py-2 hover:bg-[#2B5991]/10"
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

export default BloodTypeDropdown;
