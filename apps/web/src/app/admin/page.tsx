'use client';
import React, { useState, Suspense, useEffect } from 'react';
import { Box, Typography, Paper, Container, Grid, Divider, CircularProgress } from '@mui/material';
import { usePreloadedQuery, useQueryLoader } from 'react-relay';
import { graphql } from 'react-relay';

import { authStore } from '../../lib/auth-store';
import { AllAccountsList } from '../../components/Account/AllAccountsList';
import type { AccountQuery as AccountQueryType } from '../../__generated__/AccountQuery.graphql';
import { AllAccountsQuery as AllAccountsQueryType } from './AllAccountsQuery';
import type { AllAccountsQuery as AllAccountsQueryRefType } from '../../__generated__/AllAccountsQuery.graphql';

// Separate component for account content using Suspense
function AccountContent({ 
  queryRef, 
  currentUserAccountId 
}: { 
  queryRef: any; 
  currentUserAccountId: string;
}) {
  const data = usePreloadedQuery<AllAccountsQueryRefType>(AllAccountsQueryType, queryRef);
  if (!data) {
    return (
      <Typography variant="body1" align="center">
        Error: No data loaded.
      </Typography>
    );
  }
  
  return (
    <Box>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          All Accounts
        </Typography>
        <AllAccountsList 
          query={data} 
          currentUserAccountId={currentUserAccountId}
          showOnlyUserAccount={false} 
        />
      </Box>
    </Box>
  );
}

type AdminPageProps = {
    currentUserAccountId?: string;
};
    
const AdminPage: React.FC<AdminPageProps> = () => {
    const { user, token } = authStore.getState();
    const [queryRef, loadQuery] = useQueryLoader<AccountQueryType>(AllAccountsQueryType);
    const [isClient, setIsClient] = useState(false);
    
    useEffect(() => {
        setIsClient(true);
    }, []);
    
    useEffect(() => {
        if (token && user) {
            try {
                loadQuery({ 
                    first: 2, 
                    after: null,
                });
            } catch (error) {
                console.error("Error loading account query:", error);
            }
        }
    }, [token, loadQuery, user]);
    
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
    
    const userAccountId = user.taxId || "";
    
    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h5" align="center" gutterBottom>
                    Account Admin
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
        
export default AdminPage;