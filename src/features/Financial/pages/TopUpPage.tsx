import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { QRCodeSVG } from 'qrcode.react';
import {
  useGetWalletsUserUserId,
  usePostWalletsWalletIdTopUp,
} from '@/api/generated/wallets';
import { usePostMetroCardsTopUp } from '@/api/generated/metro-cards';
import { usePostInsuranceCardsCardIdTopUp } from '@/api/generated/insurance-cards';
import { usePostScbQrCreate } from '@/api/generated/scb';
import type { PostScbQrCreate200Data } from '@/api/generated/model/postScbQrCreate200Data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import logoUrl from '@/features/Financial/assets/promptwc.png';
import promptPay from '@/features/Financial/assets/pplogoTop.png';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import ServiceSelector, {
  type ServiceType as TopUpType,
} from '../components/topup/ServiceSelector';

export default function TopupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const cardNumberFromState = (location.state as { cardNumber?: string })
    ?.cardNumber;

  const initialCardRef = useRef<string | undefined>(cardNumberFromState);

  const [userId] = useState(1); // Assuming user ID 1 for demo
  const [topUpType, setTopUpType] = useState<TopUpType>(
    cardNumberFromState ? 'metro' : 'wallet'
  );
  const [amount, setAmount] = useState('');
  const [cardId, setCardId] = useState(cardNumberFromState ?? '');
  const [qrRawData, setQrRawData] = useState('');
  // ref1 is used to track and verify whether the payment completed successfully
  const [scbRef1, setScbRef1] = useState<string | undefined>(undefined);

  // when initial state changes, make sure to keep the reference
  useEffect(() => {
    if (cardNumberFromState) {
      initialCardRef.current = cardNumberFromState;
      setTopUpType('metro');
      setCardId(cardNumberFromState);
    }
  }, [cardNumberFromState]);

  const { data: walletResponse, refetch: refetchWallet } =
    useGetWalletsUserUserId(userId);
  const wallet = walletResponse?.data?.data?.wallet;

  const { mutateAsync: topUpWallet, isPending: isTopUpWalletPending } =
    usePostWalletsWalletIdTopUp({
      mutation: { onSuccess: () => refetchWallet() },
    });
  const { mutateAsync: topUpMetro, isPending: isTopUpMetroPending } =
    usePostMetroCardsTopUp({ mutation: { onSuccess: () => refetchWallet() } });
  const { mutateAsync: topUpInsurance, isPending: isTopUpInsurancePending } =
    usePostInsuranceCardsCardIdTopUp({
      mutation: { onSuccess: () => refetchWallet() },
    });
  const { mutateAsync: generateQR } = usePostScbQrCreate();
  // We'll use SSEs to be notified of SCB webhook confirmations.
  const [isWaiting, setIsWaiting] = useState(false);

  const quickAmounts = [100, 500, 1000, 2000, 5000, 10000];

  const resetInputsForType = (newType: TopUpType) => {
    // If we switch types using the buttons, reset inputs (except restore initial metro id if present)
    if (newType === 'metro') {
      setCardId(initialCardRef.current ?? '');
    } else {
      // clear card ID when not a metro target
      setCardId('');
    }

    // Always clear the amount when switching between topup types to avoid carried-over amounts
    setAmount('');
    setQrRawData('');
  };

  const handleTopUpTypeChange = (t: TopUpType) => {
    if (t === topUpType) return;
    setTopUpType(t);
    resetInputsForType(t);
  };

  const handleTopUp = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      if (topUpType === 'wallet') {
        // Generate QR for wallet topup
        const response = await generateQR({
          data: { amount, user_id: userId },
        });
        // uhh this is mostly to shut TS up; blub doesnt believe qrResponse is real
        const qrResponseContainer = response.data?.data as unknown as
          | { qrResponse: PostScbQrCreate200Data }
          | undefined;
        const qrData = qrResponseContainer?.qrResponse?.qrRawData;
        const ref1 = qrResponseContainer?.qrResponse?.ref1;
        setQrRawData(qrData ?? '');
        setScbRef1(ref1);
      } else if (topUpType === 'metro') {
        if (!cardId) {
          toast.error('Please enter metro card ID');
          return;
        }
        if (!wallet?.id) {
          toast.error('Wallet not found');
          return;
        }
        await topUpMetro({
          data: {
            cardNumber: cardId.replace(/\s+/g, ''), // Remove spaces
            walletId: wallet.id,
            amount: parseFloat(amount),
          },
        });
        toast.success('Metro card topped up successfully');
        resetInputsForType('metro');
      } else if (topUpType === 'insurance') {
        if (!cardId) {
          toast.error('Please enter insurance card ID');
          return;
        }
        if (!wallet?.id) {
          toast.error('Wallet not found');
          return;
        }
        await topUpInsurance({
          data: { wallet_id: wallet.id, amount: parseFloat(amount) },
          cardId: parseInt(cardId),
        });
        toast.success('Insurance card topped up successfully');
        resetInputsForType('insurance');
      }
    } catch (error) {
      console.error('Top up error:', error);
      toast.error('Top up failed');
    }
  };

  const handleSimulatePayment = async () => {
    if (!wallet?.id || !amount) return;
    try {
      await topUpWallet({
        data: { amount: parseFloat(amount) },
        walletId: wallet.id,
      });
      toast.success('Wallet topped up successfully');
      setQrRawData('');
      setAmount('');
      refetchWallet();
    } catch (error) {
      console.error('Simulate payment error:', error);
      toast.error('Payment simulation failed');
    }
  };
  // Subscribe to the SSE stream when we have a ref1.
  // when the scb webhook confirms payment, we'll get notified here.
  useEffect(() => {
    if (!scbRef1) return;
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

    // this is where i have my backend set up for sending sse
    const url = `${base}/scb/stream?ref1=${encodeURIComponent(scbRef1)}`;

    // make a new event source and wait
    const es = new EventSource(url);
    es.onopen = () => setIsWaiting(true);

    // if we get a call from backend that payment is confirmed so we will process it
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        // we just checking for ref1 to confirm
        // it is really not necessary since backend calling this already mean that payment has been confirmed
        const confirmed = data?.ref1;
        if (confirmed) {
          toast.success('Payment confirmed');
          // don't clear the ref here — we want to keep showing the ref1
          // permanently in the UI as requested; only clear QR and refresh.
          setQrRawData('');
          setAmount('');
          refetchWallet();
        }
      } catch (err) {
        console.error('Failed to parse SSE message', err);
      } finally {
        setIsWaiting(false);
        es.close();
      }
    };

    es.onerror = (err) => {
      console.error('SSE connection error', err);
      setIsWaiting(false);
      es.close();
    };

    return () => {
      es.close();
      setIsWaiting(false);
    };
  }, [scbRef1, refetchWallet]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/financial')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Top Up Wallet</CardTitle>
                <p className="text-sm text-gray-600">
                  Use your wallet to top up other services
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Available Balance */}
            <div className="mb-6 rounded-lg border border-gray-300 p-10 text-center">
              <p className="text-sm text-gray-600">Available Balance</p>
              <p className="mt-8 text-5xl font-bold">
                ฿
                {Number(wallet?.balance ?? 0).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>

            {/* Select what to top up */}
            <ServiceSelector
              selected={topUpType}
              onSelect={handleTopUpTypeChange}
              label="Top up destination"
            />

            {/* Card ID input for metro/insurance */}
            {(topUpType === 'metro' || topUpType === 'insurance') && (
              <div className="mb-4">
                <Label htmlFor="cardId">
                  {topUpType === 'metro'
                    ? 'Metro Card ID'
                    : 'Insurance Card ID'}
                </Label>
                <Input
                  id="cardId"
                  type="text"
                  placeholder={`Enter ${topUpType} card ID`}
                  value={cardId}
                  onChange={(e) => setCardId(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}

            {/* Amount input */}
            <div className="mb-4">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1"
                min="0"
                step="0.01"
              />
            </div>

            {/* Quick amounts */}
            <div className="mb-4 grid grid-cols-3 gap-3">
              {quickAmounts.map((a) => (
                <button
                  key={a}
                  onClick={() => setAmount(String(a))}
                  className="rounded-md bg-gray-100 py-2 text-center text-sm"
                >
                  {a.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Payment method for wallet */}
            {topUpType === 'wallet' && (
              <div className="mb-6">
                <Label>Payment Method</Label>
                <Select defaultValue="promptpay">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="promptpay">Prompt Pay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* QR Code for wallet topup */}
            {topUpType === 'wallet' && qrRawData ? (
              <div className="space-y-4">
                <div className="inline-block border p-4">
                  {/* This is just old qr without the logo and stuff. useable*/}
                  {/* <QRCodeSVG value={qrRawData} size={200} /> */}

                  {/* top part of the prompt pay */}
                  <div className="flex w-full justify-center pb-4">
                    <img
                      src={promptPay}
                      alt="PromptPay Logo"
                      style={{ height: 40, width: 'auto' }}
                    />
                  </div>
                  {/* QR code with logo in middle */}
                  <QRCodeSVG
                    value={qrRawData}
                    size={200}
                    level={'M'}
                    imageSettings={{
                      src: logoUrl,
                      excavate: false,
                      height: 50,
                      width: 50,
                    }}
                  />
                </div>
                {isWaiting && (
                  <div className="text-sm text-gray-500">
                    Waiting for payment...
                  </div>
                )}
                {scbRef1 && (
                  <div className="text-sm text-gray-400">
                    Reference ID: {scbRef1}
                  </div>
                )}
                {/* QR will be hidden when payment is confirmed*/}
                <div>Amount: ${amount}</div>
                <p className="text-sm text-gray-600">
                  This is a real QR code for payment. You can use you SCB
                  EASYSandbox application to scan and pay. The confirmation will
                  only work if the backend is ran on
                  smartcity-api.sit.kmutt.ac.th, use the simulate payment button
                  instead.
                </p>
                <Button
                  onClick={handleSimulatePayment}
                  disabled={isTopUpWalletPending}
                >
                  {isTopUpWalletPending ? 'Processing...' : 'Simulate Payment'}
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleTopUp}
                className={`w-full bg-[#01CEF8] py-4 text-xl text-white transition-colors hover:bg-[#01bfe0]`}
                disabled={
                  !amount ||
                  (topUpType !== 'wallet' && !cardId) ||
                  isTopUpWalletPending ||
                  isTopUpMetroPending ||
                  isTopUpInsurancePending
                }
              >
                {isTopUpWalletPending ||
                isTopUpMetroPending ||
                isTopUpInsurancePending
                  ? 'Processing...'
                  : topUpType === 'wallet'
                    ? 'Top Up'
                    : 'Transfer Money'}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
