import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  usePostWalletsTransfer,
  useGetWalletsUserUserId,
  getGetWalletsUserUserIdQueryKey,
} from '@/api/generated/wallets';
import { getGetTransactionsQueryKey } from '@/api/generated/transactions';
import { Button } from '@/components/ui/button';
import type { GetWalletsUserUserId200DataWallet } from '@/api/generated/model';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Heart, Wallet, Sparkles, Send } from 'lucide-react';

interface TransferModalProps {
  wallet: GetWalletsUserUserId200DataWallet | undefined;
  userId: string;
  transferToUserId: string;
  onSuccess: () => void;
}

export function DonateModal({
  wallet,
  userId,
  transferToUserId,
  onSuccess,
}: TransferModalProps) {
  const [open, setOpen] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');

  const { data: recipientWalletResponse } = useGetWalletsUserUserId(
    transferToUserId ? Number(transferToUserId) : undefined
  );
  const recipientWallet = recipientWalletResponse?.data?.wallet;

  const queryClient = useQueryClient();

  const { mutate: transferFunds, isPending } = usePostWalletsTransfer({
    mutation: {
      onSuccess: (data) => {
        toast.success('Donation successful! Thank you for your support.', {
          icon: <Heart className="h-4 w-4 fill-red-500 text-red-500" />,
        });

        // Invalidate queries
        queryClient.invalidateQueries({
          queryKey: getGetTransactionsQueryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: getGetWalletsUserUserIdQueryKey(Number(userId)),
        });
        if (transferToUserId) {
          queryClient.invalidateQueries({
            queryKey: getGetWalletsUserUserIdQueryKey(Number(transferToUserId)),
          });
        }

        onSuccess();
        resetState();
        setOpen(false);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Transfer failed');
      },
    },
  });

  const handleTransfer = () => {
    const validations: [boolean, string][] = [
      [
        Number(userId) === Number(transferToUserId),
        'Cannot donate to yourself',
      ],
      [(wallet?.balance ?? 0) < Number(transferAmount), 'Insufficient funds'],
      [wallet?.status !== 'active', 'Your wallet must be active'],
      [!transferToUserId, 'Recipient not found'],
      [!recipientWallet, 'Recipient wallet not found'],
      [
        recipientWallet?.status !== 'active',
        'Recipient wallet cannot receive funds',
      ],
      [Number(transferAmount) <= 0, 'Please enter a valid amount'],
    ];

    for (const [condition, errorMessage] of validations) {
      if (condition) {
        toast.error(errorMessage);
        return;
      }
    }

    transferFunds({
      data: {
        from_user_id: Number(userId),
        to_user_id: Number(transferToUserId),
        amount: Number(transferAmount),
        isVol: true,
      },
    });
  };

  const resetState = () => {
    setTransferAmount('');
  };

  const presetAmounts = [100, 500, 1000];

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetState();
      }}
    >
      <DialogTrigger asChild>
        <Button className="w-full gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-6 text-lg font-bold shadow-lg shadow-emerald-200 transition-all hover:scale-[1.02] hover:shadow-xl active:scale-95">
          <Heart className="h-5 w-5 animate-pulse fill-white" />
          Donate Funds
        </Button>
      </DialogTrigger>

      <DialogContent className="overflow-hidden rounded-3xl border-0 p-0 shadow-2xl sm:max-w-md">
        {/* --- Header --- */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 px-6 pt-8 pb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 ring-8 ring-emerald-50">
            <Sparkles className="h-8 w-8 text-emerald-600" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-emerald-950">
              Make an Impact
            </DialogTitle>
          </DialogHeader>
          <p className="mt-2 text-sm text-emerald-700/80">
            Your contribution helps fund this initiative directly.
          </p>
        </div>

        {/* --- Body --- */}
        <div className="space-y-6 p-6">
          {/* Balance Badge */}
          <div className="flex justify-center">
            <div className="flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
              <Wallet className="h-3 w-3" />
              <span>
                Available Balance: {wallet?.balance?.toLocaleString() ?? 0}
              </span>
            </div>
          </div>

          {/* Big Input Area */}
          <div className="relative flex flex-col items-center justify-center">
            <div className="relative">
              <span className="absolute top-1/2 -left-6 -translate-y-1/2 text-3xl font-light text-slate-300">
                $
              </span>
              <Input
                type="number"
                placeholder="0"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                className="h-auto [appearance:textfield] border-none bg-transparent p-0 text-center text-5xl font-bold text-slate-800 placeholder:text-slate-200 focus-visible:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex justify-center gap-3">
            {presetAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => setTransferAmount(amount.toString())}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700"
              >
                {amount}
              </button>
            ))}
          </div>

          {/* Action Button */}
          <Button
            onClick={handleTransfer}
            disabled={!transferToUserId || !transferAmount || isPending}
            className="w-full rounded-xl bg-emerald-600 py-6 text-base font-bold text-white hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Send Donation <Send className="h-4 w-4" />
              </span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
