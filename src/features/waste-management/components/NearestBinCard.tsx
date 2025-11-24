import type { Bin } from '@/features/waste-management/types';

interface NearestBinCardProps {
  bin: Bin | null;
}

export default function NearestBinCard({ bin }: NearestBinCardProps) {
  if (!bin) return null;

  return (
    <div className="absolute top-4 right-4 z-[400] max-w-xs rounded-xl border border-gray-200 bg-white/90 p-4 shadow-lg backdrop-blur-sm">
      <p className="text-xs font-bold tracking-wide text-gray-400 uppercase">
        Nearest Location
      </p>
      <h3 className="mt-1 text-lg font-bold text-gray-800">{bin.name}</h3>
      <p className={`text-sm font-medium ${bin.color}`}>{bin.type}</p>
      <div className="mt-3 flex flex-col gap-1 text-sm font-semibold text-blue-600">
        <span>📍 {bin.distance}</span>
        <span className="text-xs text-gray-400">
          Click another pin or list item to preview it
        </span>
      </div>
    </div>
  );
}
