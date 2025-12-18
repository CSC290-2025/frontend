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
import { useUseGetUserInsuranceCards } from '@/api/generated/insurance-cards';
import { ArrowLeftRight, CreditCard, DollarSign } from 'lucide-react';
import WalletIcon from '@/features/Financial/assets/wallet.svg';
import MetroIcon from '@/features/Financial/assets/metro.svg';
import InsuranceIcon from '@/features/Financial/assets/insurance.svg';
import type { ServiceType } from './ServiceGrid';

const NEGATIVE_TYPES = new Set([
  'transfer_out',
  'transfer_to_service',
  'charge',
]);

const WALLET_TITLE_MAP: Record<string, string> = {
  top_up: 'Wallet Top-up',
  transfer_in: 'Transfer Received',
  transfer_out: 'Transfer Sent',
};

type UnifiedTx = {
  id: string;
  created_at: string;
  amount: number;
  title: string;
  subtitle?: string;
  service: ServiceType | 'other';
  iconType: 'wallet' | 'metro' | 'insurance' | 'card' | 'transfer' | 'default';
};

const getServiceType = (target?: string | null): ServiceType | 'other' => {
  const t = target?.toLowerCase() || '';
  if (t.includes('metro') || t.includes('transport')) return 'metro';
  if (t.includes('insurance')) return 'insurance';
  return 'other';
};

const getIconConfig = (tx: UnifiedTx) => {
  switch (tx.service) {
    case 'wallet':
      return { src: WalletIcon, bg: 'bg-cyan-50', isImg: true };
    case 'metro':
      return { src: MetroIcon, bg: 'bg-sky-50', isImg: true };
    case 'insurance':
      return { src: InsuranceIcon, bg: 'bg-pink-50', isImg: true };
    default:
      if (tx.iconType === 'card')
        return { Icon: CreditCard, bg: 'bg-gray-100' };
      if (tx.iconType === 'transfer')
        return { Icon: ArrowLeftRight, bg: 'bg-gray-100' };
      return { Icon: DollarSign, bg: 'bg-gray-100' };
  }
};

const TransactionRow = ({ tx }: { tx: UnifiedTx }) => {
  const { src, Icon, bg, isImg } = getIconConfig(tx);
  const isPositive = tx.amount > 0;

  return (
    <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}
        >
          {isImg ? (
            <img src={src} alt={tx.service} className="h-5 w-5" />
          ) : (
            Icon && <Icon className="h-5 w-5 text-gray-600" />
          )}
        </div>
        <div>
          <div className="font-semibold text-gray-900">{tx.title}</div>
          {tx.subtitle && (
            <div className="text-xs text-gray-500">{tx.subtitle}</div>
          )}
          <div className="text-xs text-gray-400">
            {new Date(tx.created_at).toLocaleString()}
          </div>
        </div>
      </div>
      <div
        className={`text-right font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}
      >
        {isPositive ? '+' : ''}
        {tx.amount.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </div>
    </div>
  );
};

export default function TransactionHistory({
  userId,
  wallet,
}: {
  userId?: number | null;
  wallet?: { id: number } | null;
}) {
  const [open, setOpen] = useState(false);

  const { data, isLoading, refetch } = useGetTransactions({
    query: {
      staleTime: 0,
      refetchOnMount: true,
      enabled: !!wallet,
    },
  });
  const { data: metroCardsResp } = useGetMetroCardsUserUserId(userId);
  const { data: insuranceCardsResp } = useUseGetUserInsuranceCards(userId);

  const transactions = useMemo<UnifiedTx[]>(() => {
    if (!wallet) return [];

    const wData = data?.data?.wallet_transactions || [];
    const cData = data?.data?.card_transactions || [];
    const userCardIds = new Set([
      ...(metroCardsResp?.data?.metroCards?.map((c) => c.id) || []),
      ...(insuranceCardsResp?.data?.insuranceCards?.map((c) => c.id) || []),
    ]);

    const mappedWallet = wData
      .filter((w) => w.wallet_id === wallet.id)
      .map((w): UnifiedTx => {
        const isService = w.transaction_type === 'transfer_to_service';
        const amt = Number(w.amount);
        return {
          id: `w-${w.id}`,
          created_at: w.created_at,
          amount: NEGATIVE_TYPES.has(w.transaction_type ?? '')
            ? -Math.abs(amt)
            : Math.abs(amt),
          title:
            WALLET_TITLE_MAP[w.transaction_type ?? ''] ??
            (w.target_service || w.description || 'Wallet Transaction'),
          service: isService ? getServiceType(w.target_service) : 'wallet',
          iconType: /transfer/i.test(w.transaction_type || '')
            ? 'transfer'
            : 'default',
        };
      });

    const mappedCards = cData
      .filter((c) => userCardIds.has(c.card_id))
      .map((c): UnifiedTx => {
        const amt = Number(c.amount);
        return {
          id: `c-${c.id}`,
          created_at: c.created_at,
          amount: NEGATIVE_TYPES.has(c.transaction_type ?? '')
            ? -Math.abs(amt)
            : Math.abs(amt),
          title: c.transaction_category ?? c.card_type ?? 'Card Transaction',
          subtitle: c.description ?? c.reference ?? undefined,
          service: getServiceType(c.card_type),
          iconType: 'card',
        };
      });

    return [...mappedWallet, ...mappedCards].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [data, metroCardsResp, insuranceCardsResp, wallet]);

  const preview = transactions.slice(0, 3);

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
            onOpenChange={(v) => {
              setOpen(v);
              if (v) refetch();
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
                {isLoading && (
                  <div className="text-sm text-gray-500">Loading...</div>
                )}
                {!isLoading && transactions.length === 0 && (
                  <div className="text-sm text-gray-500">
                    No transactions found
                  </div>
                )}
                {transactions.map((tx) => (
                  <TransactionRow key={tx.id} tx={tx} />
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {isLoading && <div className="text-sm text-gray-500">Loading...</div>}
          {preview.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
