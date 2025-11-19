import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { useRegister } from '../hooks/useRegister';
import { useState } from 'react';

export default function RegisterFormUI() {
  const { mutate } = useRegister();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmedPassword, setConfirmedPassword] = useState('');

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 pb-8 text-center">
        <CardTitle className="text-2xl font-bold tracking-normal text-slate-900">
          Get Started! Now
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();

            mutate({ email, username, password });
          }}
        >
          {/* Username */}
          <div className="space-y-2">
            <Input
              placeholder="Username"
              className="h-12 text-base"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              className="h-12 text-base"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password Row */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1 space-y-2">
              <Input
                type="password"
                placeholder="Password"
                className="h-12 text-base"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex-1 space-y-2">
              <Input
                type="password"
                placeholder="Confirm"
                className="h-12 text-base"
                value={confirmedPassword}
                onChange={(e) => setConfirmedPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Register Button */}
          <Button
            type="submit"
            className="mt-4 h-11 w-fit rounded-lg bg-slate-950 px-8 text-base font-medium text-white hover:bg-slate-800"
          >
            Register
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
