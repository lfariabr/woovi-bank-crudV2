'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { createEnvironment } from '../../relay/environment';
import { sendTransaction } from '../../app/transactions/SendTransactionMutation';
import { useRouter } from 'next/navigation';

// Shadcn UI and Enhanced select
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { EnhancedSelect } from '../ui/enhanced-select';
import { SelectItem, SelectLabel, SelectGroup } from '../ui/select';

type Account = {
  id: string;
  first_name?: string;
  last_name?: string;
  balance: { toString: () => string };
};

type SendTransactionFormProps = {
  accounts: Array<{ node: Account }>;
  currentUserAccountId: string;
  preSelectedSenderId?: string | null;
  onTransactionComplete?: () => void;
};

export function SendTransactionForm({
  accounts,
  currentUserAccountId,
  preSelectedSenderId,
  onTransactionComplete,
}: SendTransactionFormProps) {
  const router = useRouter();
  const environment = createEnvironment();

  const [receiverAccountId, setReceiverAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [senderAccountId, setSenderAccountId] = useState('');

  // Initialize sender on mount/update
  useEffect(() => {
    const target = preSelectedSenderId || currentUserAccountId;
    const userAcc = accounts.find(a => a.node.id === target);
    if (userAcc) setSenderAccountId(userAcc.node.id);
  }, [accounts, currentUserAccountId, preSelectedSenderId]);

  const otherAccounts = accounts.filter(a => a.node.id !== senderAccountId);
  const userAccount = accounts.find(a => a.node.id === senderAccountId)?.node;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!senderAccountId) return setError('Sender account not found');
    if (!receiverAccountId) return setError('Please select a receiver account');
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0)
      return setError('Please enter a valid amount greater than 0');

    const balance = parseFloat(userAccount?.balance.toString() || '0');
    if (Number(amount) > balance)
      return setError('Insufficient funds for this transaction');

    setLoading(true);
    sendTransaction(
      environment,
      senderAccountId,
      receiverAccountId,
      Number(amount),
      () => {
        setLoading(false);
        setSuccess(true);
        setAmount('');
        setReceiverAccountId('');
        setTimeout(() => {
          setSuccess(false);
          onTransactionComplete?.();
        }, 2000);
      },
      err => {
        setLoading(false);
        setError(err.message || 'Transaction failed');
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive" className="border-2 animate-in fade-in-50 duration-300">
          <AlertDescription className="font-medium">{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="bg-green-50 border-2 border-[#03d69d]/30 text-[#03d69d] animate-in fade-in-50 duration-300">
          <AlertDescription className="font-medium">Transaction successful!</AlertDescription>
        </Alert>
      )}

      {/* User Account Card */}
      {userAccount ? (
        <Card className="border-2 hover:border-[#03d69d] rounded-xl shadow transition-all duration-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#03d69d] to-[#02b987] p-3">
            <h3 className="text-white font-semibold px-1">
              {`${userAccount.first_name || ''} ${userAccount.last_name || ''}`}
            </h3>
          </div>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Balance:</span>
              <span className="bg-[#edfdf9] text-[#03d69d] font-bold px-4 py-1.5 rounded-full">
                ${parseFloat(userAccount.balance.toString()).toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex items-center justify-center p-6 bg-gray-50 rounded-xl border-2 border-gray-100">
          <Loader2 className="animate-spin text-[#03d69d] mr-2 h-5 w-5" />
          <span className="text-gray-500 font-medium">Loading your account...</span>
        </div>
      )}

      {/* Receiver Select */}
      <div className="space-y-2">
        <label htmlFor="receiver-account" className="text-sm font-medium text-[#03d69d]">
          Receiver Account
        </label>
        <EnhancedSelect
          id="receiver-account"
          placeholder="Select account"
          value={receiverAccountId}
          onValueChange={setReceiverAccountId}
          disabled={loading || success}
          className="w-full"
          contentClassName="w-full"
        >
          <SelectGroup>
            <SelectLabel>Accounts</SelectLabel>
            {otherAccounts.length ? (
              otherAccounts.map(acc => (
                <SelectItem key={acc.node.id} value={acc.node.id}>
                  {`${acc.node.first_name || ''} ${acc.node.last_name || ''} - $${parseFloat(acc.node.balance.toString()).toFixed(2)}`}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="" disabled>
                No other accounts
              </SelectItem>
            )}
          </SelectGroup>
        </EnhancedSelect>
      </div>

      {/* Amount Input */}
      <div className="space-y-2">
        <label htmlFor="amount" className="text-sm font-medium text-[#03d69d]">Amount</label>
        <Input
          id="amount"
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          min={0.01}
          step={0.01}
          disabled={loading || success}
          placeholder="0.00"
          className="pl-8"
          prefix="$"
        />
        <p className="text-xs text-gray-500">Enter amount in dollars</p>
      </div>

      {/* Actions */}
      <div className="flex justify-between mt-8">
        <Button 
          variant="outline" 
          onClick={() => { setAmount(''); setReceiverAccountId(''); setError(''); setSuccess(false); }} 
          disabled={loading}
          className="border-2 hover:border-gray-300 rounded-full px-6 transition-all duration-200"
        >
          Reset
        </Button>
        <Button 
          type="submit" 
          disabled={loading || success || !senderAccountId} 
          className="flex items-center bg-gradient-to-r from-[#03d69d] to-[#02b987] text-white font-medium hover:shadow-lg transition-all duration-200 rounded-full px-6"
        >
          {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
          {loading ? 'Processing...' : 'Send Money'}
        </Button>
      </div>
    </form>
  );
}