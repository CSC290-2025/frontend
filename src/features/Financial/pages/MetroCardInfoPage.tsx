import {
  useDeleteMetroCardsMetroCardId,
  useGetMetroCardsMetroCardId,
} from '@/api/generated/metro-cards';
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
import { useEffect, useState } from 'react';
import Loading from '@/features/Financial/components/metro-cards/Loading';
import MetroCard from '@/features/Financial/components/metro-cards/MetroCard';
import ReuseableButton from '@/features/Financial/components/metro-cards/ReuseableButton';
import { ReusableDialog } from '../components/metro-cards/ReusableDialog';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';
import type { DeleteMetroCardsMetroCardId404Error } from '@/api/generated/model';

export default function MetroCardInfoPage() {
  const navigate = useNavigate();

  const [isEyeOff, setIsEyeOff] = useState<boolean>(true);

  const { id } = useParams('/financial/metro/info/:id');

  const {
    data: metroCardResponse,
    isLoading,
    error,
  } = useGetMetroCardsMetroCardId(Number(id));

  const { mutate, isPending } = useDeleteMetroCardsMetroCardId({
    mutation: {
      onSuccess: (data) => {
        toast.success(data.message);

        //1 sec delay
        setTimeout(() => navigate('/financial/metro'), 1000);
      },
      onError: (error: AxiosError<DeleteMetroCardsMetroCardId404Error>) => {
        const err = error.response?.data?.message;

        console.log(error);
        toast.error(err);
      },
    },
  });

  const metroCard = metroCardResponse?.data;

  if (isLoading) return <Loading />;

  const hideCardNumber = (cardNumber: string): string => {
    // Remove any spaces first
    const cleanNumber = cardNumber.replace(/\s+/g, '');
    const visibleDigits = cleanNumber.slice(-4);
    const hiddenGroups = '•••• •••• ••••';
    return `${hiddenGroups} ${visibleDigits}`;
  };

  //format
  const formatCardNumber = (cardNumber: string) => {
    return cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  //last 4 digits
  const number = metroCard?.card_number.slice(4);

  //for showing full numbers
  const card_number = isEyeOff
    ? hideCardNumber(number!)
    : formatCardNumber(number!);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/financial/metro')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Your Cards
        </Button>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-cyan-100 p-3">
                <CreditCard className="h-6 w-6 text-cyan-600" />
              </div>
              <div>
                <CardTitle>Metro Card</CardTitle>
                <CardDescription>
                  View your metro card details, including card number, balance,
                  and status.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
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
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => setIsEyeOff((prev) => !prev)}
                >
                  {isEyeOff ? <EyeOff /> : <Eye />}
                </Button>
              </div>
              <div>
                <Label htmlFor="balance">Balance</Label>
                <div className="mt-2 flex gap-3">
                  <Input
                    id="balance"
                    type="text"
                    value={metroCard?.balance}
                    disabled
                    className="pr-12 text-lg"
                    required
                  />
                  <ReuseableButton
                    text="Top up"
                    onClick={() =>
                      navigate('/financial/topup', {
                        state: { cardNumber: formatCardNumber(number!) },
                      })
                    }
                    className="flex-1 cursor-pointer"
                    color="green"
                  />
                </div>
              </div>
              {metroCard && <MetroCard card={{ ...metroCard, card_number }} />}
              <div className="flex gap-4">
                <ReuseableButton
                  text="Cancel"
                  onClick={() => navigate('/financial/metro')}
                  className="flex-1 cursor-pointer"
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
                  onAction={() => mutate({ metroCardId: Number(id) })}
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
