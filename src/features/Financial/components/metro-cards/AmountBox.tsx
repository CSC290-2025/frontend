import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

interface AmountBoxProps {
  balance: number;
  onRefetch: () => Promise<unknown>;
  isLoading?: boolean;
}

export default function AmountBox({
  balance,
  onRefetch,
  isLoading,
}: AmountBoxProps) {
  return (
    <Card className="relative mb-8 overflow-hidden rounded-2xl border-none bg-white shadow-sm">
      <CardContent className="flex flex-col items-center justify-center p-8">
        <div className="relative flex items-center justify-center">
          <div className="flex h-64 w-64 items-center justify-center rounded-full border-[6px] border-cyan-400 bg-white shadow-[0_0_15px_rgba(34,211,238,0.3)]">
            <div className="text-center">
              <p className="mb-2 text-sm font-medium text-gray-500">
                Available Balance
              </p>
              <h2 className="text-4xl font-bold tracking-tight text-gray-900">
                {balance.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h2>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="absolute right-6 bottom-6">
          <Button
            variant="secondary"
            size="icon"
            onClick={onRefetch}
            disabled={isLoading}
            className="h-10 w-10 rounded-full bg-gray-500 text-white hover:bg-gray-600"
            title="Refresh Balance"
          >
            <RefreshCw
              className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`}
            />
          </Button>
        </div>

        <p className="mt-8 text-center text-sm text-gray-400">
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
