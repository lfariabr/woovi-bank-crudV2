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

  // IMPORTANT: Check if we're on the dashboard showing the user's own account
  // If so, get the real balance from localStorage
  const [userBalance, setUserBalance] = React.useState<string | null>(null);
  const [userName, setUserName] = React.useState<string | null>(null);
  const [userAccountId, setUserAccountId] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Only do this if we're on the dashboard showing the user's account
    if (props.currentUserAccountId && typeof window !== 'undefined') {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          // Use the user's actual balance from localStorage
          setUserBalance(userData.balance);
          
          // Also use the real user name if available
          if (userData.first_name) {
            setUserName(userData.first_name);
          }
          
          // Set the user account ID
          if (userData.accountId) {
            setUserAccountId(userData.accountId);
          }
          
        }
      } catch (e) {
        console.error("Error getting user balance:", e);
      }
    }
  }, [props.currentUserAccountId]);

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

  // Check if we're on the dashboard page (which passes currentUserAccountId)
  // and if this account belongs to the current user
  const onDashboard = !!props.currentUserAccountId;
  let isCurrentAccount = false;
  
  // In our current implementation, if the account ID matches the user's ID, it's the current account
  // We need to check if userAccountId is available (from localStorage)
  if (onDashboard && userAccountId && account.accountId === userAccountId) {
    isCurrentAccount = true;
  }
  
  // IMPORTANT: Always prefer GraphQL data over localStorage
  // This ensures we always show the most up-to-date account information
  const accountId = account.accountId || (onDashboard && userAccountId ? userAccountId : null) || '0';
  
  // Always use the GraphQL balance instead of localStorage balance
  const displayBalance = account.balance || '0';
  
  // For name, we can still use localStorage as fallback
  const displayName = account.first_name || (onDashboard && userName ? userName : 'User');

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
         Hello, <b>{isCurrentAccount ? 'Test' : displayName}</b>.
         <br />
         Your current balance is: <b>${parseFloat(displayBalance).toFixed(2)}</b>
         <br />
         Account ID: {accountId}
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
