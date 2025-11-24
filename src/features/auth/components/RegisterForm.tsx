import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Label } from '@/components/ui/label.tsx';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useRegister } from '../hooks/useRegister.ts';
import { useAuth } from '@/features/auth/context/AuthContext.tsx';
import { RegisterSchema, type RegisterFormData } from '@/features/auth/schemas';
import { useState } from 'react';
import { Link } from '@/router.ts';

export default function RegisterFormUI() {
  const { mutate, isPending } = useRegister();
  const { error: contextError, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
    mode: 'onChange',
  });

  const onSubmit = (data: RegisterFormData) => {
    clearError();
    const { confirmPassword, ...submitData } = data;
    mutate(submitData as RegisterFormData);
  };

  return (
    <Card className="relative z-10 w-full max-w-sm rounded-2xl bg-white/95 shadow-2xl backdrop-blur-md sm:max-w-md">
      <CardHeader className="flex flex-col items-center space-y-1 px-6 py-2 text-center">
        <CardTitle className="text-xl font-extrabold text-[#1E3A8A] sm:text-2xl">
          Get Started!
        </CardTitle>
        <p className="text-sm text-gray-500">Create your account to begin</p>
      </CardHeader>

      <CardContent className="space-y-3 p-6 sm:p-6">
        {contextError && (
          <div className="mb-4 flex items-center gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{contextError}</p>
          </div>
        )}

        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          {/* Username */}
          <div className="space-y-0.5">
            <Label htmlFor="username" className="text-sm">
              Username
            </Label>
            <Input
              id="username"
              placeholder="Choose a username"
              className={`h-10 text-sm ${errors.username ? 'border-red-500' : ''}`}
              {...register('username')}
              disabled={isPending}
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-0.5">
            <Label htmlFor="email" className="text-sm">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className={`h-10 text-sm ${errors.email ? 'border-red-500' : ''}`}
              {...register('email')}
              disabled={isPending}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password Row */}
          <div className="flex flex-col gap-3">
            <div className="space-y-0.5">
              <Label htmlFor="password" className="text-sm">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  className={`h-10 text-sm ${errors.password ? 'border-red-500' : ''}`}
                  {...register('password')}
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
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-0.5">
              <Label htmlFor="confirmPassword" className="text-sm">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm password"
                  className={`h-10 text-sm ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  {...register('confirmPassword')}
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute top-2.5 right-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          {/* Register Button */}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-sky-400 py-2 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:opacity-50"
          >
            {isPending ? 'Registering...' : 'Register'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
