import { useGetMetroCardsUserUserId } from '@/api/generated/metro-cards';
import { useNavigate, useParams } from '@/router';
import AmountBox from '../components/metro-cards/AmountBox';
import { Plus } from 'lucide-react';
import Loading from '../components/metro-cards/Loading';
import ReuseableButton from '../components/metro-cards/ReuseableButton';
import EmptyCard from '../components/metro-cards/EmptyCard';
import MetroCard from '../components/metro-cards/MetroCard';

export default function MetroCardPage() {
  const { id } = useParams('/financial/metro/:id');

  const {
    data: metroCardResponse,
    refetch,
    isLoading,
  } = useGetMetroCardsUserUserId(Number(id));

  const metroCards = metroCardResponse?.data?.data.metroCards;

  if (!id) {
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
            className="h-10"
            onClick={() => console.log('ok')}
          />
        </div>
        {metroCards?.length === 0 ? (
          <EmptyCard />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {metroCards?.map((card) => (
              <MetroCard card={card} key={card.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
