import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EyeOff } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLogin } from '../hooks/useLogin';

export default function LoginUI() {
  const { mutate } = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <Card className="relative z-10 h-[75vh] w-full max-w-md rounded-2xl bg-white/95 shadow-2xl backdrop-blur-md sm:max-w-lg md:max-w-[40vw]">
      <CardHeader className="flex flex-col items-center space-y-2 px-6 pt-6 text-center">
        <h2 className="text-2xl font-extrabold text-[#1E3A8A] sm:text-4xl">
          Welcome back !
        </h2>
        <p className="text-sm text-gray-500">Please login to your account</p>
      </CardHeader>

      <CardContent className="space-y-5 p-6 sm:p-8">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();

            mutate({ email, password });
          }}
        >
          {/* Email */}
          <div className="space-y-1">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <Label>Password</Label>
            <div className="relative">
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <EyeOff className="absolute top-3 right-3 h-5 w-5 cursor-pointer text-gray-400" />
            </div>
          </div>

          <div className="flex justify-end">
            <a href="#" className="text-sm text-blue-500 hover:underline">
              Forget password?
            </a>
          </div>

          {/* Login Button */}
          <Button className="w-full rounded-md bg-sky-400 py-2 text-base font-semibold text-white transition hover:bg-sky-500 sm:text-lg">
            Login
          </Button>
        </form>
        <p className="text-center text-sm text-gray-500">
          Don’t have an account?{' '}
          <a href="#  " className="font-semibold text-blue-600 hover:underline">
            Sign up
          </a>
        </p>
      </CardContent>
    </Card>
  );
}
