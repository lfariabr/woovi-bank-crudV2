import React from 'react';
import { graphql, useFragment } from 'react-relay';
// Adjust the import path as needed for your generated types
import { AllAccountsListFragment_query$key } from '../../__generated__/AllAccountsListFragment_query.graphql';

import { usePaginationFragment } from 'react-relay';
import { ALL_ACCOUNTS_LIST_FRAGMENT } from './AllAccountsListFragment';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Loader2 } from 'lucide-react';

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
      return <p className="text-center py-4 text-gray-500">No accounts found.</p>;
    }

    const loadMore = () => {
      if (isLoadingNext) return;
      loadNext(2);
    };

    return (
    <div className="container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.allAccounts.edges.map((edge) =>
          edge?.node ? (
            <div key={edge.node.id} className="w-full">
              <Card className="h-full">
                <CardContent className="p-4 space-y-2">
                  <p className="font-medium">
                    Account name: {edge.node.first_name} {edge.node.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Account ID: {edge.node.accountId}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Balance: ${Number(edge.node.balance) / 100}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tax ID: {edge.node.taxId}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Created: {edge.node.createdAt}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Status: {edge.node.isActive ? 'Active' : 'Inactive'}
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : null
        )}
      </div>
      
      {hasNext && (
        <div className="text-center mt-6">
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