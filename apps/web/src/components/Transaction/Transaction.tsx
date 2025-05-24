import { Box, Card, Typography, Chip } from '@mui/material';
import { graphql, useFragment } from 'react-relay';
import { DateTime } from 'luxon';
import { Transaction_transaction$key } from '../../__generated__/Transaction_transaction.graphql';
import { authStore } from '../../lib/auth-store';

type TransactionProps = {
  transaction: Transaction_transaction$key;
  currentUserAccountId: string; // Only pass the current user's account ID for context
};

export const Transaction = (props: TransactionProps) => {
  const transaction = useFragment<Transaction_transaction$key>(
    graphql`
      fragment Transaction_transaction on Transaction {
        id
        amount
        createdAt
        account_id_sender
        account_id_receiver
      }
    `,
    props.transaction
  );

  // Get the user's MongoDB ObjectId from auth store
  const currentUserObjectId = authStore.getState().user?.id;
  
  // Determine if transaction is incoming based on comparing with ObjectId
  const isIncoming = transaction.account_id_receiver === currentUserObjectId;
  const formattedDate = DateTime.fromISO(transaction.createdAt).toFormat('dd/MM/yyyy HH:mm');
  
  return (
    <Card
      variant="outlined"
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        p: 2, 
        gap: 2,
        borderLeft: 4, 
        borderColor: isIncoming ? 'success.main' : 'primary.main' 
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography fontWeight={500}>
          {isIncoming ? 'Received' : 'Sent'} ${(transaction.amount / 1).toFixed(2)}
        </Typography>
        <Chip 
          label={isIncoming ? 'INCOMING' : 'OUTGOING'} 
          color={isIncoming ? 'success' : 'primary'} 
          size="small" 
        />
      </Box>
      
      <Typography variant="body2">
        {isIncoming 
          ? `From: ${transaction.account_id_sender}` 
          : `To: ${transaction.account_id_receiver}`
        }
      </Typography>
      
      <Typography variant="caption">
        {formattedDate}
      </Typography>
    </Card>
  );
};