// I WILL FIX THIS PAGE LATER
import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useGetTransactions } from '@/api/generated/transactions';
import { useGetMetroCardsUserUserId } from '@/api/generated/metro-cards';
import { ArrowLeftRight, CreditCard, DollarSign } from 'lucide-react';
import WalletIcon from '@/features/Financial/assets/wallet.svg';
import MetroIcon from '@/features/Financial/assets/metro.svg';
import InsuranceIcon from '@/features/Financial/assets/insurance.svg';
import type { ServiceType } from './ServiceGrid';

import type {
  GetTransactions200DataWalletTransactionsItem,
  GetTransactions200DataCardTransactionsItem,
  GetMetroCardsUserUserId200DataMetroCardsItem,
} from '@/api/generated/model';

const WALLET_TITLE_MAP: Record<string, string> = {
  top_up: 'Wallet Top-up',
  transfer_in: 'Transfer Received',
  transfer_out: 'Transfer Sent',
};

const NEGATIVE_TYPES = new Set([
  'transfer_out',
  'transfer_to_service',
  'charge',
]);

const serviceFromTarget = (target?: string | null): ServiceType | 'other' => {
  if (!target) return 'other';
  const t = target.toLowerCase();
  if (t.includes('metro') || t.includes('transport')) return 'metro';
  if (t.includes('insurance')) return 'insurance';
  return 'other';
};

type UnifiedTx = {
  id: string;
  source: 'wallet' | 'card';
  created_at: string;
  amount: number;
  title: string;
  subtitle?: string;
  service?: ServiceType | 'other';
};

function iconFor(tx: UnifiedTx) {
  if (tx.service === 'wallet')
    return <img src={WalletIcon} alt="wallet" className="h-5 w-5" />;
  if (tx.service === 'metro')
    return <img src={MetroIcon} alt="metro" className="h-5 w-5" />;
  if (tx.service === 'insurance')
    return <img src={InsuranceIcon} alt="insurance" className="h-5 w-5" />;
  if (tx.source === 'card')
    return <CreditCard className="h-5 w-5 text-gray-600" />;
  if (/transfer/i.test(tx.title))
    return <ArrowLeftRight className="h-5 w-5 text-gray-600" />;
  return <DollarSign className="h-5 w-5 text-gray-600" />;
}

function iconBgFor(tx: UnifiedTx) {
  if (tx.service === 'wallet') return 'bg-cyan-50';
  if (tx.service === 'metro') return 'bg-sky-50';
  if (tx.service === 'insurance') return 'bg-pink-50';
  if (tx.source === 'card') return 'bg-gray-100';
  return 'bg-gray-100';
}

export default function TransactionHistory({
  userId,
  wallet,
}: {
  userId?: number | null;
  wallet?: { id: number } | null;
}) {
  const [open, setOpen] = useState(false);

  const { data, isLoading, isFetching, refetch } = useGetTransactions({
    query: {
      staleTime: 0,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
      enabled: !!wallet,
    },
  });
  const { data: metroCardsResp } = useGetMetroCardsUserUserId(userId);

  const merged = useMemo<UnifiedTx[]>(() => {
    if (!wallet) return [];

    const walletRows = (data?.data?.data?.wallet_transactions ??
      []) as GetTransactions200DataWalletTransactionsItem[];
    const cardRows = (data?.data?.data?.card_transactions ??
      []) as GetTransactions200DataCardTransactionsItem[];
    const userCards = (metroCardsResp?.data?.data?.metroCards ??
      []) as GetMetroCardsUserUserId200DataMetroCardsItem[];
    const userCardIds = new Set(userCards.map((c) => c.id));

    const mapWallet = (
      w: GetTransactions200DataWalletTransactionsItem
    ): UnifiedTx => {
      const raw = Number(w.amount);
      const amt = NEGATIVE_TYPES.has(w.transaction_type ?? '')
        ? -Math.abs(raw)
        : Math.abs(raw);
      const title =
        WALLET_TITLE_MAP[w.transaction_type ?? ''] ??
        (w.transaction_type === 'transfer_to_service'
          ? (w.target_service ?? 'Service Payment')
          : (w.description ?? 'Wallet Transaction'));
      const service: ServiceType | 'other' =
        w.transaction_type === 'transfer_to_service'
          ? serviceFromTarget(w.target_service)
          : 'wallet';
      return {
        id: `w-${w.id}`,
        source: 'wallet',
        created_at: w.created_at,
        amount: amt,
        title,
        service,
      };
    };

    const mapCard = (
      c: GetTransactions200DataCardTransactionsItem
    ): UnifiedTx => {
      const raw = Number(c.amount);
      const amt = NEGATIVE_TYPES.has(c.transaction_type ?? '')
        ? -Math.abs(raw)
        : Math.abs(raw);
      const title = c.transaction_category ?? c.card_type ?? 'Card Transaction';
      const service: ServiceType | 'other' = c.card_type
        ? serviceFromTarget(c.card_type)
        : 'other';
      return {
        id: `c-${c.id}`,
        source: 'card',
        created_at: c.created_at,
        amount: amt,
        title,
        subtitle: c.description ?? c.reference ?? undefined,
        service,
      };
    };

    const all = [
      ...walletRows.filter((w) => w.wallet_id === wallet.id).map(mapWallet),
      ...cardRows.filter((c) => userCardIds.has(c.card_id)).map(mapCard),
    ];

    return all.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [data, metroCardsResp, wallet]);

  const preview = merged.slice(0, 3);

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
          <Dialog
            open={open}
            onOpenChange={(isOpen) => {
              setOpen(isOpen);
              if (isOpen) refetch();
            }}
          >
            <DialogTrigger asChild>
              <button className="text-sm font-semibold text-[#06b6d4] hover:underline">
                View All
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>All Transactions</DialogTitle>
              </DialogHeader>
              <div className="max-h-[60vh] space-y-3 overflow-auto py-2">
                {(isLoading || isFetching) && (
                  <div className="text-sm text-gray-500">Loading...</div>
                )}
                {!isLoading && merged.length === 0 && (
                  <div className="text-sm text-gray-500">
                    No transactions found
                  </div>
                )}
                {!isLoading &&
                  merged.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between rounded-xl bg-gray-50 p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBgFor(tx)}`}
                        >
                          {iconFor(tx)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {tx.title}
                          </div>
                          {tx.subtitle && (
                            <div className="text-xs text-gray-500">
                              {tx.subtitle}
                            </div>
                          )}
                          <div className="text-xs text-gray-400">
                            {new Date(tx.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-bold ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}
                        >
                          {tx.amount > 0 ? '+' : ''}
                          {tx.amount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {(isLoading || isFetching) && (
            <div className="text-sm text-gray-500">Loading...</div>
          )}
          {!isLoading &&
            preview.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between rounded-xl bg-gray-50 p-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBgFor(transaction)}`}
                  >
                    {iconFor(transaction)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {transaction.title}
                    </div>
                    {transaction.subtitle && (
                      <div className="text-xs text-gray-500">
                        {transaction.subtitle}
                      </div>
                    )}
                    <div className="text-xs text-gray-400">
                      {new Date(transaction.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`font-bold ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}
                  >
                    {transaction.amount > 0 ? '+' : ''}
                    {transaction.amount.toLocaleString(undefined, {
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
