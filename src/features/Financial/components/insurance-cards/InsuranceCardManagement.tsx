import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  useUseGetUserInsuranceCards as useGetUserInsuranceCards,
  useUseUpdateInsuranceCard as useUpdateInsuranceCard,
  getUseGetUserInsuranceCardsQueryKey,
  getUseGetMyInsuranceCardsQueryKey,
} from '@/api/generated/insurance-cards';
import { useGetUserProfileId } from '@/api/generated/user';
import { Loader2, RefreshCw } from 'lucide-react';
import type { AxiosError } from 'axios';
import type {
  UseUpdateInsuranceCard400,
  UseUpdateInsuranceCard404,
} from '@/api/generated/model';
import { useDebounce } from '@/features/Financial/hooks/useDebounce';

export default function InsuranceCardManagement() {
  const [userId, setUserId] = useState('');
  const debouncedUserId = useDebounce(userId, 500);
  const queryClient = useQueryClient();

  const {
    data: cardsData,
    refetch: refetchCards,
    isFetching: isFetchingCards,
    isError: isCardsError,
  } = useGetUserInsuranceCards(Number(debouncedUserId), {
    query: { enabled: !!debouncedUserId },
  });

  const { data: userData, isFetching: isFetchingUser } = useGetUserProfileId(
    Number(debouncedUserId),
    {
      query: { enabled: !!debouncedUserId },
    }
  );

  const { mutate: updateCard, isPending: isUpdating } = useUpdateInsuranceCard<
    AxiosError<UseUpdateInsuranceCard400 | UseUpdateInsuranceCard404>
  >({
    mutation: {
      onSuccess: () => {
        toast.success('Card updated successfully!');
        queryClient.invalidateQueries({
          queryKey: getUseGetUserInsuranceCardsQueryKey(
            Number(debouncedUserId)
          ),
        });
        queryClient.invalidateQueries({
          queryKey: getUseGetMyInsuranceCardsQueryKey(),
        });
      },
      onError: (error) => {
        const message =
          (error.response?.data as any)?.message || 'Failed to update card';
        toast.error(message);
      },
    },
  });

  const cards = cardsData?.data?.insuranceCards || [];
  const username = (userData?.data as any)?.user?.username;

  const isFetching = isFetchingCards || isFetchingUser;
  const isError = isCardsError;

  return (
    <Card className="mt-8 mb-6">
      <CardContent className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Admin Insurance Card Management
        </h3>
        <div className="mb-4 space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            User ID
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID"
            />
            <Button
              onClick={() => refetchCards()}
              size="sm"
              disabled={isFetching || !debouncedUserId}
            >
              {isFetching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {isError && (
          <div className="mt-2 text-sm text-red-500">
            Failed to load cards. Please check the User ID.
          </div>
        )}

        {debouncedUserId && cards.length === 0 && !isFetching && !isError && (
          <div className="mt-2 text-sm text-gray-500">
            No insurance cards found for this user.
          </div>
        )}

        {cards.length > 0 && (
          <div className="space-y-4 border-t pt-4">
            {username && (
              <div className="text-sm">
                <span className="font-semibold">Owner:</span> {username}
              </div>
            )}
            <h4 className="font-medium text-gray-900">User&apos;s Cards</h4>
            <div className="grid gap-4">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="flex items-center justify-between rounded-lg border p-4 shadow-sm"
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      {card.card_number}
                    </div>
                    <div className="text-sm text-gray-500">
                      Balance: ${card.balance?.toFixed(2) ?? '0.00'}
                    </div>
                    <div className="text-sm text-gray-500">
                      Status:{' '}
                      <span
                        className={`font-medium ${card.status === 'active' ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {card.status}
                      </span>
                    </div>
                    {card.created_at && (
                      <div className="mt-1 text-xs text-gray-400">
                        Created: {new Date(card.created_at).toLocaleString()}
                      </div>
                    )}
                    {card.updated_at && (
                      <div className="text-xs text-gray-400">
                        Updated: {new Date(card.updated_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() =>
                      updateCard({
                        data: {
                          status:
                            card.status === 'active' ? 'suspended' : 'active',
                        },
                        insuranceCardId: card.id,
                      })
                    }
                    variant={
                      card.status === 'active' ? 'destructive' : 'default'
                    }
                    size="sm"
                    disabled={isUpdating}
                  >
                    {card.status === 'active' ? 'Suspend' : 'Activate'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
