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
        console.log(`Account ${i} ID: ${edge.node.id}`);
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
    const matchingAccountId = currentUserAccountId;
    
    const userAccountEdge = data.accounts.edges.find(edge => 
      edge?.node?.id === "682bbf508f670fd96e7f201b" || 
      edge?.node?.accountId === matchingAccountId
    );
    
    if (userAccountEdge) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Account
            key={userAccountEdge.node.id}
            account={userAccountEdge.node}
            currentUserAccountId={currentUserAccountId}
          />
        </Box>
      );
    } else {
      return (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Your account information is not available.
          </Typography>
        </Box>
      );
    }
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
