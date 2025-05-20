'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, TextField, Button, Typography, Container, Paper } from '@mui/material';
import { useMutation } from 'react-relay';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { REGISTER_MUTATION } from './RegisterMutation';
import type { RegisterMutation } from '../../__generated__/RegisterMutation.graphql';

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
    
    // Default error message
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
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
          <Typography component="h1" variant="h4" align="center" color="primary" gutterBottom>
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
            Register for a new Woovi account
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
              type="password"
              id="password"
              autoComplete="new-password"
              error={!!errors.password}
              helperText={errors.password?.message}
              disabled={isSubmitting}
              {...register('password')}
            />
            <TextField
              margin="normal"
              fullWidth
              label="First Name"
              id="first_name"
              error={!!errors.first_name}
              helperText={errors.first_name?.message}
              disabled={isSubmitting}
              {...register('first_name')}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Last Name"
              id="last_name"
              error={!!errors.last_name}
              helperText={errors.last_name?.message}
              disabled={isSubmitting}
              {...register('last_name')}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Tax ID"
              id="taxId"
              error={!!errors.taxId}
              helperText={errors.taxId?.message}
              disabled={isSubmitting}
              {...register('taxId')}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Account ID"
              id="accountId"
              error={!!errors.accountId}
              helperText={errors.accountId?.message}
              disabled={isSubmitting}
              {...register('accountId')}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
              sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 1, textTransform: 'none', fontSize: '1rem', fontWeight: 500 }}
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;