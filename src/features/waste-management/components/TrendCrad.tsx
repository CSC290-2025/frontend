import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface TrendCardProps {
  totalWeight: number;
  label?: string;
}

export default function TrendCard({
  totalWeight,
  label = 'Total waste in this period',
}: TrendCardProps) {
  return (
    <Card className="border-0 bg-linear-to-br from-purple-500 to-pink-500 text-white shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <TrendingUp className="h-5 w-5" />
          Trend Wastes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-2 text-5xl font-bold">
          {totalWeight.toFixed(0)}kg
        </div>
        <p className="text-purple-100">{label}</p>
      </CardContent>
    </Card>
  );
}
