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
      <div className="py-8 text-center bg-gray-50 rounded-xl border border-gray-100 shadow-sm">
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 8v4"></path>
              <path d="M12 16h.01"></path>
            </svg>
          </div>
          <p className="text-gray-500 font-medium">
            No transaction data available.
          </p>
        </div>
      </div>
    );
  }

  if (data.transactions.edges.length === 0) {
    return (
      <div className="py-8 text-center bg-gray-50 rounded-xl border border-gray-100 shadow-sm">
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 8v4"></path>
              <path d="M12 16h.01"></path>
            </svg>
          </div>
          <p className="text-gray-500 font-medium">
            No transactions found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="relative">
        {data.transactions.edges.length > 0 && (
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#03d69d] to-transparent z-0"></div>
        )}
        <div className="relative z-10">
          {data.transactions.edges.map((edge, index) =>
            edge && edge.node ? (
              <div key={edge.node.id} className="mb-4">
                <Transaction
                  transaction={edge.node}
                  currentUserAccountId={currentUserAccountId}
                />
              </div>
            ) : null
          )}
        </div>
      </div>
      
      {hasNext && (
        <div className="text-center mt-8">
          <Button 
            onClick={loadMore} 
            disabled={isLoadingNext}
            className="min-w-[150px] bg-gradient-to-r from-[#03d69d] to-[#02b987] text-white font-medium hover:shadow-lg transition-all duration-200 rounded-full px-6 py-2"
          >
            {isLoadingNext ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More Transactions'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
