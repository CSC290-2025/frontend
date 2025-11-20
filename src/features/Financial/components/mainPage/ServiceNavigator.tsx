import { useNavigate } from 'react-router';
import { Card, CardContent } from '@/components/ui/card';
import ServiceGrid, { type ServiceType } from './ServiceGrid';

interface ServiceNavigatorProps {
  userId: string;
  label?: string;
  className?: string;
}

export default function ServiceNavigator({
  userId,
  label = 'Connected Services',
  className = '',
}: ServiceNavigatorProps) {
  const navigate = useNavigate();

  const handleItemClick = (type: ServiceType) => {
    switch (type) {
      case 'wallet':
        navigate('/financial/topup');
        break;
      case 'metro':
        navigate(`/financial/metro/${userId}`);
        break;
      case 'insurance':
        navigate(`/financial/insurance/${userId}`);
        break;
    }
  };

  return (
    <Card className={`h-60 w-full border-none shadow-sm ${className}`}>
      <CardContent className="p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-[#06b6d4]"></div>
          <h3 className="text-lg font-bold text-gray-900">{label}</h3>
        </div>
        <ServiceGrid
          onItemClick={handleItemClick}
          label=""
          className=""
          exclude={['wallet' as ServiceType]}
        />
      </CardContent>
    </Card>
  );
}
