// Component to display insurance card information
import { Card, CardContent } from '@/components/ui/card';
import type { InsuranceCard } from '@/features/Financial/types';
import { CreditCard, Calendar, DollarSign } from 'lucide-react';
import { Link } from '@/router';
import { useParams } from '@/router';

interface InsuranceCardProps {
  card: InsuranceCard;
}

export default function InsuranceCard({ card }: InsuranceCardProps) {
  const { user_id } = useParams('/financial/insurance/:user_id');

  const formatCardNumber = (cardNumber: string) => {
    return cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Link
      to="/financial/insurance/:user_id/info/:id"
      params={{ user_id: user_id || '', id: String(card.id) }}
    >
      <Card className="group cursor-pointer overflow-hidden border-2 border-transparent bg-gradient-to-br from-green-50 to-emerald-50 transition-all duration-300 hover:border-green-500 hover:shadow-xl">
        <CardContent className="p-6">
          <div className="mb-6 flex items-start justify-between">
            <div className="rounded-xl bg-green-100 p-3 shadow-md transition-all group-hover:bg-green-200">
              <CreditCard className="h-6 w-6 text-green-600" />
            </div>
            <div
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                card.status === 'active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {card.status}
            </div>
          </div>

          <div className="mb-6 space-y-2">
            <div className="font-mono text-sm text-gray-500">Card Number</div>
            <div className="font-mono text-lg font-semibold tracking-wider text-gray-900">
              {formatCardNumber(card.card_number.slice(4))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-green-200 pt-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-xs text-gray-500">Balance</div>
                <div className="font-semibold text-gray-900">
                  ${(card.balance || 0).toFixed(2)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-600" />
              <div className="text-right">
                <div className="text-xs text-gray-500">Created</div>
                <div className="text-sm font-medium text-gray-900">
                  {formatDate(card.created_at)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
