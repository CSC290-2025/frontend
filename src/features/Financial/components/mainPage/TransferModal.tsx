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
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ArrowLeftRight } from 'lucide-react';

interface TransferModalProps {
  wallet: GetWalletsUserUserId200DataWallet | undefined;
  userId: string;
  onSuccess: () => void;
}

export default function TransferModal({
  wallet,
  userId,
  onSuccess,
}: TransferModalProps) {
  const [open, setOpen] = useState(false);
  const [transferToUserId, setTransferToUserId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  const { data: recipientWalletResponse } = useGetWalletsUserUserId(
    transferToUserId ? Number(transferToUserId) : undefined
  );
  const recipientWallet = recipientWalletResponse?.data?.wallet;

  const queryClient = useQueryClient();

  const { mutate: transferFunds, isPending } = usePostWalletsTransfer({
    mutation: {
      onSuccess: (data) => {
        toast.success(data.message || 'Transfer successful!');
        // Invalidate transactions + both wallets' queries for immediate refresh
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
        'Cannot transfer to yourself',
      ],
      [(wallet?.balance ?? 0) < Number(transferAmount), 'Insufficient funds'],
      [wallet?.status !== 'active', 'Your wallet must be active'],
      [!transferToUserId, 'Please enter a recipient user ID'],
      [!recipientWallet, 'Recipient wallet not found'],
      [recipientWallet?.status !== 'active', 'Recipient wallet must be active'],
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
      },
    });
  };

  const resetState = () => {
    setTransferToUserId('');
    setTransferAmount('');
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetState();
      }}
    >
      <DialogTrigger asChild>
        <Button
          className="flex-1 gap-2 bg-green-500 hover:bg-green-600"
          size="lg"
        >
          <ArrowLeftRight className="h-5 w-5" />
          Transfer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-purple-600" />
            Transfer Funds
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-gray-600">
          Send money to another user&apos;s wallet
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Recipient User ID</Label>
            <Input
              type="number"
              placeholder="Enter user ID"
              value={transferToUserId}
              onChange={(e) => setTransferToUserId(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Amount</Label>
            <Input
              type="number"
              placeholder="Enter amount to transfer"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
            />
          </div>

          <Button
            onClick={handleTransfer}
            disabled={!transferToUserId || !transferAmount || isPending}
            className="w-full"
          >
            {isPending ? 'Transferring...' : 'Transfer'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
