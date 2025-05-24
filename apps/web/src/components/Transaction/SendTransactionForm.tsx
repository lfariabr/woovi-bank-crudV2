'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { createEnvironment } from '../../relay/environment';
import { sendTransaction } from '../../app/transactions/SendTransactionMutation';
import { useRouter } from 'next/navigation';

// Import Shadcn UI components
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

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
    <form onSubmit={handleSubmit} className="mt-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" className="mb-4">
          <AlertDescription>Transaction successful!</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Your Account</h3>
          {userAccount ? (
            <Card className="mt-2">
              <CardContent className="pt-4">
                <p className="mb-1">
                  <strong>Name:</strong> {`${userAccount.first_name || ''} ${userAccount.last_name || ''}`}
                </p>
                <p>
                  <strong>Balance:</strong> ${userAccount.balance?.toString ? parseFloat(userAccount.balance.toString()).toFixed(2) : '0.00'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <p className="text-muted-foreground">Loading your account...</p>
          )}
        </div>
        
        <div className="space-y-2">
          <label htmlFor="receiver-account" className="text-sm font-medium">Receiver Account</label>
          <Select
            value={receiverAccountId}
            onValueChange={setReceiverAccountId}
            disabled={loading || success}
          >
            <SelectTrigger id="receiver-account" className="w-full">
              <SelectValue placeholder="Select a receiver account" />
            </SelectTrigger>
            <SelectContent>
              {otherAccounts.length > 0 ? (
                otherAccounts.map(account => 
                  account?.node ? (
                    <SelectItem key={account.node.id} value={account.node.id}>
                      {`${account.node.first_name || ''} ${account.node.last_name || ''}`} - ${account.node.balance?.toString ? parseFloat(account.node.balance.toString()).toFixed(2) : '0.00'}
                    </SelectItem>
                  ) : null
                )
              ) : (
                <SelectItem disabled value="">No other accounts available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="amount" className="text-sm font-medium">Amount</label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0.01"
            step="0.01"
            disabled={loading || success}
            required
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">Enter amount in dollars</p>
        </div>
      </div>
      
      <div className="flex justify-between mt-8">
        <Button
          type="button"
          variant="outline"
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
          disabled={loading || success || !senderAccountId}
          className="flex items-center"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? 'Processing...' : 'Send Money'}
        </Button>
      </div>
    </form>
  );
}
