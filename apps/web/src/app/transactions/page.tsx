'use client';
import React, { useState, Suspense, useEffect } from 'react';
import { Box, Typography, Paper, Container, Grid, Divider, CircularProgress, Tab, Tabs, Button } from '@mui/material';
import { usePreloadedQuery, useQueryLoader } from 'react-relay';
import { graphql } from 'react-relay';

import { authStore } from '../../lib/auth-store';
import { TransactionsList } from '../../components/Transaction/TransactionsList';
import { SendTransactionForm } from '../../components/Transaction/SendTransactionForm';
import type { TransactionsQuery as TransactionsQueryType } from '../../__generated__/TransactionsQuery.graphql';
import type { AccountsQuery as AccountsQueryType } from '../../__generated__/AccountsQuery.graphql';
import { TRANSACTIONS_QUERY } from './TransactionsQuery';
import { ACCOUNTS_QUERY } from './AccountsQuery';

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
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
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

  if (!isClient) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ height: '100vh' }} />
      </Container>
    );
  }

  if (!user || !token) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" align="center">
            Please log in to view transactions
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Transactions
      </Typography>
      
      <Paper sx={{ mb: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="transaction tabs" variant="fullWidth">
          <Tab label="Transaction History" />
          <Tab label="Send Money" />
        </Tabs>
      </Paper>

      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            {activeTab === 0 ? (
              <>
                <Typography variant="h6" gutterBottom>
                  Transaction History
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {transactionsQueryRef ? (
                  <Suspense fallback={
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <CircularProgress />
                    </Box>
                  }>
                    <TransactionContent queryRef={transactionsQueryRef} currentUserAccountId={user.id} />
                  </Suspense>
                ) : (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <CircularProgress />
                  </Box>
                )}
              </>
            ) : (
              <>
                <Typography variant="h6" gutterBottom>
                  Send Money
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {!accountsQueryRef ? (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Button 
                      variant="contained" 
                      onClick={loadAccountsData}
                      startIcon={<CircularProgress size={20} />}
                    >
                      Load Accounts
                    </Button>
                  </Box>
                ) : (
                  <Suspense fallback={
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <CircularProgress />
                    </Box>
                  }>
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
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
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
    return <Typography>Error: No data loaded.</Typography>;
  }

  return (
    <TransactionsList 
      query={data} 
      currentUserAccountId={currentUserAccountId} 
      account_id_sender={currentUserAccountId}
      account_id_receiver=""
      amount={0}
    />
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
    return <Typography>Error: No data loaded.</Typography>;
  }
  
  // Extract accounts from data
  const accounts = data.accounts?.edges || [];
  
  return (
    <SendTransactionForm 
      accounts={accounts}
      currentUserAccountId={currentUserAccountId}
      onTransactionComplete={onComplete}
    />
  );
}

export default TransactionsPage;
