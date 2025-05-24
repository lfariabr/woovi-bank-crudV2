'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import { createEnvironment } from '../../relay/environment';
import { sendTransaction } from '../../app/transactions/SendTransactionMutation';
import { useRouter } from 'next/navigation';

type Account = {
  id: string;
  first_name?: string;
  last_name?: string;
  balance: {
    toString: () => string;
  };
};

type SendTransactionFormProps = {
  accounts: Array<{
    node: Account;
  }>;
  currentUserAccountId: string;
  preSelectedSenderId?: string | null;
  onTransactionComplete?: () => void;
};

export function SendTransactionForm({
  accounts,
  currentUserAccountId,
  preSelectedSenderId,
  onTransactionComplete
}: SendTransactionFormProps) {
  const router = useRouter();
  const environment = createEnvironment();
  
  const [receiverAccountId, setReceiverAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [senderAccountId, setSenderAccountId] = useState('');

  // Find user account ID - use preSelectedSenderId if provided, otherwise use currentUserAccountId
  useEffect(() => {
    if (accounts?.length > 0) {
      let targetId = currentUserAccountId;
      
      // If preSelectedSenderId is provided, use that instead
      if (preSelectedSenderId) {
        targetId = preSelectedSenderId;
      }
      
      const userAccount = accounts.find(
        account => account?.node?.id === targetId
      );
      
      if (userAccount?.node) {
        setSenderAccountId(userAccount.node.id);
      }
    }
  }, [accounts, currentUserAccountId, preSelectedSenderId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!senderAccountId) {
      setError('Sender account not found');
      return;
    }
    
    if (!receiverAccountId) {
      setError('Please select a receiver account');
      return;
    }
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }
    
    setLoading(true);
    
    try {
      sendTransaction(
        environment,
        senderAccountId,
        receiverAccountId,
        Number(amount),
        (response) => {
          console.log('Transaction completed successfully:', response);
          setLoading(false);
          setSuccess(true);
          // Reset form
          setAmount('');
          setReceiverAccountId('');
          
          setTimeout(() => {
            setSuccess(false);
            if (onTransactionComplete) {
              onTransactionComplete();
            }
          }, 2000);
        },
        (error) => {
          console.error('Transaction error:', error);
          setLoading(false);
          setError(error.message || 'Transaction failed');
        }
      );
    } catch (err) {
      console.error('Error sending transaction:', err);
      setLoading(false);
      setError('Failed to process transaction');
    }
  };

  // Get list of accounts excluding the user's own account
  const otherAccounts = accounts?.filter(
    account => account?.node?.id !== senderAccountId
  ) || [];

  const userAccount = accounts?.find(
    account => account?.node?.id === senderAccountId
  )?.node;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Transaction successful!
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6">Your Account</Typography>
          {userAccount ? (
            <Paper sx={{ p: 2, mt: 1 }}>
              <Typography variant="body1">
                <strong>Name:</strong> {`${userAccount.first_name || ''} ${userAccount.last_name || ''}`}
              </Typography>
              <Typography variant="body1">
                <strong>Balance:</strong> ${userAccount.balance?.toString ? parseFloat(userAccount.balance.toString()).toFixed(2) : '0.00'}
              </Typography>
            </Paper>
          ) : (
            <Typography color="text.secondary">Loading your account...</Typography>
          )}
        </Grid>
        
        <Grid item xs={12}>
          <FormControl fullWidth required>
            <InputLabel id="receiver-account-label">Receiver Account</InputLabel>
            <Select
              labelId="receiver-account-label"
              value={receiverAccountId}
              onChange={(e) => setReceiverAccountId(e.target.value)}
              label="Receiver Account"
              disabled={loading || success}
            >
              {otherAccounts.length > 0 ? (
                otherAccounts.map(account => 
                  account?.node ? (
                    <MenuItem key={account.node.id} value={account.node.id}>
                      {`${account.node.first_name || ''} ${account.node.last_name || ''}`} - ${account.node.balance?.toString ? parseFloat(account.node.balance.toString()).toFixed(2) : '0.00'}
                    </MenuItem>
                  ) : null
                )
              ) : (
                <MenuItem disabled value="">No other accounts available</MenuItem>
              )}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            label="Amount"
            type="number"
            fullWidth
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputProps={{ min: "0.01", step: "0.01" }}
            disabled={loading || success}
            helperText="Enter amount in dollars"
          />
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          type="button"
          variant="outlined"
          onClick={() => {
            setAmount('');
            setReceiverAccountId('');
            setError('');
            setSuccess(false);
          }}
          disabled={loading}
        >
          Reset
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading || success || !senderAccountId}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Processing...' : 'Send Money'}
        </Button>
      </Box>
    </Box>
  );
}
