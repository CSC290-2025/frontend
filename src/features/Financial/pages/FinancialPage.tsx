import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  useUserWallet,
  useCreateWallet,
  useUpdateWallet,
  useTopUpWallet,
  useGenerateQR,
  useTransferFunds,
} from '@/features/Financial/hooks/useUserWallets';
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

  const { data: wallets, refetch } = useUserWallet(Number(userId));
  const { data: recipientWallet } = useUserWallet(
    transferToUserId ? Number(transferToUserId) : NaN
  );
  const { mutateAsync: createWallet } = useCreateWallet();
  const { mutateAsync: updateWallet } = useUpdateWallet();
  const { mutateAsync: topUpWallet } = useTopUpWallet();
  const { mutateAsync: generateQR } = useGenerateQR();
  const { mutateAsync: transferFunds } = useTransferFunds();

  const wallet = wallets;
  const isOrg = wallet?.wallet_type === 'organization';

  return (
    <div className="p-4">
      <h1 className="mb-4">Financial Wallet</h1>

      <div className="mb-4">
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
        <Card className="mb-4">
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
                  user_id: Number(userId),
                  wallet_type: walletType,
                  organization_type:
                    walletType === 'organization' ? orgType : undefined,
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
          <Card className="mb-4">
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
                        walletId: wallet.id,
                        data: isOrg
                          ? { wallet_type: 'individual' }
                          : {
                              wallet_type: 'organization',
                              organization_type: 'Business',
                            },
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
                              walletId: wallet.id,
                              data: { organization_type: newOrgType },
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
                        walletId: wallet.id,
                        data: {
                          status:
                            wallet.status === 'active' ? 'suspended' : 'active',
                        },
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
                    <QRCodeSVG value={qrRawData} size={200} />
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
                        walletId: wallet.id,
                        amount: Number(topUpAmount),
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
                    onClick={async () =>
                      setQrRawData(await generateQR(topUpAmount))
                    }
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
                          wallet?.balance < Number(transferAmount),
                          'Insufficient funds',
                        ],
                        [
                          wallet?.status !== 'active',
                          'Your wallet must be active',
                        ],
                        [!transferToUserId, 'Please enter a recipient user ID'],
                        [!recipientWallet, 'Recipient wallet not found'],
                        [
                          recipientWallet?.status !== 'active',
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
                        fromUserId: Number(userId),
                        toUserId: Number(transferToUserId),
                        amount: Number(transferAmount),
                      });

                      setTransferToUserId('');
                      setTransferAmount('');
                      refetch();
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
