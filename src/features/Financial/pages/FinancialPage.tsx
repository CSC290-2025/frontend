import { useGetWalletsUserUserId } from '@/api/generated/wallets';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet } from 'lucide-react';
import AmountBox from '../components/metro-cards/AmountBox';
import ServiceNavigator from '../components/mainPage/ServiceNavigator';
import TransactionHistory from '../components/mainPage/TransactionHistory';
import TopUpModal from '../components/mainPage/TopUpModal';
import TransferModal from '../components/mainPage/TransferModal';
import WalletManagement from '../components/mainPage/WalletManagement';
import { useGetAuthMe } from '@/api/generated/authentication';
import { useAuth } from '@/features/auth';
import { ROLES } from '@/constant';

export default function FinancialPage() {
  const userId = useGetAuthMe().data?.data?.userId.toString() ?? '';

  const { data: wallets, refetch } = useGetWalletsUserUserId(Number(userId));

  const wallet = wallets?.data?.wallet;

  // Check if the user is admin
  const { user } = useAuth();
  const isAdmin = user?.roles?.role_name === ROLES.ADMIN;

  const loadedUserId = Number(userId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Digital Wallet</h1>
          <p className="mt-1 text-gray-600">
            Manage your wallet and financial transactions.{' '}
            {` {Demo: Your User ID: ${userId}}`}
          </p>
        </div>

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
                <ServiceNavigator />
                <TransactionHistory userId={loadedUserId} wallet={wallet} />
              </div>
            </div>
            {isAdmin && (
              <div className="pt-15">
                <WalletManagement />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
