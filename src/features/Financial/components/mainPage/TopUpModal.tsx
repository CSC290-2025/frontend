import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';
export default function TopUpButton() {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/financial/topup');
  };

  return (
    <Button
      className="flex-1 gap-2 bg-cyan-400 hover:bg-cyan-500"
      size="lg"
      onClick={handleClick}
    >
      <Wallet className="h-5 w-5" />
      Top-up
    </Button>
  );
}
