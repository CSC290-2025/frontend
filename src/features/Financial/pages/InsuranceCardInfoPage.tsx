// Page for viewing and topping up insurance card
import {
  useInsuranceCard,
  useTopUpInsuranceCard,
  useUserWallet,
} from '@/features/Financial/hooks';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate, useParams } from '@/router';
import { ArrowLeft, CreditCard, Eye, EyeOff, Wallet } from 'lucide-react';
import { useState } from 'react';
import Loading from '@/features/Financial/components/metro-cards/Loading';
import InsuranceCard from '@/features/Financial/components/insurance-cards/InsuranceCard';
import ReuseableButton from '@/features/Financial/components/metro-cards/ReuseableButton';
import { toast } from 'sonner';

export default function InsuranceCardInfoPage() {
  const navigate = useNavigate();

  const [isEyeOff, setIsEyeOff] = useState<boolean>(true);
  const [topUpAmount, setTopUpAmount] = useState<string>('');

  const { id, user_id } = useParams('/financial/insurance/:user_id/info/:id');

  // Fetch user's wallet
  const {
    data: wallet,
    isLoading: isWalletLoading,
    refetch: refetchWallet,
  } = useUserWallet(Number(user_id));

  const {
    data: insuranceCard,
    isLoading,
    refetch,
  } = useInsuranceCard(Number(id));

  const { mutate: topUp, isPending: isTopUpPending } = useTopUpInsuranceCard();

  const handleTopUp = () => {
    if (!topUpAmount) {
      toast.error('Please enter amount');
      return;
    }
    if (!wallet) {
      toast.error('No wallet found for this user');
      return;
    }
    const amount = Number(topUpAmount);
    if (amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }
    if (amount > (wallet.balance || 0)) {
      toast.error('Insufficient wallet balance');
      return;
    }
    topUp(
      {
        cardId: Number(id),
        data: {
          amount,
          wallet_id: wallet.id,
        },
      },
      {
        onSuccess: () => {
          toast.success('Top up successful');
          setTopUpAmount('');
          refetch();
          refetchWallet();
        },
        onError: (error) => {
          const err = (error as Error).message || 'Top up failed';
          toast.error(err);
        },
      }
    );
  };

  if (isLoading || isWalletLoading) return <Loading />;

  if (!insuranceCard)
    return <div className="p-6 text-center">Insurance card not found</div>;

  const hideCardNumber = (cardNumber: string): string => {
    const cleanNumber = cardNumber.replace(/\s+/g, '');
    const visibleDigits = cleanNumber.slice(-4);
    const hiddenGroups = '•••• •••• ••••';
    return `${hiddenGroups} ${visibleDigits}`;
  };

  const formatCardNumber = (cardNumber: string) => {
    return cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const number = insuranceCard.card_number.slice(4);
  const card_number = isEyeOff
    ? hideCardNumber(number)
    : formatCardNumber(number);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() =>
            navigate('/financial/insurance/:user_id', {
              params: {
                user_id,
              },
            })
          }
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-3">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle>Insurance Card</CardTitle>
                <CardDescription>
                  View your insurance card details, including card number,
                  balance, and status.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label htmlFor="card-number">Card Number</Label>
                <div className="mt-2 flex gap-3">
                  <Input
                    id="card-number"
                    type="text"
                    value={card_number}
                    disabled
                    className="flex-1 font-mono text-lg"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="whitespace-nowrap"
                    onClick={() => setIsEyeOff((prev) => !prev)}
                  >
                    {isEyeOff ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="balance">Balance</Label>
                <div className="relative mt-2">
                  <Input
                    id="balance"
                    type="text"
                    value={`$${insuranceCard?.balance?.toFixed(2) || '0.00'}`}
                    disabled
                    className="pr-12 text-lg"
                    required
                  />
                </div>
              </div>

              {/* Top Up Section */}
              <div className="border-t pt-6">
                <h3 className="mb-4 text-lg font-semibold">Top Up Balance</h3>
                <div className="space-y-4">
                  {/* Wallet Info Display */}
                  <div className="rounded-lg bg-gray-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-green-100 p-2">
                          <Wallet className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Your Wallet
                          </p>
                          <p className="text-xs text-gray-500">
                            {wallet ? `ID: ${wallet.id}` : 'No wallet found'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-700">
                          Available Balance
                        </p>
                        <p className="text-lg font-bold text-green-600">
                          ${wallet?.balance?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="amount">Top Up Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount to top up"
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(e.target.value)}
                      className="mt-2"
                      min="0"
                      step="0.01"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Amount will be deducted from your wallet balance
                    </p>
                  </div>
                  <ReuseableButton
                    text="Top Up"
                    onClick={handleTopUp}
                    isPending={isTopUpPending}
                    spinner
                    className="w-full"
                    color="green"
                  />
                </div>
              </div>

              {insuranceCard && (
                <InsuranceCard card={{ ...insuranceCard, card_number }} />
              )}
              <div className="flex gap-4">
                <ReuseableButton
                  text="Back"
                  onClick={() =>
                    navigate('/financial/insurance/:user_id', {
                      params: {
                        user_id,
                      },
                    })
                  }
                  className="flex-1"
                  variant={'outline'}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
