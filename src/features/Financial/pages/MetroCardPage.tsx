import {
  useGetMetroCardsUserUserId,
  usePostMetroCards,
} from '@/api/generated/metro-cards';
import { useParams } from '@/router';
import AmountBox from '../components/metro-cards/AmountBox';
import { Plus } from 'lucide-react';
import Loading from '../components/metro-cards/Loading';
import ReuseableButton from '../components/metro-cards/ReuseableButton';
import EmptyCard from '../components/metro-cards/EmptyCard';
import MetroCard from '../components/metro-cards/MetroCard';
import { toast } from 'sonner';
import type {
  PostMetroCards400Error,
  PostMetroCards409Error,
} from '@/api/generated/model';
import type { AxiosError } from 'axios';

export default function MetroCardPage() {
  const { user_id } = useParams('/financial/metro/:user_id');

  const {
    data: metroCardResponse,
    refetch,
    isLoading,
  } = useGetMetroCardsUserUserId(Number(user_id));

  const { mutate, isPending } = usePostMetroCards({
    mutation: {
      onSuccess: ({ data }) => {
        refetch();
        toast.success(data.message);
      },
      onError: (
        error: AxiosError<PostMetroCards400Error | PostMetroCards409Error>
      ) => {
        const err = error.response?.data?.message;
        toast.error(err);
      },
    },
  });

  const metroCards = metroCardResponse?.data?.data.metroCards;

  if (!user_id) {
    return <div> no user id provided</div>;
  }

  if (isLoading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Metro Card Wallet
          </h1>
          <p className="mt-1 text-gray-600">
            Manage your metro cards and check balances
          </p>
        </div>
        <AmountBox metroCards={metroCards ?? []} onRefetch={refetch} />
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Your Metro Cards
          </h2>
          <ReuseableButton
            text="Add New Card"
            icon={<Plus />}
            isPending={isPending}
            spinner
            className="h-10 cursor-pointer"
            color="cyan"
            onClick={() => mutate({ data: { user_id: Number(user_id) } })}
          />
        </div>
        {metroCards?.length === 0 ? (
          <EmptyCard isPending={isPending} mutate={mutate} />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {metroCards?.map((card) => (
              <div key={card.id} className="cursor-pointer">
                <MetroCard card={card} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
