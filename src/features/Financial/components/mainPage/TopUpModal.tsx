import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { usePostWalletsWalletIdTopUp } from '@/api/generated/wallets';
import { usePostScbQrCreate } from '@/api/generated/scb';
import { Button } from '@/components/ui/button';
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
import { QrCode, Wallet } from 'lucide-react';

interface TopUpModalProps {
  wallet: any; // Using any for now to match existing loose typing, ideally should be typed
  userId: string;
  onSuccess: () => void;
}

export default function TopUpModal({
  wallet,
  userId,
  onSuccess,
}: TopUpModalProps) {
  const [open, setOpen] = useState(false);
  const [qrRawData, setQrRawData] = useState('');
  const [topUpAmount, setTopUpAmount] = useState('');

  const { mutateAsync: topUpWallet } = usePostWalletsWalletIdTopUp({
    mutation: {
      onSuccess: () => {
        onSuccess();
      },
    },
  });
  const { mutateAsync: generateQR } = usePostScbQrCreate();

  const handleTopUp = async () => {
    if (!topUpAmount || Number(topUpAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    try {
      await topUpWallet({
        walletId: wallet.id,
        data: { amount: Number(topUpAmount) },
      });
      resetState();
      toast.success('Top-up successful!');
      setOpen(false);
    } catch (_error) {
      toast.error('Top-up failed');
    }
  };

  const handleGenerateQR = async () => {
    if (!topUpAmount || Number(topUpAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    try {
      const response = await generateQR({
        data: {
          amount: topUpAmount,
          user_id: Number(userId),
        },
      });
      const qrData = (
        response.data.data as unknown as {
          qrResponse: { qrRawData: string };
        }
      ).qrResponse.qrRawData;
      setQrRawData(qrData);
    } catch (error) {
      toast.error('Failed to generate QR code');
    }
  };

  const resetState = () => {
    setQrRawData('');
    setTopUpAmount('');
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
          className="flex-1 gap-2 bg-cyan-400 hover:bg-cyan-500"
          size="lg"
        >
          <Wallet className="h-5 w-5" />
          Top-up & Pay
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-blue-600" />
            Top Up Wallet
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-gray-600">
          Add funds to your wallet using QR code payment
        </p>

        {qrRawData ? (
          <div className="space-y-4">
            <div className="flex justify-center rounded-lg border-2 border-dashed border-gray-300 p-4">
              <QRCodeSVG value={qrRawData} size={200} />
            </div>
            <div className="rounded-lg bg-blue-50 p-4">
              <div className="text-sm text-gray-600">Amount</div>
              <div className="text-2xl font-bold text-gray-900">
                ${topUpAmount}
              </div>
            </div>
            <p className="text-sm text-gray-600">
              This is a real QR code for payment. However, payment confirmation
              is not implemented yet, so you can only simulate the payment.
            </p>
            <Button onClick={handleTopUp} className="w-full">
              Simulate Payment
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
              />
            </div>
            <Button
              onClick={handleGenerateQR}
              disabled={!topUpAmount}
              className="w-full"
            >
              Generate QR Code
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
