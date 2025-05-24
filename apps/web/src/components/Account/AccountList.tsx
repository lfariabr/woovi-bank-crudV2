import React from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { usePaginationFragment } from 'react-relay';
import { graphql } from 'react-relay';

import { Account } from './Account';
import { AccountList_query$key } from '../../__generated__/AccountList_query.graphql';

const ACCOUNTS_FRAGMENT = graphql`
  fragment AccountList_query on Query
  @refetchable(queryName: "AccountListPaginationQuery")
  @argumentDefinitions(
    first: { type: "Int!" }
    after: { type: "String" }
  ) {
    accounts(
      first: $first, 
      after: $after
    )
      @connection(key: "AccountList_accounts") {
      edges {
        node {
          id
          accountId
          ...Account_account
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

type AccountListProps = {
  query: AccountList_query$key;
  currentUserAccountId: string;
  showOnlyUserAccount?: boolean;
};

export const AccountList = ({ 
  query,
  currentUserAccountId,
  showOnlyUserAccount = false
}: AccountListProps) => {
  const { data, loadNext, isLoadingNext, hasNext } = usePaginationFragment(
    ACCOUNTS_FRAGMENT,
    query
  );

  if (data?.accounts?.edges) {
    data.accounts.edges.forEach((edge, i) => {
      if (edge?.node) {
      }
    });
  }

  const loadMore = () => {
    if (isLoadingNext) return;
    loadNext(10);
  };

  if (!data?.accounts?.edges) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No account data available.
        </Typography>
      </Box>
    );
  }

  if (data.accounts.edges.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No accounts found.
        </Typography>
      </Box>
    );
  }

  if (showOnlyUserAccount) {
    
    // Get the current user's information from localStorage
    let userData = null;
    try {
      if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          userData = JSON.parse(userStr);
        }
      }
    } catch (e) {
    }
    
    
    // Find the account that matches the logged-in user's accountId
    let accountEdge = null;
    
    if (userData && userData.accountId) {
      // Try to find an account with matching accountId
      accountEdge = data.accounts.edges.find(edge => 
        edge?.node?.accountId === userData.accountId
      );
      
      if (accountEdge) {
      }
    }
    
    // If no match found, use the first account as fallback
    if (!accountEdge) {
      accountEdge = data.accounts.edges[0];
    }
    
    // If there's no account, show an error
    if (!accountEdge || !accountEdge.node) {
      return (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No account available.
          </Typography>
        </Box>
      );
    }
    
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" color="primary">
            Your Account (ID: {currentUserAccountId})
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            Account details for {accountEdge.node.first_name} {accountEdge.node.last_name}
          </Typography>
        </Box>
        <Account
          key={accountEdge.node.id}
          account={accountEdge.node}
          currentUserAccountId={currentUserAccountId}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {data.accounts.edges.map((edge) =>
        edge && edge.node ? (
          <Account
            key={edge.node.id}
            account={edge.node}
            currentUserAccountId={currentUserAccountId}
          />
        ) : null
      )}
      
      {hasNext && !showOnlyUserAccount && (
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
