import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, Plus } from 'lucide-react';
import ReuseableButton from './ReuseableButton';
import { useParams } from '@/router';

interface EmptyCardProps {
  isPending: boolean;
  mutate: (data: any) => void;
}

export default function EmptyCard({ isPending, mutate }: EmptyCardProps) {
  const { user_id } = useParams('/financial/metro/:user_id');

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <CreditCard className="mb-4 h-10 w-10 text-gray-300" />
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          No Metro Cards Yet
        </h3>
        <p className="mb-6 text-gray-600">
          Create your first metro card to get started
        </p>
        <ReuseableButton
          text="Create Metro Card"
          icon={<Plus />}
          onClick={() => mutate({ data: { user_id: Number(user_id) } })}
          className="h-10"
          spinner
          isPending={isPending}
          color="cyan"
        />
      </CardContent>
    </Card>
  );
}
