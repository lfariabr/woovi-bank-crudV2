"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Box, TextField, Button, Typography, Container, Paper, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useMutation } from 'react-relay';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { LOGIN_MUTATION } from './LoginMutation';
import type { LoginMutation } from '../../__generated__/LoginMutation.graphql';
import { authStore } from '../../lib/auth-store';

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
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper 
                    elevation={3} 
                    sx={{ 
                        p: 4, 
                        width: '100%',
                        borderRadius: 2,
                        backgroundColor: 'background.paper',
                    }}
                >
                    <Typography component="h1" variant="h4" align="center" color="primary" gutterBottom>
                        Welcome Back
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
                        Sign in to your Woovi account
                    </Typography>
                    
                    {error && (
                        <Typography color="error" align="center" sx={{ mb: 2 }}>
                            {error}
                        </Typography>
                    )}
                    
                    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            autoComplete="email"
                            autoFocus
                            error={!!errors.email}
                            helperText={errors.email?.message}
                            disabled={isSubmitting}
                            {...register('email')}
                            variant="outlined"
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            autoComplete="current-password"
                            error={!!errors.password}
                            helperText={errors.password?.message}
                            disabled={isSubmitting}
                            {...register('password')}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={isPending}
                            sx={{ 
                                mt: 3, 
                                mb: 2,
                                py: 1.5,
                                borderRadius: 1,
                                textTransform: 'none',
                                fontSize: '1rem',
                                fontWeight: 500,
                            }}
                        >
                            {isSubmitting ? 'Signing in...' : 'Sign In'}
                        </Button>
                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Don't have an account?{' '}
                                <Link 
                                    href="/register" 
                                    style={{ 
                                        color: '#03d69d',
                                        textDecoration: 'none',
                                        fontWeight: 500,
                                    }}
                                >
                                    Sign up
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default Login;