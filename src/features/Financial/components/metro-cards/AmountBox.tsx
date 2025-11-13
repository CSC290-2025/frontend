import type { GetMetroCardsUserUserId200DataMetroCardsItem } from '@/api/generated/model';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

export type MetroCardItem = GetMetroCardsUserUserId200DataMetroCardsItem;

interface AmountBoxProps {
  metroCards: MetroCardItem[];
  onRefetch: () => Promise<unknown>;
}

export default function AmountBox({ metroCards, onRefetch }: AmountBoxProps) {
  const totalBalance = metroCards
    .filter((card) => card.status === 'active')
    .reduce((acc, card) => acc + card.balance!, 0);

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Total Available Balance</CardTitle>
          <CardDescription>Your combined metro card balance</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onRefetch} title="Refresh">
          <RefreshCw className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="relative py-8">
          <div className="mx-auto flex h-64 w-64 items-center justify-center rounded-full border-8 border-cyan-400 bg-gradient-to-br from-cyan-50 to-blue-50">
            <div className="text-center">
              <p className="mb-2 text-sm text-gray-600">Available Balance</p>
              <p className="text-4xl font-bold text-gray-900">
                {totalBalance.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          Updated at{' '}
          {new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })}
        </p>
      </CardContent>
    </Card>
  );
}
