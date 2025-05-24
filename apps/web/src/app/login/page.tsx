"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from 'react-relay';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { LOGIN_MUTATION } from './LoginMutation';
import type { LoginMutation } from '../../__generated__/LoginMutation.graphql';
import { authStore } from '../../lib/auth-store';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

// Shadcn UI Components
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Label } from '../../components/ui/label';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
    const router = useRouter();
    const [commitLogin, isPending] = useMutation<LoginMutation>(LOGIN_MUTATION);

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = (data: LoginFormData) => {
        setError(null);
        commitLogin({
            variables: {
                input: {
                    email: data.email,
                    password: data.password
                }
            },
            onCompleted: (response, errors) => {
                if (errors) {
                    setError('⚠️ Invalid email or password');
                    return;
                }
                if (response.login?.token) {
                    authStore.setState({
                        token: response.login.token,
                        user: response.login.account,
                    });
                    // localStorage.setItem('token', response.login.token);
                    router.push('/dashboard');
                }
            },
            onError: (error) => {
                console.error('Login error:', error);
                if (error.message?.includes('Invalid credentials')) {
                    setError('⚠️ Invalid email or password');
                } else {
                    setError('⚠️ An error occurred during login. Please try again.');
                }
            },
        });
    };
    return (
        <div className="flex justify-center items-center min-h-screen p-4">
            <Card className="w-full max-w-md shadow-lg border-0 rounded-xl overflow-hidden">
                <div className="h-2 w-full bg-gradient-to-r from-[#03d69d] to-[#02b987]"></div>
                
                <CardHeader className="pt-6 pb-2">
                    <h1 className="text-2xl font-bold text-center text-[#03d69d]">Welcome Back</h1>
                    <p className="text-sm text-center text-gray-500 mt-1">
                        Sign in to your Woovi account
                    </p>
                </CardHeader>
                
                <CardContent className="px-6 pb-6 space-y-4">
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">
                                Email Address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="your@email.com"
                                autoComplete="email"
                                autoFocus
                                disabled={isSubmitting}
                                {...register('email')}
                                className={errors.email ? 'border-red-500' : ''}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email.message}</p>
                            )}
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium">
                                Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    disabled={isSubmitting}
                                    {...register('password')}
                                    className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-sm text-red-500">{errors.password.message}</p>
                            )}
                        </div>
                        
                        <Button
                            type="submit"
                            disabled={isSubmitting || isPending}
                            className="w-full bg-gradient-to-r from-[#03d69d] to-[#02b987] text-white font-medium hover:shadow-lg transition-all duration-200 py-5 rounded-full mt-4"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                        
                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Don't have an account?{' '}
                                <Link 
                                    href="/register" 
                                    className="text-[#03d69d] font-medium hover:underline"
                                >
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Login;