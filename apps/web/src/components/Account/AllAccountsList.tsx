import React from 'react';
import { graphql, useFragment } from 'react-relay';
import { Box, Paper, Typography, Button, CircularProgress, Grid } from '@mui/material';
// Adjust the import path as needed for your generated types
import { AllAccountsListFragment_query$key } from '../../__generated__/AllAccountsListFragment_query.graphql';

import { usePaginationFragment } from 'react-relay';
import { ALL_ACCOUNTS_LIST_FRAGMENT } from './AllAccountsListFragment';

type Props = {
  query: AllAccountsListFragment_query$key;
  currentUserAccountId: string;
  showOnlyUserAccount?: boolean;
};

  export const AllAccountsList: React.FC<Props> =({
    query,
    currentUserAccountId,
    showOnlyUserAccount
  }) => {
    const {
      data,
      loadNext,
      isLoadingNext,
      hasNext,
    } = usePaginationFragment(
      ALL_ACCOUNTS_LIST_FRAGMENT,
      query
    );

    if (!data?.allAccounts?.edges?.length) {
      return <Typography>No accounts found.</Typography>;
    }

    const loadMore = () => {
      if (isLoadingNext) return;
      loadNext(2);
    };

    return (
    <Box>
      <Grid container spacing={2}>
        {data.allAccounts.edges.map((edge) =>
          edge?.node ? (
            <Grid item xs={12} sm={6} key={edge.node.id}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="body1" gutterBottom>
                  Account name: {edge.node.first_name} {edge.node.last_name}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Account ID: {edge.node.accountId}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Balance: ${Number(edge.node.balance) / 100}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Tax ID: {edge.node.taxId}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Created: {edge.node.createdAt}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Status: {edge.node.isActive ? 'Active' : 'Inactive'}
                </Typography>
              </Paper>
            </Grid>
          ) : null
        )}
      </Grid>
      
      {hasNext && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button
            variant="outlined"
            onClick={loadMore}
            disabled={isLoadingNext}
            startIcon={isLoadingNext ? <CircularProgress size={20} /> : null}
          >
            {isLoadingNext ? 'Loading...' : 'Load More'}
          </Button>
        </Box>
      )}
    </Box>
  );
};