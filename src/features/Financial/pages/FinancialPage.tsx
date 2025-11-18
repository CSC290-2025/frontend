import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  useGetWalletsUserUserId,
  usePostWallets,
  usePutWalletsWalletId,
  usePostWalletsWalletIdTopUp,
  usePostWalletsTransfer,
} from '@/api/generated/wallets';
import { usePostScbQrCreate } from '@/api/generated/scb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function FinancialPage() {
  const [userId, setUserId] = useState('1');
  const [walletType, setWalletType] = useState<'individual' | 'organization'>(
    'individual'
  );
  const [orgType, setOrgType] = useState('');
  const [editingOrgType, setEditingOrgType] = useState(false);
  const [newOrgType, setNewOrgType] = useState('');
  const [qrRawData, setQrRawData] = useState('');
  const [topUpAmount, setTopUpAmount] = useState('');
  const [transferToUserId, setTransferToUserId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  const { data: wallets, refetch } = useGetWalletsUserUserId(Number(userId));
  const { data: recipientWalletResponse } = useGetWalletsUserUserId(
    transferToUserId ? Number(transferToUserId) : undefined
  );
  const recipientWallet = recipientWalletResponse?.data?.data?.wallet;
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
  const { mutateAsync: topUpWallet } = usePostWalletsWalletIdTopUp({
    mutation: {
      onSuccess: () => refetch(),
    },
  });
  const { mutateAsync: generateQR } = usePostScbQrCreate();
  const { mutateAsync: transferFunds } = usePostWalletsTransfer({
    mutation: {
      onSuccess: () => refetch(),
    },
  });

  const wallet = wallets?.data?.data?.wallet;
  const isOrg = wallet?.wallet_type === 'organization';

  return (
    <div className="space-y-4 p-4">
      <h1 className="mb-4">Financial Wallet</h1>

      <div>
        <Label>User ID: </Label>
        <Input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="inline-block w-auto"
        />
        <Button onClick={() => refetch()} className="ml-2" variant="secondary">
          Load
        </Button>
        <p className="mt-2 text-sm text-gray-600">
          Switch to Different User Id to manage their state. In production,
          wallets are created automatically. Here you must create manually. User
          ID must exist in database.
        </p>
      </div>

      {!wallet && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div>
              <Label>Wallet Type</Label>
              <Select
                value={walletType}
                onValueChange={(v) =>
                  setWalletType(v as 'individual' | 'organization')
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="organization">Organization</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {walletType === 'organization' && (
              <div>
                <Label>Organization Type</Label>
                <Input
                  placeholder="e.g., Business, NGO"
                  value={orgType}
                  onChange={(e) => setOrgType(e.target.value)}
                />
              </div>
            )}

            <Button
              onClick={() =>
                createWallet({
                  data: {
                    user_id: Number(userId),
                    wallet_type: walletType,
                    organization_type:
                      walletType === 'organization' ? orgType : undefined,
                  },
                })
              }
              className="mt-4"
            >
              Create Wallet
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Wallet Info */}
      {wallet && (
        <>
          <Card>
            <CardContent className="p-4">
              <div className="mb-2">
                <span className="font-semibold">Balance: </span>$
                {wallet.balance}
                <Button
                  onClick={() => refetch()}
                  className="ml-2"
                  variant="secondary"
                  size="sm"
                >
                  Refresh
                </Button>
              </div>

              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className="font-semibold">Type:</span>{' '}
                  {wallet.wallet_type}
                  {isOrg &&
                    wallet.organization_type &&
                    ` (${wallet.organization_type})`}
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
                    variant="secondary"
                    size="sm"
                  >
                    Switch Type
                  </Button>
                </li>

                {isOrg && (
                  <li className="flex items-center gap-2">
                    <span className="font-semibold">Org:</span>
                    {editingOrgType ? (
                      <>
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
                      </>
                    ) : (
                      <>
                        {wallet.organization_type || 'Not set'}
                        <Button
                          onClick={() => {
                            setEditingOrgType(true);
                            setNewOrgType(wallet.organization_type || '');
                          }}
                          size="sm"
                        >
                          Edit
                        </Button>
                      </>
                    )}
                  </li>
                )}

                <li className="flex items-center gap-2">
                  <span className="font-semibold">Status:</span> {wallet.status}
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
                </li>
                <li>
                  <span className="font-semibold">Updated:</span>{' '}
                  {new Date(wallet.updated_at).toLocaleString()}
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="mb-2 font-semibold">Top Up</div>
              <p className="mb-4 text-sm text-gray-600">
                More payment methods coming soon.
              </p>

              {qrRawData ? (
                <div className="space-y-4">
                  <div className="inline-block border p-4">
                    <QRCodeSVG value={qrRawData || 'test'} size={200} />
                  </div>
                  <div>Amount: ${topUpAmount}</div>
                  <p className="text-sm text-gray-600">
                    This is a real QR code for payment. However, payment
                    confirmation is not implemented yet, so you can only
                    simulate the payment.
                  </p>
                  <Button
                    onClick={async () => {
                      await topUpWallet({
                        data: { amount: Number(topUpAmount) },
                        walletId: wallet.id,
                      });
                      setQrRawData('');
                      setTopUpAmount('');
                    }}
                  >
                    Simulate Payment
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                  />
                  <Button
                    onClick={async () => {
                      const response = await generateQR({
                        data: { amount: topUpAmount, user_id: Number(userId) },
                      });
                      console.log('QR Response:', response);
                      const qrData = (
                        response.data.data as unknown as {
                          qrResponse: { qrRawData: string };
                        }
                      ).qrResponse.qrRawData;
                      console.log('QR Data:', qrData);
                      setQrRawData(qrData);
                    }}
                  >
                    Generate QR
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="mb-2 font-semibold">Transfer</div>
              <p className="mb-4 text-sm text-gray-600">
                Send money to another user.
              </p>

              <div className="space-y-4">
                <div>
                  <Label>Recipient User ID</Label>
                  <Input
                    type="number"
                    placeholder="User ID to transfer to"
                    value={transferToUserId}
                    onChange={(e) => setTransferToUserId(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    placeholder="Amount to transfer"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                  />
                  <Button
                    onClick={async () => {
                      const validations = [
                        [
                          userId === transferToUserId,
                          'Cannot transfer to yourself',
                        ],
                        [
                          wallet.balance! < Number(transferAmount),
                          'Insufficient funds',
                        ],
                        [
                          wallet.status !== 'active',
                          'Your wallet must be active',
                        ],
                        [!transferToUserId, 'Please enter a recipient user ID'],
                        [!recipientWallet, 'Recipient wallet not found'],
                        [
                          recipientWallet!.status !== 'active',
                          'Recipient wallet must be active',
                        ],
                      ];

                      for (const [condition, errorMessage] of validations) {
                        if (condition) {
                          alert(errorMessage);
                          return;
                        }
                      }

                      await transferFunds({
                        data: {
                          from_user_id: Number(userId),
                          to_user_id: Number(transferToUserId),
                          amount: Number(transferAmount),
                        },
                      });

                      setTransferToUserId('');
                      setTransferAmount('');
                    }}
                    disabled={!transferToUserId || !transferAmount}
                  >
                    Transfer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
