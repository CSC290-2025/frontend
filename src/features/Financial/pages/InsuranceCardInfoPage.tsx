// Page for viewing and topping up insurance card
import {
  useUseGetInsuranceCardById as useGetInsuranceCardById,
  useUseDeleteMyInsuranceCard as useDeleteMyInsuranceCard,
} from '@/api/generated/insurance-cards';
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
import { ArrowLeft, CreditCard, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import Loading from '@/features/Financial/components/metro-cards/Loading';
import InsuranceCard from '@/features/Financial/components/insurance-cards/InsuranceCard';
import ReuseableButton from '@/features/Financial/components/metro-cards/ReuseableButton';
import { ReusableDialog } from '../components/metro-cards/ReusableDialog';
import { toast } from 'sonner';

export default function InsuranceCardInfoPage() {
  const navigate = useNavigate();

  const [isEyeOff, setIsEyeOff] = useState<boolean>(true);

  const { id } = useParams('/financial/insurance/info/:id');

  const { data: insuranceCardResponse, isLoading } = useGetInsuranceCardById(
    Number(id),
    { query: { retry: false } }
  );

  const { mutate, isPending } = useDeleteMyInsuranceCard({
    mutation: {
      onSuccess: () => {
        toast.success('Insurance card deleted successfully');
        setTimeout(() => navigate('/financial/insurance'), 1000);
      },
      onError: (error) => {
        const err =
          (error as any).response?.data?.message ||
          'Failed to delete insurance card';
        console.log(error);
        toast.error(err);
      },
    },
  });

  const insuranceCard = insuranceCardResponse?.data;

  if (isLoading) return <Loading />;

  if (!insuranceCard)
    return <div className="p-6 text-center">Insurance card not found</div>;

  const hideCardNumber = (cardNumber: string): string => {
    const cleanNumber = cardNumber.replace(/\s+/g, '');
    const visibleDigits = cleanNumber.slice(-4);
    const hiddenGroups = '•••• •••• ••••';
    return `${hiddenGroups} ${visibleDigits}`;
  };

  const formatCardNumber = (cardNumber: string) => {
    // Remove the INS- prefix
    const cleaned = cardNumber.replace(/^INS-/, '').replace(/-/g, '');
    // cleaned = "000027213716"

    // Insert a space between the two parts
    return cleaned.replace(/(\d{6})(\d{6})/, '$1 $2');
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
          onClick={() => navigate('/financial/insurance')}
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
                <div className="mt-2 flex gap-3">
                  <Input
                    id="balance"
                    type="text"
                    value={`$${insuranceCard?.balance?.toFixed(2) || '0.00'}`}
                    disabled
                    className="pr-12 text-lg"
                    required
                  />
                  <ReuseableButton
                    text="Top up"
                    onClick={() =>
                      navigate('/financial/topup', {
                        state: {
                          cardNumber: formatCardNumber(number),
                          type: 'insurance',
                        },
                      })
                    }
                    className="flex-1 cursor-pointer"
                    color="green"
                  />
                </div>
              </div>

              {insuranceCard && (
                <div>
                  <InsuranceCard card={{ ...insuranceCard, card_number }} />
                </div>
              )}
              <div className="flex gap-4">
                <ReuseableButton
                  text="Back"
                  onClick={() => navigate('/financial/insurance')}
                  className="flex-1"
                  variant={'outline'}
                />
                <ReusableDialog
                  trigger={
                    <Button
                      variant="destructive"
                      className="flex-1 cursor-pointer"
                    >
                      Delete
                    </Button>
                  }
                  isPending={isPending}
                  title="Are you absolutely sure?"
                  description="This action cannot be undone."
                  cancelLabel="Cancel"
                  actionLabel="Delete"
                  className="bg-red-600 hover:bg-red-700"
                  onAction={() => mutate({ insuranceCardId: Number(id) })}
                  spinner
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
