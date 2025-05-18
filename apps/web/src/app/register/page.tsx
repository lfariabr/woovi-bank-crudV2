'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, TextField, Button, Typography, Container, Paper } from '@mui/material';
import { useRelayEnvironment } from 'react-relay';
import { commitRegisterMutation } from './user_register_mutation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

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
  const environment = useRelayEnvironment();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    try {
      const response = await commitRegisterMutation(environment, data) as any;
      if (response?.register?.token) {
        localStorage.setItem('token', response.register.token);
        router.push('/dashboard');
      } else {
        setError('Registration failed. Please check your details.');
      }
    } catch (err) {
      setError('An error occurred during registration. Please try again.');
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