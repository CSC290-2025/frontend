import { Trash2 } from 'lucide-react';
import type { MapMarker } from '../interfaces/api';

export interface MarkerSidePanelProps {
  markers: MapMarker[];
  onDelete: (id: number) => void;
  className?: string;
  // 1. add function onFocus
  onFocus?: (lat: number, lng: number) => void;
}

export const MarkerSidePanel = ({
  markers,
  onDelete,
  className = '',
  onFocus,
}: MarkerSidePanelProps) => {
  return (
    <div
      className={`hidden w-[260px] shrink-0 rounded-xl border border-neutral-300 bg-white/95 p-3 shadow-sm md:block ${className}`}
      style={{ maxHeight: 'calc(95vh - 180px)' }}
    >
      <div className="mb-2 text-sm font-semibold">
        Selected markers
        <span className="ml-1 text-xs text-neutral-500">
          ({markers.length})
        </span>
      </div>

      <div
        className="space-y-2 overflow-y-auto pr-1"
        style={{ height: 'calc(100% - 30px)' }}
      >
        {markers.map((m) => (
          <div
            key={m.id}
            // 3. Add onClick call onFocus and add cursor-pointer
            onClick={() => onFocus?.(m.lat, m.lng)}
            className="flex cursor-pointer items-start gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm transition hover:border-blue-200 hover:bg-blue-50"
          >
            <div className="flex-1">
              <div className="text-xs font-semibold">MARKER ID : {m.id}</div>
              <div className="line-clamp-2 text-[11px] text-neutral-600">
                {m.description || 'No description'}
              </div>
            </div>

            <button
              type="button"
              // 4. add e.stopPropagation()
              onClick={(e) => {
                e.stopPropagation();
                onDelete(m.id);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-red-100"
              title="Delete marker"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </button>
          </div>
        ))}

        {markers.length === 0 && (
          <div className="flex h-20 items-center justify-center text-xs text-neutral-500">
            No markers in this area.
          </div>
        )}
      </div>
    </div>
  );
};
