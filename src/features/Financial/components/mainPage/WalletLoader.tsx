import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface WalletLoaderProps {
  userId: string;
  hasWallet: boolean;
  onUserIdChange: (userId: string) => void;
  onLoadWallet: () => void;
  onCreateWallet: () => void;
}

export default function WalletLoader({
  userId,
  hasWallet,
  onUserIdChange,
  onLoadWallet,
  onCreateWallet,
}: WalletLoaderProps) {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">User ID</Label>
            <div className="mt-1 flex gap-2">
              <Input
                type="text"
                value={userId}
                onChange={(e) => onUserIdChange(e.target.value)}
                className="w-32"
                placeholder="Enter user ID"
              />
              <Button onClick={onLoadWallet} variant="secondary">
                Load Wallet
              </Button>
            </div>
          </div>
        </div>

        {!hasWallet && (
          <Button onClick={onCreateWallet} className="mt-4">
            Create Wallet
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
