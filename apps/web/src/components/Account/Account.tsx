import React from 'react';
import { Box, Button, Card, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { graphql, useFragment } from 'react-relay';
import { Account_account$key } from '../../__generated__/Account_account.graphql';

type AccountProps = {
  account: Account_account$key;
  currentUserAccountId?: string;
};

export const Account = (props: AccountProps) => {
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
      <Card variant="outlined" sx={{ p: 2 }}>
        <Typography color="text.secondary">Account information not available</Typography>
      </Card>
    );
  }

  const isCurrentAccount = account.accountId === props.currentUserAccountId;

  return (
    <Card
      variant="outlined"
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        p: 2, 
        gap: 2,
        borderLeft: 4, 
        borderColor: isCurrentAccount ? 'primary.main' : 'text.secondary'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography fontWeight={500}>
         Hello, {account.first_name}. Your current balance is ${(account.balance / 100).toFixed(2)}
        </Typography>
        <Typography variant="body2">
          Account ID: {account.accountId}
        </Typography>
        <Button 
          onClick={handleTransfer}
          variant="contained"
          color="primary"
        >
          Transfer
        </Button>
      </Box>
    </Card>
  );
};
