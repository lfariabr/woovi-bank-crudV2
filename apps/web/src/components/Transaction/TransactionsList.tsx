import React from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { usePaginationFragment } from 'react-relay';
import { graphql } from 'react-relay';

import { Transaction } from './Transaction';
import { TransactionsList_query$key } from '../../__generated__/TransactionsList_query.graphql';

const TRANSACTIONS_FRAGMENT = graphql`
  fragment TransactionsList_query on Query
  @refetchable(queryName: "TransactionsListPaginationQuery")
  @argumentDefinitions(
    first: { type: "Int!" }
    after: { type: "String" }
    account_id_sender: { type: "String" }
    account_id_receiver: { type: "String" }
    amount: { type: "Float" }
  ) {
    transactions(
      first: $first, 
      after: $after,
      account_id_sender: $account_id_sender
      account_id_receiver: $account_id_receiver
      amount: $amount
    )
      @connection(key: "TransactionsList_transactions") {
      edges {
        node {
          id
          ...Transaction_transaction
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

type TransactionsListProps = {
  query: TransactionsList_query$key;
  currentUserAccountId: string;
  account_id_sender?: string;
  account_id_receiver?: string;
  amount?: number;
};

export const TransactionsList = ({ 
  query,
  currentUserAccountId,
  account_id_sender = "",
  account_id_receiver = "",
  amount = 0
}: TransactionsListProps) => {
  const { data, loadNext, isLoadingNext, hasNext } = usePaginationFragment(
    TRANSACTIONS_FRAGMENT,
    query
  );
  const loadMore = () => {
    if (isLoadingNext) return;
    loadNext(3);
  };
  
  if (!data?.transactions?.edges) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No transaction data available.
        </Typography>
      </Box>
    );
  }

  if (data.transactions.edges.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No transactions found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {data.transactions.edges.map((edge) =>
        edge && edge.node ? (
          <Transaction
            key={edge.node.id}
            transaction={edge.node}
            currentUserAccountId={currentUserAccountId}
          />
        ) : null
)}
      
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
