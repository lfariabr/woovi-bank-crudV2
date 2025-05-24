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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.allAccounts.edges.map((edge) =>
          edge?.node ? (
            <div key={edge.node.id} className="w-full">
              <Card className="h-full overflow-hidden border-2 hover:border-[#03d69d] transition-all duration-200 rounded-xl shadow-md hover:shadow-lg">
                <div className="bg-gradient-to-r from-[#03d69d] to-[#02b987] p-2">
                  <h3 className="font-semibold text-white text-lg px-2">
                    {edge.node.first_name} {edge.node.last_name}
                  </h3>
                </div>
                <CardContent className="p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Account ID:</span>
                    <span className="text-sm bg-gray-100 px-2 py-1 rounded-md">{edge.node.accountId}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Balance:</span>
                    <span className="text-sm bg-[#edfdf9] text-[#03d69d] font-semibold px-3 py-1 rounded-full">
                      ${Number(edge.node.balance) / 1}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Tax ID:</span>
                    <span className="text-sm bg-gray-100 px-2 py-1 rounded-md">{edge.node.taxId}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Created:</span>
                    <span className="text-sm bg-gray-100 px-2 py-1 rounded-md">{edge.node.createdAt}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <span className={`text-sm px-3 py-1 rounded-full ${edge.node.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {edge.node.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null
        )}
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
              'Load More Accounts'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};