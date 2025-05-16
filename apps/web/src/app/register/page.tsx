"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Box, TextField, Button, Typography, Container, Paper, InputAdornment, IconButton, Grid, Alert, CircularProgress } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const Register: React.FC = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        name: "",
        phone: "",
        taxVat: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<{
        success: boolean;
        message: string;
    } | null>(null);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitStatus(null);
        setIsLoading(true);
        // TODO: Add registration logic here
        // Add 2 seconds loading animation
        // print a message to the user at the interface frontend for the user to see
        // after 2 seconds, redirect to the login page
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // On success
            setSubmitStatus({
                success: true,
                message: 'Registration successful! Welcome. Sit tight while we redirect you to login page...'
            });
            
            // Redirect after showing success message
            setTimeout(() => {
                router.push("/login");
            }, 2500);
            
        } catch (error) {
            setSubmitStatus({
                success: false,
                message: 'Registration failed. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Container component="main" maxWidth="md">
            <Box
                sx={{
                    marginY: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper 
                    elevation={3} 
                    sx={{ 
                        p: { xs: 3, md: 4 },
                        width: '100%',
                        borderRadius: 2,
                        backgroundColor: 'background.paper',
                    }}
                >
                    <Typography component="h1" variant="h4" align="center" color="primary" gutterBottom>
                        Create Your Account
                    </Typography>

                    {/* Status Message */}
                    {submitStatus && (
                        <Alert 
                            severity={submitStatus.success ? 'success' : 'error'}
                            sx={{ mb: 2 }}
                        >
                            {submitStatus.message}
                        </Alert>
                    )}

                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
                        Sell more, make your client's life easier with Woovi!
                    </Typography>

                    {/* Loading Animation */}
                    {isLoading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2 }}>
                            <CircularProgress />
                        </Box>
                    )}
                    
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="name"
                                    label="Full Name"
                                    name="name"
                                    autoComplete="name"
                                    autoFocus
                                    value={formData.name}
                                    onChange={handleChange}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email Address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    autoComplete="new-password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    variant="outlined"
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
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="phone"
                                    label="Phone Number"
                                    name="phone"
                                    type="tel"
                                    autoComplete="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    variant="outlined"
                                    placeholder="(DDD) 00000-0000"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="taxVat"
                                    label="CPF/CNPJ"
                                    name="taxVat"
                                    value={formData.taxVat}
                                    onChange={handleChange}
                                    variant="outlined"
                                    placeholder="000.000.000-00"
                                />
                            </Grid>
                        </Grid>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
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
                            Create Account
                        </Button>
                        
                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Already have an account?{' '}
                                <Link 
                                    href="/login" 
                                    style={{ 
                                        color: '#03d69d',
                                        textDecoration: 'none',
                                        fontWeight: 500,
                                        '&:hover': {
                                            textDecoration: 'underline',
                                        }
                                    }}
                                >
                                    Sign in
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default Register;
