import { Card, CardContent } from '@/components/ui/card';
import { Heart, Wallet, ArrowLeftRight } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'insurance' | 'topup' | 'transfer';
  title: string;
  date: string;
  amount: number;
  balance: number;
}

const transactions: Transaction[] = [
  {
    id: '1',
    type: 'insurance',
    title: 'Health Insurance Top-up',
    date: 'Today, 9:30 AM',
    amount: -500.0,
    balance: 8888388.0,
  },
  {
    id: '2',
    type: 'topup',
    title: 'Health Insurance Top-up',
    date: 'Today, 2:30 AM',
    amount: 1000.0,
    balance: 8889388.0,
  },
  {
    id: '3',
    type: 'transfer',
    title: 'Transfer to Jungwon',
    date: 'Yesterday, 9:30 AM',
    amount: -500.0,
    balance: 8888888.0,
  },
];

export default function TransactionHistory() {
  const getIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'insurance':
        return <Heart className="h-5 w-5 text-red-500" fill="currentColor" />;
      case 'topup':
        return <Wallet className="h-5 w-5 text-gray-600" />;
      case 'transfer':
        return <ArrowLeftRight className="h-5 w-5 text-gray-600" />;
    }
  };

  const getIconBg = (type: Transaction['type']) => {
    switch (type) {
      case 'insurance':
        return 'bg-red-100';
      case 'topup':
        return 'bg-gray-100';
      case 'transfer':
        return 'bg-gray-100';
    }
  };

  return (
    <Card className="mb-6 border-none shadow-sm">
      <CardContent className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 rounded-full bg-[#06b6d4]"></div>
            <h3 className="text-lg font-bold text-gray-900">
              Recent Transactions
            </h3>
          </div>
          <button className="text-sm font-semibold text-[#06b6d4] hover:underline">
            View All
          </button>
        </div>

        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between rounded-xl bg-gray-50 p-4"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${getIconBg(
                    transaction.type
                  )}`}
                >
                  {getIcon(transaction.type)}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {transaction.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {transaction.date}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`font-bold ${
                    transaction.amount > 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {transaction.amount > 0 ? '+' : ''}
                  {transaction.amount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div className="text-xs text-gray-400">
                  Bal:{' '}
                  {transaction.balance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
