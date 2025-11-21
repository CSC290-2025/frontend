import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetWalletsUserUserId,
  usePostWallets,
  usePutWalletsWalletId,
  getGetWalletsUserUserIdQueryKey,
} from '@/api/generated/wallets';
import { getGetTransactionsQueryKey } from '@/api/generated/transactions';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet } from 'lucide-react';
import AmountBox from '../components/metro-cards/AmountBox';
import ServiceNavigator from '../components/mainPage/ServiceNavigator';
import TransactionHistory from '../components/mainPage/TransactionHistory';
import TopUpModal from '../components/mainPage/TopUpModal';
import TransferModal from '../components/mainPage/TransferModal';
import WalletManagement from '../components/mainPage/WalletManagement';
import WalletLoader from '../components/mainPage/WalletLoader';

export default function FinancialPage() {
  const [userId, setUserId] = useState('1');
  const [loadedUserId, setLoadedUserId] = useState<number | null>(null);

  const { data: wallets, refetch } = useGetWalletsUserUserId(Number(userId));
  const queryClient = useQueryClient();
  const { mutateAsync: createWallet } = usePostWallets({
    mutation: {
      onSuccess: () => {
        refetch();
        queryClient.invalidateQueries({
          queryKey: getGetTransactionsQueryKey(),
        });
      },
    },
  });
  const { mutateAsync: updateWallet } = usePutWalletsWalletId({
    mutation: {
      onSuccess: () => {
        refetch();
        queryClient.invalidateQueries({
          queryKey: getGetTransactionsQueryKey(),
        });
      },
    },
  });

  const wallet = wallets?.data?.data?.wallet;

  const handleLoadWallet = () => {
    setLoadedUserId(Number(userId));
    refetch();
  };

  const handleCreateWallet = () => {
    createWallet({
      data: {
        user_id: Number(userId),
        wallet_type: 'individual',
      },
    });
  };

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
        <WalletLoader
          userId={userId}
          hasWallet={!!wallet}
          onUserIdChange={setUserId}
          onLoadWallet={handleLoadWallet}
          onCreateWallet={handleCreateWallet}
        />

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
                  <TopUpModal />
                </div>
              </div>

              {/* Right Column: Services and History */}
              <div className="space-y-6">
                <ServiceNavigator userId={loadedUserId?.toString() ?? '1'} />
                <TransactionHistory userId={loadedUserId} wallet={wallet} />
              </div>
            </div>
            <WalletManagement wallet={wallet} updateWallet={updateWallet} />
          </>
        )}
      </div>
    </div>
  );
}
