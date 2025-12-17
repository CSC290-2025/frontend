import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  useGetWalletsUserUserId,
  usePutWalletsWalletId,
} from '@/api/generated/wallets';
import { useGetUserWalletId } from '@/api/generated/user';
import { useDebounce } from '@/features/Financial/hooks/useDebounce';
import { Loader2, RefreshCw } from 'lucide-react';

export default function WalletManagement() {
  const [userId, setUserId] = useState('');
  const debouncedUserId = useDebounce(userId, 500);

  const {
    data: walletData,
    refetch: refetchWallet,
    isFetching: isFetchingWallet,
  } = useGetWalletsUserUserId(Number(debouncedUserId), {
    query: { enabled: !!debouncedUserId },
  });

  const { data: userData, isFetching: isFetchingUser } = useGetUserWalletId(
    Number(debouncedUserId),
    {
      query: { enabled: !!debouncedUserId },
    }
  );

  const { mutate: updateWallet } = usePutWalletsWalletId({
    mutation: {
      onSuccess: () => {
        toast.success('Wallet updated successfully!');
        refetchWallet();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update wallet');
      },
    },
  });

  const wallet = walletData?.data?.wallet;
  const username = (userData?.data as any)?.user?.username;

  const isFetching = isFetchingWallet || isFetchingUser;

  const [editingOrgType, setEditingOrgType] = useState(false);
  const [newOrgType, setNewOrgType] = useState('');

  const isOrg = wallet?.wallet_type === 'organization';

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Admin Wallet Management
        </h3>
        <div className="mb-4 space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            User ID
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID"
            />
            <Button
              onClick={() => refetchWallet()}
              size="sm"
              disabled={isFetching || !debouncedUserId}
            >
              {isFetching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        {wallet && (
          <>
            <div className="mb-4 space-y-2 border-t pt-4">
              {username && (
                <div className="text-sm">
                  <span className="font-semibold">Owner:</span> {username}
                </div>
              )}
              <div className="text-sm">
                <span className="font-semibold">Balance:</span> $
                {wallet.balance ?? 0}
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div>
                  <div className="text-sm font-medium text-gray-700">
                    Wallet Type
                  </div>
                  <div className="text-sm text-gray-600">
                    {wallet.wallet_type}
                  </div>
                </div>
                <Button
                  onClick={() =>
                    updateWallet({
                      data: isOrg
                        ? { wallet_type: 'individual' }
                        : {
                            wallet_type: 'organization',
                            organization_type: 'Business',
                          },
                      walletId: wallet.id,
                    })
                  }
                  variant="outline"
                  size="sm"
                >
                  Switch Type
                </Button>
              </div>

              {isOrg && (
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <div className="flex-1">
                    <span className="mb-1 block font-semibold">
                      Organization Type:
                    </span>
                    {editingOrgType ? (
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          value={newOrgType}
                          onChange={(e) => setNewOrgType(e.target.value)}
                          className="max-w-xs"
                        />
                        <Button
                          onClick={async () => {
                            await updateWallet({
                              data: { organization_type: newOrgType },
                              walletId: wallet.id,
                            });
                            setEditingOrgType(false);
                          }}
                          size="sm"
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => setEditingOrgType(false)}
                          variant="outline"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <span>{wallet.organization_type || 'Not set'}</span>
                    )}
                  </div>
                  {!editingOrgType && (
                    <Button
                      onClick={() => {
                        setEditingOrgType(true);
                        setNewOrgType(wallet.organization_type || '');
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Edit
                    </Button>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold">Status:</span> {wallet.status}
                </div>
                <Button
                  onClick={() =>
                    updateWallet({
                      data: {
                        status:
                          wallet.status === 'active' ? 'suspended' : 'active',
                      },
                      walletId: wallet.id,
                    })
                  }
                  variant="secondary"
                  size="sm"
                >
                  {wallet.status === 'active' ? 'Suspend' : 'Activate'}
                </Button>
              </div>
              <div>
                <span className="font-semibold">Updated:</span>{' '}
                {new Date(wallet.updated_at).toLocaleString()}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
