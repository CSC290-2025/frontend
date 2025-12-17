import { useState } from 'react';
import { Link } from '@/router';

export default function TopNavigation() {
  const [growing, setGrowing] = useState(false);

  const onPressStart = () => setGrowing(true);
  const onPressEnd = () => setGrowing(false);

  const linkClass = `cursor-pointer rounded-xl border px-6 py-3 text-base font-medium transition-transform duration-150 ease-out inline-block
    ${
      growing
        ? 'scale-[1.05] shadow-lg bg-[#4A5565] text-white border-[#4A5565]'
        : 'hover:scale-[1.03] hover:shadow-md hover:border-[#4A5565] hover:bg-[#4A5565] hover:text-white'
    }`;

  return (
    <div className="mb-6 flex gap-4">
      <Link
        to="/clean-air/district-selection"
        className={linkClass}
        onMouseDown={onPressStart}
        onMouseUp={onPressEnd}
        onMouseLeave={onPressEnd}
        onTouchStart={onPressStart}
        onTouchEnd={onPressEnd}
        onTouchCancel={onPressEnd}
        aria-pressed={growing}
      >
        Air Quality
      </Link>
    </div>
  );
}
