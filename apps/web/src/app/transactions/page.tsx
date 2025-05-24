'use client';
import React, { useState, Suspense, useEffect } from 'react';
import { usePreloadedQuery, useQueryLoader } from 'react-relay';
import { graphql } from 'react-relay';
import { Loader2 } from 'lucide-react';

// Shadcn UI Components
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

import { authStore } from '../../lib/auth-store';
import { TransactionsList } from '../../components/Transaction/TransactionsList';
import { SendTransactionForm } from '../../components/Transaction/SendTransactionForm';
import type { TransactionsQuery as TransactionsQueryType } from '../../__generated__/TransactionsQuery.graphql';
import type { AccountsQuery as AccountsQueryType } from '../../__generated__/AccountsQuery.graphql';
import { TRANSACTIONS_QUERY } from './TransactionsQuery';
import { ACCOUNTS_QUERY } from './AccountsQuery';
// Refactoring to use Shadcn UI components instead of inline styles
type TransactionsPageProps = {
  currentUserAccountId: string;
  account_id_sender?: string;
  account_id_receiver?: string;
  amount?: number;
};

const TransactionsPage: React.FC<TransactionsPageProps> = ({
  currentUserAccountId,
  account_id_sender,
  account_id_receiver,
  amount
}) => {
  const { user, token } = authStore.getState();
  const [transactionsQueryRef, loadTransactionsQuery] = useQueryLoader<TransactionsQueryType>(TRANSACTIONS_QUERY);
  const [accountsQueryRef, loadAccountsQuery] = useQueryLoader<AccountsQueryType>(ACCOUNTS_QUERY);
  const [cursor, setCursor] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  const handleTabChange = (_event: React.SyntheticEvent | null, newValue: number) => {
    setActiveTab(newValue);
    
    // When switching to send money tab, we ensure accounts are loaded
    if (newValue === 1 && !accountsQueryRef && token) {
      loadAccountsData();
    }
  };

  // Getting URL parameters after client-side rendering
  useEffect(() => {
    setIsClient(true);
    
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('activeTab');
      
      // Set active tab if specified in URL
      if (tabParam && !isNaN(Number(tabParam))) {
        setActiveTab(Number(tabParam));
        
        // To load accounts data if navigating directly to send money tab
        if (Number(tabParam) === 1 && !accountsQueryRef) {
          loadAccountsData();
        }
      }
    }
  }, []);
  
  // Function to load transaction data
  const loadTransactionData = () => {
    if (token && user?.id) {
      try {
        loadTransactionsQuery({ 
          first: 3, 
          after: cursor,
          account_id_sender: user.id,
          account_id_receiver: user.id, 
          amount: amount && amount > 0 ? amount : null
        });
      } catch (error) {
        console.error("Error loading transactions query:", error);
      }
    }
  };
  
  // Function to load account data
  const loadAccountsData = () => {
    if (token) {
      try {
        loadAccountsQuery({ 
          first: 10, 
          after: null
        });
        
        // If we're on the send money tab, check for a pre-selected sender account
        if (typeof window !== 'undefined' && activeTab === 1) {
          const params = new URLSearchParams(window.location.search);
          const senderIdParam = params.get('senderId');
          
          if (senderIdParam) {
            // We'll pass this to the SendTransactionContent component
          }
        }
      } catch (error) {
        console.error("Error loading accounts query:", error);
      }
    }
  };

  // Load data on initial render and when dependencies change
  useEffect(() => {
    if (token && user?.id) {
      loadTransactionData();
    }
  }, [token, user, cursor, amount]);

  // Helper component for loading state
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-[#03d69d]" />
    </div>
  );

  if (!isClient) {
    return (
      <div className="container max-w-3xl mx-auto p-6">
        <div className="min-h-[50vh] flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!user || !token) {
    return (
      <div className="container max-w-3xl mx-auto p-6">
        <Card className="w-full shadow-md">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-center">
              Please log in to view your account
            </h3>
            <div className="flex justify-center mt-4">
              <Button 
                onClick={() => window.location.href = '/'}
                className="bg-gradient-to-r from-[#03d69d] to-[#02b987] text-white"
              >
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6 text-[#03d69d] text-center">
        Transactions
      </h1>
      
      <Tabs 
        value={activeTab.toString()} 
        onValueChange={(value) => handleTabChange(null, parseInt(value))} 
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger 
            value="0" 
            className="data-[state=active]:bg-white data-[state=active]:text-[#03d69d] data-[state=active]:font-semibold"
          >
            Transaction History
          </TabsTrigger>
          <TabsTrigger 
            value="1" 
            className="data-[state=active]:bg-white data-[state=active]:text-[#03d69d] data-[state=active]:font-semibold"
          >
            Send Money
          </TabsTrigger>
        </TabsList>
        
        {/* Transaction History Tab */}
        <TabsContent value="0" className="mt-0">
          <Card>
            <CardHeader className="pb-3">
              <h2 className="text-xl font-semibold text-[#03d69d]">Transaction History</h2>
            </CardHeader>
            <CardContent>
              {transactionsQueryRef ? (
                <Suspense fallback={<LoadingSpinner />}>
                  <TransactionContent queryRef={transactionsQueryRef} currentUserAccountId={user.id} />
                </Suspense>
              ) : (
                <LoadingSpinner />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Send Money Tab */}
        <TabsContent value="1" className="mt-0">
          <Card>
            <CardHeader className="pb-3">
              <h2 className="text-xl font-semibold text-[#03d69d]">Send Money</h2>
            </CardHeader>
            <CardContent>
              {!accountsQueryRef ? (
                <div className="flex justify-center py-4">
                  <Button 
                    onClick={loadAccountsData}
                    className="bg-gradient-to-r from-[#03d69d] to-[#02b987] text-white font-medium hover:shadow-lg transition-all duration-200 rounded-full px-6 py-2 flex items-center"
                  >
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Load Accounts
                  </Button>
                </div>
              ) : (
                <Suspense fallback={<LoadingSpinner />}>
                  <SendTransactionContent 
                    queryRef={accountsQueryRef} 
                    currentUserAccountId={user.id}
                    preSelectedSenderId={typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('senderId') : null}
                    onComplete={() => {
                      // Reload data after transaction
                      loadTransactionData();
                      // Reset tab to transaction history
                      setActiveTab(0);
                    }}
                  />
                </Suspense>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Separate component for transaction content using Suspense
function TransactionContent({ 
  queryRef, 
  currentUserAccountId 
}: { 
  queryRef: any; 
  currentUserAccountId: string;
}) {
  const data = usePreloadedQuery<TransactionsQueryType>(TRANSACTIONS_QUERY, queryRef);

  if (!data) {
    console.error("usePreloadedQuery returned null or undefined data in TransactionContent");
    return (
      <div className="text-center text-gray-600 py-4">
        <p>Error: No transaction data available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <TransactionsList 
        query={data} 
        currentUserAccountId={currentUserAccountId} 
        account_id_sender={currentUserAccountId}
        account_id_receiver=""
        amount={0}
      />
    </div>
  );
}

// Send Transaction Content component
function SendTransactionContent({ 
  queryRef, 
  currentUserAccountId,
  preSelectedSenderId,
  onComplete
}: { 
  queryRef: any; 
  currentUserAccountId: string;
  preSelectedSenderId: string | null;
  onComplete?: () => void;
}) {
  const data = usePreloadedQuery<AccountsQueryType>(ACCOUNTS_QUERY, queryRef);

  if (!data) {
    console.error("usePreloadedQuery returned null or undefined data in SendTransactionContent");
    return (
      <div className="text-center text-gray-600 py-4">Error: No data loaded.</div>
    );
  }
  
  // Extract accounts from data and convert to the expected format
  const accountEdges = data.accounts?.edges || [];
  // Convert readonly array to mutable array with the expected Account type
  const accounts = accountEdges.map(edge => ({
    node: {
      id: edge?.node?.id || '',
      first_name: edge?.node?.first_name || '',
      last_name: edge?.node?.last_name || '',
      balance: {
        toString: () => edge?.node?.balance?.toString() || '0'
      }
    }
  }));
  
  return (
    <SendTransactionForm 
      accounts={accounts}
      currentUserAccountId={currentUserAccountId}
      preSelectedSenderId={preSelectedSenderId}
      onTransactionComplete={onComplete}
    />
  );
}

export default TransactionsPage;
