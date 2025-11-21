import React from 'react';

type Accent = 'cyan' | 'red' | 'gray';

const accentClasses: Record<Accent, string> = {
  cyan: 'text-cyan-600',
  red: 'text-red-600',
  gray: 'text-gray-500',
};

interface DataStateProps {
  message: string;
  description?: string;
  accent?: Accent;
  compact?: boolean;
}

export const DataState: React.FC<DataStateProps> = ({
  message,
  description,
  accent = 'gray',
  compact,
}) => (
  <div
    className={`rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 ${
      compact ? 'py-3' : 'py-6'
    } text-center`}
  >
    <p className={`text-sm font-semibold ${accentClasses[accent]}`}>
      {message}
    </p>
    {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
  </div>
);
