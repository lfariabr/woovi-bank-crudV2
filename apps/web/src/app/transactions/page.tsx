'use client';
import React, { useState, Suspense, useEffect } from 'react';
import { Box, Typography, Paper, Container, Grid, Divider, CircularProgress } from '@mui/material';
import { usePreloadedQuery, useQueryLoader } from 'react-relay';
import { graphql } from 'react-relay';

import { authStore } from '../../lib/auth-store';
import { TransactionsList } from '../../components/Transaction/TransactionsList';
import type { TransactionsQuery as TransactionsQueryType } from '../../__generated__/TransactionsQuery.graphql';
import { TRANSACTIONS_QUERY } from './TransactionsQuery';

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
  const [queryRef, loadQuery] = useQueryLoader<TransactionsQueryType>(TRANSACTIONS_QUERY);
  const [cursor, setCursor] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load transactions directly using the user.id from auth store (MongoDB ObjectId)
  useEffect(() => {
    if (token && user?.id) {
      try {
        console.log("Using user ID from auth store:", user.id);
        loadQuery({ 
          first: 3, 
          after: cursor,
          account_id_sender: user.id,  // The ID from auth store is already the MongoDB ObjectId
          account_id_receiver: user.id, 
          amount: amount && amount > 0 ? amount : null
        });
      } catch (error) {
        console.error("Error loading transactions query:", error);
      }
    } else if (token) {
      // If no user ID available, load without filters
      loadQuery({ 
        first: 3, 
        after: cursor,
        account_id_sender: null,
        account_id_receiver: null, 
        amount: amount && amount > 0 ? amount : null
      });
    }
  }, [token, loadQuery, cursor, user, amount]);

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

      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Transaction History
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {queryRef ? (
              <Suspense fallback={
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <CircularProgress />
                </Box>
              }>
                <TransactionContent queryRef={queryRef} currentUserAccountId={user.id} />
              </Suspense>
            ) : (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress />
              </Box>
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

export default TransactionsPage;
