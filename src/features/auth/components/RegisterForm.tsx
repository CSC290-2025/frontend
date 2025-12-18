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
import { AlertCircle, Eye, EyeOff, Check } from 'lucide-react';
import { useRegister } from '../hooks/useRegister.ts';
import { useAuth } from '@/features/auth/context/AuthContext.tsx';
import { RegisterSchema, type RegisterFormData } from '@/features/auth/schemas';
import { useState } from 'react';
import { Link } from '@/router.ts';

// Define the steps and which fields belong to them for validation
const STEPS = [
  {
    id: 1,
    name: 'Account',
    fields: ['username', 'email', 'password', 'confirmPassword'],
  },
  {
    id: 2,
    name: 'Personal',
    fields: [
      'firstName',
      'lastName',
      'dob',
      'phone',
      'emergencyContact',
      'gender',
    ],
  },
  {
    id: 3,
    name: 'Address',
    fields: [
      'addressLine',
      'subDistrict',
      'district',
      'province',
      'postalCode',
    ],
  },
];

export default function RegisterFormUI() {
  const { mutate, isPending } = useRegister();
  const { error: contextError, clearError } = useAuth();

  // UI State
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    trigger, // Crucial: allows us to validate specific fields manually
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
    mode: 'onChange',
  });

  const onSubmit = (data: RegisterFormData) => {
    clearError();
    // Use 'unknown' cast if your backend schema is different from frontend form
    const { confirmPassword, ...submitData } = data;
    mutate(submitData as unknown as RegisterFormData);
  };

  // Logic to move to next step
  const handleNext = async () => {
    const fields = STEPS[currentStep - 1].fields;
    // Trigger validation only for current step fields
    const isStepValid = await trigger(fields as any);

    if (isStepValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  return (
    <Card className="relative z-10 w-full max-w-sm rounded-2xl bg-white/95 shadow-2xl backdrop-blur-md sm:max-w-md">
      <CardHeader className="flex flex-col items-center space-y-1 px-6 py-2 text-center">
        <CardTitle className="text-xl font-extrabold text-[#1E3A8A] sm:text-2xl">
          Get Started! Now
        </CardTitle>

        {/* Progress Stepper */}
        <div className="mt-4 mb-2 flex w-full items-center justify-between px-2">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className="relative flex w-full flex-col items-center"
            >
              {/* The Line Connector */}
              {index !== 0 && (
                <div
                  className={`absolute top-3 right-1/2 -z-10 h-[2px] w-full ${currentStep >= step.id ? 'bg-gray-800' : 'bg-gray-200'}`}
                />
              )}

              {/* The Circle */}
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-[10px] font-bold transition-colors ${
                  currentStep >= step.id
                    ? 'border-gray-800 bg-gray-800 text-white'
                    : 'border-gray-300 bg-white text-gray-400'
                }`}
              >
                {currentStep > step.id ? (
                  <Check className="h-3 w-3" />
                ) : (
                  step.id
                )}
              </div>
              <span className="mt-1 text-[10px] font-medium text-gray-500">
                {step.name}
              </span>
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 p-6 pt-0 sm:p-6">
        {contextError && (
          <div className="mb-4 flex items-center gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{contextError}</p>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {/* STEP 1: ACCOUNT */}
          {currentStep === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 space-y-3 duration-300">
              <div className="space-y-0.5">
                <Label htmlFor="username" className="text-sm">
                  Username
                </Label>
                <Input
                  id="username"
                  placeholder="Choose a username"
                  className="h-9"
                  {...register('username')}
                />
                {errors.username && (
                  <p className="text-xs text-red-500">
                    {errors.username.message}
                  </p>
                )}
              </div>
              <div className="space-y-0.5">
                <Label htmlFor="email" className="text-sm">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="h-9"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>
              {/* Password Fields ... (Keeping your original logic here) */}
              <div className="space-y-0.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="h-9"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-2.5 right-3 text-gray-400"
                  >
                    {showPassword ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div className="space-y-0.5">
                <Label htmlFor="confirmPassword">Confirm</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="h-9"
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute top-2.5 right-3 text-gray-400"
                  >
                    {showConfirmPassword ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: PERSONAL */}
          {currentStep === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 space-y-3 duration-300">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <Label className="text-xs">First Name</Label>
                  <Input
                    placeholder="John"
                    className="h-9"
                    {...register('firstName')}
                  />
                  {errors.firstName && (
                    <p className="text-xs text-red-500">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-0.5">
                  <Label className="text-xs">Last Name</Label>
                  <Input
                    placeholder="Doe"
                    className="h-9"
                    {...register('lastName')}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-red-500">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-0.5">
                <Label className="text-xs">Date of Birth</Label>
                <Input type="date" className="h-9" {...register('dob')} />
                {errors.dob && (
                  <p className="text-xs text-red-500">{errors.dob.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <Label className="text-xs">Phone</Label>
                  <Input
                    placeholder="081-xxx-xxxx"
                    className="h-9"
                    {...register('phone')}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-500">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
                <div className="space-y-0.5">
                  <Label className="text-xs">Emergency</Label>
                  <Input
                    placeholder="Optional"
                    className="h-9"
                    {...register('emergencyContact')}
                  />
                </div>
              </div>

              {/* Simple Radio Group for Gender */}
              <div className="space-y-1">
                <Label className="text-xs">Gender</Label>
                <div className="flex gap-4 text-sm">
                  {['male', 'female', 'other'].map((g) => (
                    <label
                      key={g}
                      className="flex cursor-pointer items-center gap-1"
                    >
                      <input
                        type="radio"
                        value={g}
                        {...register('gender')}
                        className="accent-sky-500"
                      />
                      <span className="capitalize">{g}</span>
                    </label>
                  ))}
                </div>
                {errors.gender && (
                  <p className="text-xs text-red-500">
                    {errors.gender.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: ADDRESS */}
          {currentStep === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 space-y-3 duration-300">
              <div className="space-y-0.5">
                <Label className="text-xs">Address Line</Label>
                <Input
                  placeholder="123 Main St"
                  className="h-9"
                  {...register('addressLine')}
                />
                {errors.addressLine && (
                  <p className="text-xs text-red-500">
                    {errors.addressLine.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <Label className="text-xs">Sub-district</Label>
                  <Input className="h-9" {...register('subDistrict')} />
                </div>
                <div className="space-y-0.5">
                  <Label className="text-xs">District</Label>
                  <Input className="h-9" {...register('district')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <Label className="text-xs">Province</Label>
                  <Input className="h-9" {...register('province')} />
                </div>
                <div className="space-y-0.5">
                  <Label className="text-xs">Postal Code</Label>
                  <Input className="h-9" {...register('postalCode')} />
                  {errors.postalCode && (
                    <p className="text-xs text-red-500">
                      {errors.postalCode.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* BUTTON ACTIONS */}
          <div className="flex gap-2 pt-2">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="w-1/3 text-xs"
                disabled={isPending}
              >
                Back
              </Button>
            )}

            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="flex-1 bg-sky-400 text-white hover:bg-sky-500"
                disabled={isPending}
              >
                Step {currentStep + 1}: {STEPS[currentStep].name} &rarr;
              </Button>
            ) : (
              <Button
                type="submit"
                className="flex-1 bg-sky-400 text-white hover:bg-sky-500"
                disabled={isPending}
              >
                {isPending ? 'Registering...' : 'Sign Up'}
              </Button>
            )}
          </div>
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
