import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, Plus } from 'lucide-react';
import ReuseableButton from './ReuseableButton';
import { useParams } from '@/router';

export default function EmptyCard() {
  const { id } = useParams('/financial/metro/:id');

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
          onClick={() => console.log('ok')}
          className="h-10"
        />
      </CardContent>
    </Card>
  );
}
