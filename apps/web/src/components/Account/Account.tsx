import React from 'react';
import { useRouter } from 'next/navigation';
import { graphql, useFragment } from 'react-relay';
import { Account_account$key } from '../../__generated__/Account_account.graphql';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';

type AccountProps = {
  account: Account_account$key;
};

export const Account = (props: AccountProps) => {
  // Get account data from Relay fragment
  const account = useFragment<Account_account$key>(
    graphql`
      fragment Account_account on Account {
        id
        first_name
        accountId
        balance
      }
    `,
    props.account
  );

  const router = useRouter();

  const handleTransfer = () => {
    // Navigate to transactions page with send money tab pre-selected
    router.push(`/transactions?activeTab=1&senderId=${account.id}`);
  };

  if (!account || !account.first_name) {
    return (
      <Card className="p-4">
        <CardContent>
          <p className="text-gray-500">Account information not available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col p-4 gap-4 border-solid">
          <Button 
            onClick={handleTransfer}
            variant="default"
            className="bg-[#03d69d] hover:bg-[#02b987] text-white w-full"
          >
            Transfer
          </Button>
    </Card>
  );
};
