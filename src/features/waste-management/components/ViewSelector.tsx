import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, BarChart3 } from 'lucide-react';

interface ViewSelectorProps {
  viewType: 'monthly' | 'daily';
  onViewTypeChange: (type: 'monthly' | 'daily') => void;
  selectedMonth?: string;
  selectedYear?: string;
  selectedDate?: string;
  onMonthChange?: (month: string) => void;
  onYearChange?: (year: string) => void;
  onDateChange?: (date: string) => void;
}

export default function ViewSelector({
  viewType,
  onViewTypeChange,
  selectedMonth,
  selectedYear,
  selectedDate,
  onMonthChange,
  onYearChange,
  onDateChange,
}: ViewSelectorProps) {
  return (
    <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
      <CardContent className="pt-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-2">
            <Button
              variant={viewType === 'daily' ? 'default' : 'outline'}
              onClick={() => onViewTypeChange('daily')}
              className={viewType === 'daily' ? 'bg-green-600' : ''}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Daily
            </Button>
            <Button
              variant={viewType === 'monthly' ? 'default' : 'outline'}
              onClick={() => onViewTypeChange('monthly')}
              className={viewType === 'monthly' ? 'bg-green-600' : ''}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Monthly
            </Button>
          </div>

          {viewType === 'monthly' ? (
            <div className="flex flex-1 gap-2">
              <Select value={selectedMonth} onValueChange={onMonthChange}>
                <SelectTrigger className="border-purple-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>
                      {new Date(2025, i).toLocaleString('default', {
                        month: 'long',
                      })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={onYearChange}>
                <SelectTrigger className="w-32 border-purple-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2023, 2024, 2025].map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange?.(e.target.value)}
              className="flex-1 border-purple-200"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
