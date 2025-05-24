import React from 'react';
import { usePaginationFragment } from 'react-relay';
import { graphql } from 'react-relay';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';

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
      <div className="py-8 text-center">
        <p className="text-gray-500">
          No transaction data available.
        </p>
      </div>
    );
  }

  if (data.transactions.edges.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">
          No transactions found.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
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
        <div className="text-center mt-4">
          <Button 
            variant="outline" 
            onClick={loadMore} 
            disabled={isLoadingNext}
            className="min-w-[120px]"
          >
            {isLoadingNext ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
