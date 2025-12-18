import { KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForgetPassword } from '../hooks/usePasswordReset';
import { useState } from 'react';
export default function RequestReset() {
  const [email, setEmail] = useState('');
  const { mutate, isPending, isSuccess, error } = useForgetPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Stop page reload

    mutate({ email });
  };
  return (
    <div className="flex w-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 text-center">
          {/* The Icon Circle */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <KeyRound className="h-8 w-8 text-blue-600" />
          </div>

          <CardTitle className="text-2xl font-bold">Forget password?</CardTitle>
          <CardDescription className="text-gray-500">
            Enter your email to reset your password.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                className="bg-gray-50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-cyan-500 text-lg hover:bg-cyan-600"
            >
              Reset Password
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
