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
import { Loader2, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useResetPassword, useVerifyToken } from '../hooks/usePasswordReset';
import { useSearchParams } from 'react-router';
import { useState } from 'react';
export default function Reset() {
  const [password, setPassword] = useState('');
  const [searchParams] = useSearchParams();
  const [confirmPassword, setConfirmPassword] = useState('');
  const { mutate, isPending, isSuccess, error } = useResetPassword();

  const token = searchParams.get('token') ?? '';
  const { isLoading: isChecking, isError: isTokenInvalid } = useVerifyToken(
    token || ''
  );
  //   if (!token) {
  //     return <div>Invalid Link: No token found.</div>;
  //   }

  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
        <span className="ml-2 text-gray-500">Verifying link...</span>
      </div>
    );
  }
  if (isTokenInvalid) {
    return (
      <div className="flex h-screen items-center justify-center">
        <XCircle className="h-10 w-10 text-red-500" />
        <span className="ml-2 text-gray-500">Invalid or expired link.</span>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Stop page reload
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    mutate({ token, newPassword: password });
  };
  return (
    <div className="flex w-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 text-center">
          {/* The Icon Circle */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <KeyRound className="h-8 w-8 text-blue-600" />
          </div>

          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription className="text-gray-500">
            Enter your new password to confirm reset your password.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <Label htmlFor="password" className="font-semibold text-gray-700">
                New Password
              </Label>
              <Input
                id="password"
                placeholder="e.g 123456"
                type="password"
                className="bg-gray-50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Label htmlFor="confirm" className="font-semibold text-gray-700">
                Confirm Password
              </Label>
              <Input
                id="confirm"
                placeholder="e.g 123456"
                type="password"
                className="bg-gray-50"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
