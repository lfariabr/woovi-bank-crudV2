'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from 'react-relay';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { REGISTER_MUTATION } from './RegisterMutation';
import type { RegisterMutation } from '../../__generated__/RegisterMutation.graphql';

// Import shadcn UI components
import { Card, CardHeader, CardContent, CardFooter } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  taxId: z.string().min(1, 'Tax ID is required'),
  accountId: z.string().min(1, 'Account ID is required'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const router = useRouter();
  const [commitRegister, isPending] = useMutation<RegisterMutation>(REGISTER_MUTATION);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const getFriendlyErrorMessage = (error: any): string => {
    const errorMessage = error?.message || '';
    if (errorMessage.includes('taxId: Please enter a valid CPF')) {
      return '⚠️ Please enter a valid CPF (Brazilian tax ID)';
    }
    if (errorMessage.includes('email_1 dup key') || errorMessage.includes('Email already in use')) {
      return '⚠️ This email is already registered. Please use a different email or log in.';
    }
    if (errorMessage.includes('taxId_1 dup key') || errorMessage.includes('CPF already in use')) {
      return '⚠️ This CPF is already registered. Please check your details or contact support.';
    }
    if (errorMessage.includes('accountId_1 dup key') || errorMessage.includes('Account ID already in use')) {
      return '⚠️ This account ID is already in use. Please try a different one.';
    }
    return '⚠️ An error occurred during registration. Please check your details and try again.';
  };

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    try {
      commitRegister({
        variables: {
          input: {
            email: data.email,
            password: data.password,
            first_name: data.first_name,
            last_name: data.last_name,
            taxId: data.taxId,
            accountId: data.accountId,
          },
        },
        onCompleted: (response, errors) => {
          if (errors) {
            setError('Registration failed. Please check your details.');
            return;
          }
          if (response?.register?.token) {
            localStorage.setItem('token', response.register.token);
            router.push('/dashboard');
          } else {
            setError('Registration failed. Please check your details.');
          }
        },
        onError: (error) => {
          setError('Registration failed. Please check your details.');
        },
      });
    } catch (err: any) {
      const friendlyError = getFriendlyErrorMessage(err);
      setError(friendlyError);
      console.error('Register error:', err);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <h1 className="text-2xl font-bold text-center text-[#03d69d]">Create Account</h1>
          <p className="text-sm text-center text-gray-500">
            Register for a new Woovi account
          </p>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert className="mb-4 bg-red-50 text-red-600 border-red-200">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                disabled={isSubmitting}
                className={errors.email ? "border-red-300" : ""}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                disabled={isSubmitting}
                className={errors.password ? "border-red-300" : ""}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  disabled={isSubmitting}
                  className={errors.first_name ? "border-red-300" : ""}
                  {...register('first_name')}
                />
                {errors.first_name && (
                  <p className="text-sm text-red-500">{errors.first_name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  disabled={isSubmitting}
                  className={errors.last_name ? "border-red-300" : ""}
                  {...register('last_name')}
                />
                {errors.last_name && (
                  <p className="text-sm text-red-500">{errors.last_name.message}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID (CPF)</Label>
              <Input
                id="taxId"
                disabled={isSubmitting}
                className={errors.taxId ? "border-red-300" : ""}
                {...register('taxId')}
              />
              {errors.taxId && (
                <p className="text-sm text-red-500">{errors.taxId.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="accountId">Account ID</Label>
              <Input
                id="accountId"
                disabled={isSubmitting}
                className={errors.accountId ? "border-red-300" : ""}
                {...register('accountId')}
              />
              {errors.accountId && (
                <p className="text-sm text-red-500">{errors.accountId.message}</p>
              )}
            </div>
            
            <Button
              type="submit"
              variant="default"
              disabled={isSubmitting}
              className="w-full bg-[#03d69d] hover:bg-[#02b987] text-white"
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <a href="/login" className="text-[#03d69d] hover:underline">
              Sign in
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;