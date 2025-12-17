import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.email('Invalid email address').min(1, 'Email is required'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export const RegisterSchema = z
  .object({
    username: z
      .string()
      .min(1, 'Username is required')
      .min(3, 'Username must be at least 3 characters')
      .max(32, 'Username must be less than 32 characters')
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        'Username can only contain letters, numbers, underscores, and hyphens'
      ),
    email: z.email('Invalid email address').min(1, 'Email is required'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),

    firstName: z.string().min(1, 'First name required'),
    lastName: z.string().min(1, 'Last name required'),
    dob: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
    phone: z.string().optional(),
    emergencyContact: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']),

    addressLine: z.string().min(1, 'Address required'),
    subDistrict: z.string().optional(),
    district: z.string().optional(),
    province: z.string().optional(),
    postalCode: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type LoginFormData = z.infer<typeof LoginSchema>;
export type RegisterFormData = z.infer<typeof RegisterSchema>;
