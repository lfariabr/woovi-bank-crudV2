import React from 'react';
import { usePaginationFragment } from 'react-relay';
import { graphql } from 'react-relay';
import { Loader2 } from 'lucide-react';

// Import Shadcn UI components
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

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
      <div className="py-8 text-center">
        <p className="text-muted-foreground">
          No account data available.
        </p>
      </div>
    );
  }

  if (data.accounts.edges.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">
          No accounts found.
        </p>
      </div>
    );
  }

  if (showOnlyUserAccount) {
    
    // Get the current user's information from localStorage
    let userData: { accountId?: string } | null = null;
    try {
      if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          userData = JSON.parse(userStr);
        }
      }
    } catch (e) {
      // Error handling silently
    }
    
    // Find the account that matches the logged-in user's accountId
    let accountEdge: any = null;
    
    if (userData && userData.accountId) {
      // Try to find an account with matching accountId
      accountEdge = data.accounts.edges.find(edge => 
        edge?.node?.accountId === userData?.accountId
      );
    }
    
    // If no match found, use the first account as fallback
    if (!accountEdge) {
      accountEdge = data.accounts.edges[0];
    }
    
    // If there's no account, show an error
    if (!accountEdge || !accountEdge.node) {
      return (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">
            No account available.
          </p>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col gap-4">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-primary">
            Your Account (ID: {currentUserAccountId})
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Account details for {accountEdge.node.first_name} {accountEdge.node.last_name}
          </p>
        </div>
        <Account
          key={accountEdge.node.id}
          account={accountEdge.node}
          currentUserAccountId={currentUserAccountId}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
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
        <div className="text-center mt-4">
          <Button 
            variant="outline" 
            onClick={loadMore} 
            disabled={isLoadingNext}
            className="flex items-center gap-2"
          >
            {isLoadingNext && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoadingNext ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
};
