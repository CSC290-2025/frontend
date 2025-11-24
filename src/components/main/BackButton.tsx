import { useNavigate } from '@/router';
import { ChevronLeft } from 'lucide-react';

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
    >
      <ChevronLeft className="h-5 w-5" />
      <span className="font-medium">Back</span>
    </button>
  );
}
