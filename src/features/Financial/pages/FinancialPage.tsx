import { useState } from 'react';
import {
  useGetWalletsUserUserId,
  usePostWallets,
  usePutWalletsWalletId,
} from '@/api/generated/wallets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Wallet } from 'lucide-react';
import AmountBox from '../components/metro-cards/AmountBox';
import ServiceNavigator from '../components/mainPage/ServiceNavigator';
import TransactionHistory from '../components/mainPage/TransactionHistory';
import TopUpModal from '../components/mainPage/TopUpModal';
import TransferModal from '../components/mainPage/TransferModal';
import WalletManagement from '../components/mainPage/WalletManagement';

export default function FinancialPage() {
  const [userId, setUserId] = useState('1');
  const [loadedUserId, setLoadedUserId] = useState<number | null>(null);

  const { data: wallets, refetch } = useGetWalletsUserUserId(Number(userId));
  const { mutateAsync: createWallet } = usePostWallets({
    mutation: {
      onSuccess: () => refetch(),
    },
  });
  const { mutateAsync: updateWallet } = usePutWalletsWalletId({
    mutation: {
      onSuccess: () => refetch(),
    },
  });

  const wallet = wallets?.data?.data?.wallet;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Digital Wallet</h1>
          <p className="mt-1 text-gray-600">
            Manage your wallet and financial transactions
          </p>
        </div>
        {/* User Selection */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  User ID
                </Label>
                <div className="mt-1 flex gap-2">
                  <Input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="w-32"
                    placeholder="Enter user ID"
                  />
                  <Button
                    onClick={() => {
                      setLoadedUserId(Number(userId));
                      refetch();
                    }}
                    variant="secondary"
                  >
                    Load Wallet
                  </Button>
                </div>
              </div>
            </div>

            {/* Create Wallet Button (Retained from HEAD logic) */}
            {!wallet && (
              <Button
                onClick={() =>
                  createWallet({
                    data: {
                      user_id: Number(userId),
                      wallet_type: 'individual', // Default to individual
                    },
                  })
                }
                className="mt-4"
              >
                Create Wallet
              </Button>
            )}
          </CardContent>
        </Card>

        {!wallet && (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-center">
                <Wallet className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-center text-lg font-semibold text-gray-900">
                No Wallet Found
              </h3>
              <p className="text-center text-sm text-gray-600">
                No wallet exists for user ID {userId}. Please check if the user
                ID is correct or create a new one.
              </p>
            </CardContent>
          </Card>
        )}
        {/* Wallet Info */}
        {wallet && (
          <>
            <div className="mb-6 grid grid-cols-1 gap-10 md:gap-6 lg:grid-cols-2">
              <div className="h-100">
                <AmountBox
                  balance={wallet.balance ?? 0}
                  onRefetch={refetch}
                  isLoading={false}
                />

                {/* Action Buttons */}
                <div className="mt-6 flex gap-4">
                  <TransferModal
                    wallet={wallet}
                    userId={userId}
                    onSuccess={refetch}
                  />
                  <TopUpModal
                    wallet={wallet}
                    userId={userId}
                    onSuccess={refetch}
                  />
                </div>
              </div>

              {/* Right Column: Services and History */}
              <div className="space-y-6">
                <ServiceNavigator userId={loadedUserId?.toString() ?? '1'} />
                <TransactionHistory />
              </div>
            </div>

            {wallet && (
              <WalletManagement wallet={wallet} updateWallet={updateWallet} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
