// Main page for Insurance Card feature
import {
  useUserInsuranceCards,
  useCreateInsuranceCard,
} from '@/features/Financial/hooks';
import { useParams } from '@/router';
import { Plus, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import Loading from '@/features/Financial/components/metro-cards/Loading';
import ReuseableButton from '@/features/Financial/components/metro-cards/ReuseableButton';
import InsuranceCard from '@/features/Financial/components/insurance-cards/InsuranceCard';
import { toast } from 'sonner';

export default function InsuranceCardPage() {
  const { user_id } = useParams('/financial/insurance/:user_id');
  const navigate = useNavigate();

  const {
    data: insuranceCards,
    refetch,
    isLoading,
    error,
  } = useUserInsuranceCards(Number(user_id));

  const { mutate, isPending } = useCreateInsuranceCard();

  // Debug logging
  console.log('InsuranceCardPage - user_id:', user_id);
  console.log('InsuranceCardPage - insuranceCards:', insuranceCards);
  console.log('InsuranceCardPage - isLoading:', isLoading);
  console.log('InsuranceCardPage - error:', error);

  const handleCreateCard = () => {
    mutate(
      { user_id: Number(user_id) },
      {
        onSuccess: async () => {
          await refetch();
          toast.success('Insurance card created successfully');
        },
        onError: (error) => {
          const err = (error as Error).message || 'An error occurred';
          toast.error(err);
        },
      }
    );
  };

  const totalBalance = (insuranceCards || []).reduce(
    (sum, card) => sum + (card.balance || 0),
    0
  );

  if (!user_id) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            No User ID Provided
          </h2>
          <p className="mt-2 text-gray-600">
            Please provide a user ID in the URL
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Try: /financial/insurance/1 or /financial/insurance/2
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) return <Loading />;

  if (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to load insurance cards';
    console.error('Insurance cards error:', error);
    return (
      <div className="p-6 text-center">
        <div className="font-semibold text-red-600">Error Loading Cards</div>
        <div className="mt-2 text-gray-600">{errorMessage}</div>
        <button
          onClick={() => refetch()}
          className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!insuranceCards)
    return <div className="p-6 text-center">No data found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Insurance Card Wallet
          </h1>
          <p className="mt-1 text-gray-600">
            Manage your insurance cards and check balance
          </p>
          <Button
            variant="ghost"
            onClick={() => navigate('/financial')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <div className="mb-6">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="text-sm text-gray-600">Total Balance</div>
            <div className="text-3xl font-bold text-gray-900">
              ${totalBalance.toFixed(2)}
            </div>
            <div className="mt-2 text-sm text-gray-500">
              {insuranceCards.length}{' '}
              {insuranceCards.length === 1 ? 'card' : 'cards'}
            </div>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Your Insurance Cards
          </h2>
          <ReuseableButton
            text="Create New Card"
            icon={<Plus />}
            isPending={isPending}
            spinner
            className="h-10"
            color="green"
            onClick={handleCreateCard}
          />
        </div>
        {insuranceCards.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">
              No insurance cards
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first insurance card.
            </p>
            <div className="mt-6">
              <ReuseableButton
                text="Create Card"
                icon={<Plus />}
                isPending={isPending}
                spinner
                color="green"
                onClick={handleCreateCard}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {insuranceCards.map((card) => (
              <InsuranceCard key={card.id} card={card} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
