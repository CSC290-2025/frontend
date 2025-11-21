import { Link } from '@/router';

export default function TopNavigation() {
  return (
    <div className="mb-6 flex gap-4">
      <Link
        to="/weatherMain"
        className="cursor-pointer rounded-xl border px-4 py-2 text-sm transition-all hover:border-blue-400 hover:bg-blue-50"
      >
        Weather reports
      </Link>

      <Link
        to="/air-quality"
        className="cursor-pointer rounded-xl border px-4 py-2 text-sm transition-all hover:border-blue-400 hover:bg-blue-50"
      >
        Clean Air
      </Link>
    </div>
  );
}
