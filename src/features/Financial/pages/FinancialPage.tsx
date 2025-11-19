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
import { Label } from '@/components/ui/label';
import { Wallet, ArrowLeftRight, QrCode } from 'lucide-react';
import AmountBox from '../components/metro-cards/AmountBox';
import ServiceNavigator from '../components/mainPage/ServiceNavigator';
import TransactionHistory from '../components/mainPage/TransactionHistory';
import { toast } from 'sonner';

export default function FinancialPage() {
  const [userId, setUserId] = useState('1');
  const [loadedUserId, setLoadedUserId] = useState<number | null>(null);
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

  const handleTopUp = async () => {
    if (!topUpAmount || Number(topUpAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    try {
      await topUpWallet({
        walletId: wallet!.id,
        data: { amount: Number(topUpAmount) },
      });
      setQrRawData('');
      setTopUpAmount('');
      toast.success('Top-up successful!');
      refetch();
    } catch (_error) {
      toast.error('Top-up failed');
    }
  };

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
          from_user_id: Number(loadedUserId || userId),
          to_user_id: Number(transferToUserId),
          amount: Number(transferAmount),
        },
      });
      setTransferToUserId('');
      setTransferAmount('');
      toast.success('Transfer successful!');
      refetch();
    } catch (_error) {
      toast.error('Transfer failed');
    }
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
              </div>

              {/* Right Column: Services and History */}
              <div className="space-y-6">
                <ServiceNavigator userId={loadedUserId?.toString() ?? '1'} />
                <TransactionHistory />
              </div>
            </div>

            {/* Transfer Card */}
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <ArrowLeftRight className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Transfer Funds
                  </h3>
                </div>
                <p className="mb-4 text-sm text-gray-600">
                  Send money to another user&apos;s wallet
                </p>

                <div className="space-y-4">
                  <div>
                    <Label>Recipient User ID</Label>
                    <Input
                      type="number"
                      placeholder="Enter user ID"
                      value={transferToUserId}
                      onChange={(e) => setTransferToUserId(e.target.value)}
                    />
                  </div>

                  <div>
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
              </CardContent>
            </Card>

            {/* Wallet Management */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Wallet Management
                </h3>
                <div className="space-y-4">
                  {/* Organization Type Management (HEAD logic/UI) */}
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
                      <span className="font-semibold">Status:</span>{' '}
                      {wallet.status}
                    </div>
                    <Button
                      onClick={() =>
                        updateWallet({
                          data: {
                            status:
                              wallet.status === 'active'
                                ? 'suspended'
                                : 'active',
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

            {/* Top Up Card */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Top Up Wallet
                  </h3>
                </div>
                <p className="mb-4 text-sm text-gray-600">
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
                      This is a real QR code for payment. However, payment
                      confirmation is not implemented yet, so you can only
                      simulate the payment.
                    </p>
                    <div className="flex gap-2">
                      <Button onClick={handleTopUp} className="flex-1">
                        Simulate Payment
                      </Button>
                      <Button
                        onClick={() => {
                          setQrRawData('');
                          setTopUpAmount('');
                        }}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={topUpAmount}
                        onChange={(e) => setTopUpAmount(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={async () => {
                        if (!topUpAmount || Number(topUpAmount) <= 0) {
                          toast.error('Please enter a valid amount');
                          return;
                        }
                        // HEAD Logic: parsing the OpenAPI response structure
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
                      }}
                      disabled={!topUpAmount}
                      className="w-full"
                    >
                      Generate QR Code
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
