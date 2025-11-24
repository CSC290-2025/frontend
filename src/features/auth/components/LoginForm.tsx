import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader } from '@/components/ui/card.tsx';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useAuth } from '@/features/auth/context/AuthContext.tsx';
import { LoginSchema, type LoginFormData } from '@/features/auth/schemas';
import { useLogin } from '../hooks/useLogin.ts';
import { useState } from 'react';
import { Link } from '@/router.ts';

export default function LoginForm() {
  const { mutate, isPending } = useLogin();
  const { error: contextError, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    mode: 'onChange',
  });

  const onSubmit = (data: LoginFormData) => {
    clearError();
    mutate(data);
  };

  return (
    <Card className="relative z-10 w-full max-w-sm rounded-2xl bg-white/95 shadow-2xl backdrop-blur-md sm:max-w-md">
      <CardHeader className="flex flex-col items-center space-y-1 px-6 py-2 text-center">
        <h2 className="text-xl font-extrabold text-[#1E3A8A] sm:text-2xl">
          Welcome back!
        </h2>
        <p className="text-sm text-gray-500">Please login to your account</p>
      </CardHeader>

      <CardContent className="space-y-3 p-6 sm:p-6">
        {contextError && (
          <div className="flex items-center gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{contextError}</p>
          </div>
        )}

        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          {/* Email */}
          <div className="space-y-0.5">
            <Label htmlFor="email" className="text-sm">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register('email')}
              className={`h-10 text-sm ${errors.email ? 'border-red-500' : ''}`}
              disabled={isPending}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-0.5">
            <Label htmlFor="password" className="text-sm">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                {...register('password')}
                className={`h-10 text-sm ${errors.password ? 'border-red-500' : ''}`}
                disabled={isPending}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-2.5 right-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-500 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-sky-400 py-2 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:opacity-50"
          >
            {isPending ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-blue-600 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
