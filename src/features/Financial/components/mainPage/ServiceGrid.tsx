import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import WalletIcon from '@/features/Financial/assets/wallet.svg';
import MetroIcon from '@/features/Financial/assets/metro.svg';
import InsuranceIcon from '@/features/Financial/assets/insurance.svg';

export type ServiceType = 'wallet' | 'metro' | 'insurance';

export interface ServiceItem {
  id: ServiceType;
  label: string;
  icon: string;
  color: string;
  ringColor: string;
}

const SERVICES: ServiceItem[] = [
  {
    id: 'wallet',
    label: 'Wallet Top-up',
    icon: WalletIcon,
    color: 'rgba(171,245,167,1)',
    ringColor: 'ring-cyan-300',
  },
  {
    id: 'insurance',
    label: 'Insurance Card',
    icon: InsuranceIcon,
    color: 'rgba(255,185,194,1)',
    ringColor: 'ring-pink-200',
  },
  {
    id: 'metro',
    label: 'Metro Card',
    icon: MetroIcon,
    color: 'rgba(156,235,255,1)',
    ringColor: 'ring-sky-200',
  },
];

interface ServiceGridProps {
  selectedId?: ServiceType;
  onItemClick: (id: ServiceType) => void;
  label?: string;
  className?: string;
}

export default function ServiceGrid({
  selectedId,
  onItemClick,
  label,
  className = '',
}: ServiceGridProps) {
  return (
    <div className={`mb-6 ${className}`}>
      {label && <Label className="text-base font-medium">{label}</Label>}
      <div className="mt-3 grid grid-cols-3 gap-3">
        {SERVICES.map((service) => (
          <Button
            key={service.id}
            variant="outline"
            onClick={() => onItemClick(service.id)}
            aria-pressed={selectedId === service.id}
            className={`flex h-28 flex-col items-center gap-2 border p-4 transition-transform duration-150 ease-in-out ${
              selectedId === service.id
                ? `ring-2 ${service.ringColor}`
                : 'hover:-translate-y-1 hover:scale-105'
            }`}
          >
            <div
              className="rounded-lg p-2"
              style={{ background: service.color }}
            >
              <img src={service.icon} alt={service.label} className="h-6 w-6" />
            </div>
            <div className="text-sm">{service.label}</div>
          </Button>
        ))}
      </div>
    </div>
  );
}
