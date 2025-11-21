import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import type {
  PutWalletsWalletIdBodyStatus,
  PutWalletsWalletIdBodyWalletType,
} from '@/api/generated/model';

interface WalletManagementProps {
  wallet: {
    id: number;
    wallet_type: string;
    organization_type?: string | null;
    status: string;
    updated_at: string;
  };
  updateWallet: (params: {
    data: {
      wallet_type?: PutWalletsWalletIdBodyWalletType;
      organization_type?: string;
      status?: PutWalletsWalletIdBodyStatus;
    };
    walletId?: number | null;
  }) => Promise<unknown>;
}

export default function WalletManagement({
  wallet,
  updateWallet,
}: WalletManagementProps) {
  const [editingOrgType, setEditingOrgType] = useState(false);
  const [newOrgType, setNewOrgType] = useState('');

  const isOrg = wallet?.wallet_type === 'organization';

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Wallet Management
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div>
              <div className="text-sm font-medium text-gray-700">
                Wallet Type
              </div>
              <div className="text-sm text-gray-600">{wallet.wallet_type}</div>
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
                    status: wallet.status === 'active' ? 'suspended' : 'active',
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
      </CardContent>
    </Card>
  );
}
