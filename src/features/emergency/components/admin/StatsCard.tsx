import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  variant?: 'default' | 'warning' | 'success' | 'info';
  trend?: {
    value: number;
    isUp: boolean;
  };
}

export function StatsCard({
  title,
  value,
  icon,
  variant = 'default',
  trend,
}: StatsCardProps) {
  // Styles for icon colors and specific effects
  const variants = {
    default: {
      iconBg: 'bg-gradient-to-br from-gray-100 to-gray-200',
      iconColor: 'text-gray-600',
      borderHover: 'hover:border-gray-300',
      ring: 'focus:ring-gray-200',
    },
    warning: {
      iconBg: 'bg-gradient-to-br from-orange-100 to-orange-200',
      iconColor: 'text-orange-600',
      borderHover: 'hover:border-orange-200',
      ring: 'focus:ring-orange-100',
    },
    success: {
      iconBg: 'bg-gradient-to-br from-emerald-100 to-emerald-200',
      iconColor: 'text-emerald-600',
      borderHover: 'hover:border-emerald-200',
      ring: 'focus:ring-emerald-100',
    },
    info: {
      iconBg: 'bg-gradient-to-br from-blue-100 to-blue-200',
      iconColor: 'text-blue-600',
      borderHover: 'hover:border-blue-200',
      ring: 'focus:ring-blue-100',
    },
  };

  const currentVariant = variants[variant];

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 ease-in-out',
        'hover:-translate-y-1 hover:shadow-md', // Lift card slightly on hover
        currentVariant.borderHover
      )}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-muted-foreground/80 text-sm font-medium">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold tracking-tight text-gray-900">
              {value.toLocaleString()}{' '}
              {/* Automatically adds commas (e.g., 1,234) */}
            </h3>
          </div>
        </div>

        {/* Icon Container with Gradient */}
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl shadow-inner transition-transform group-hover:scale-110',
            currentVariant.iconBg,
            currentVariant.iconColor
          )}
        >
          {icon}
        </div>
      </div>

      {/* Trend Section */}
      {trend && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          <span
            className={cn(
              'flex items-center gap-0.5 rounded-full px-2 py-0.5 font-medium',
              trend.isUp
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            )}
          >
            {trend.isUp ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {trend.value}%
          </span>
          <span className="text-muted-foreground">from last hour</span>
        </div>
      )}
    </div>
  );
}
