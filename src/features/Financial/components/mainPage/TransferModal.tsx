import { useState } from 'react';
import {
  usePostWalletsTransfer,
  useGetWalletsUserUserId,
} from '@/api/generated/wallets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ArrowLeftRight } from 'lucide-react';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: any;
  userId: string;
  onSuccess: () => void;
}

export default function TransferModal({
  isOpen,
  onClose,
  wallet,
  userId,
  onSuccess,
}: TransferModalProps) {
  const [transferToUserId, setTransferToUserId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  const { data: recipientWalletResponse } = useGetWalletsUserUserId(
    transferToUserId ? Number(transferToUserId) : undefined
  );
  const recipientWallet = recipientWalletResponse?.data?.data?.wallet;

  const { mutateAsync: transferFunds } = usePostWalletsTransfer({
    mutation: {
      onSuccess: () => {
        onSuccess();
      },
    },
  });

  const handleTransfer = async () => {
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

    try {
      await transferFunds({
        data: {
          from_user_id: Number(userId),
          to_user_id: Number(transferToUserId),
          amount: Number(transferAmount),
        },
      });
      setTransferToUserId('');
      setTransferAmount('');
      toast.success('Transfer successful!');
      onClose();
    } catch (_error) {
      toast.error('Transfer failed');
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setTransferToUserId('');
          setTransferAmount('');
        }
        onClose();
      }}
    >
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
            disabled={!transferToUserId || !transferAmount}
            className="w-full"
          >
            Transfer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
