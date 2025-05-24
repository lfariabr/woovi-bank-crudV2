'use client';
import React, { useState, Suspense, useEffect } from 'react';
import { Box, Typography, Paper, Container, Grid, Divider, CircularProgress } from '@mui/material';
import { usePreloadedQuery, useQueryLoader } from 'react-relay';
import { graphql } from 'react-relay';

import { authStore } from '../../lib/auth-store';
import { AccountList } from '../../components/Account/AccountList';
import type { AccountQuery as AccountQueryType } from '../../__generated__/AccountQuery.graphql';
import { ACCOUNT_QUERY } from './AccountQuery';
import { TransactionsList } from '../../components/Transaction/TransactionsList';


function AccountContent({ 
  queryRef, 
  currentUserAccountId 
}: { 
  queryRef: any; 
  currentUserAccountId: string;
}) {
  const data = usePreloadedQuery<AccountQueryType>(ACCOUNT_QUERY, queryRef);  
  if (!data) {
    return (
      <Typography variant="body1" align="center">
        Error: No data loaded.
      </Typography>
    );
  }
    
  return (
    <Box>
      <AccountList 
        query={data} 
        currentUserAccountId={currentUserAccountId} 
        showOnlyUserAccount={true}
      />
      <Divider sx={{ mb: 3 }} />
      <Typography variant="h6" gutterBottom>
        Transaction History
      </Typography>
      
      <TransactionsList 
        query={data} 
        currentUserAccountId={currentUserAccountId}
        amount={0}
      />
    </Box>
  );
}

type DashboardPageProps = {
    currentUserAccountId?: string;
};
    
const DashboardPage: React.FC<DashboardPageProps> = () => {
    const { user, token } = authStore.getState();
    const [queryRef, loadQuery] = useQueryLoader<AccountQueryType>(ACCOUNT_QUERY);
    const [cursor, setCursor] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);
    
    useEffect(() => {
        setIsClient(true);
    }, []);
    
    useEffect(() => {
        if (user) {
          // Used to debug dash exhibition of user account
            // console.log("AUTH USER OBJECT:", JSON.stringify(user, null, 2));
        }
    }, [user]);

    useEffect(() => {
        if (token && user?.id) {
            try {                loadQuery({ 
                    first: 3, 
                    after: cursor,
                    account_id_sender: user.id,
                    account_id_receiver: user.id,
                    amount: null
                });
            } catch (error) {
                console.error("Error loading account query:", error);
            }
        }
    }, [token, loadQuery, cursor, user]);
    
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
                        Please log in to view your account
                    </Typography>
                </Paper>
            </Container>
        );
    }
    
    const userAccountId = user.id || "";
    
    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h5" align="center" gutterBottom>
                    Account Dashboard
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                {queryRef ? (
                  <Suspense fallback={
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <CircularProgress />
                    </Box>
                  }>
                    <AccountContent 
                      queryRef={queryRef} 
                      currentUserAccountId={userAccountId}
                    />
                  </Suspense>
                ) : (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <CircularProgress />
                  </Box>
                )}
            </Paper>
        </Container>
    );
};
        
export default DashboardPage;