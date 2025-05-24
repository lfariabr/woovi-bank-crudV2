import { graphql, useFragment } from 'react-relay';
import { DateTime } from 'luxon';
import { Transaction_transaction$key } from '../../__generated__/Transaction_transaction.graphql';
import { authStore } from '../../lib/auth-store';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

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
  const isIncoming = transaction.account_id_receiver === (currentUserObjectId || '');
  const formattedDate = DateTime.fromISO(transaction.createdAt).toFormat('dd/MM/yyyy HH:mm');
  
  return (
    <Card className={`border-l-4 ${isIncoming ? 'border-l-green-500' : 'border-l-primary'}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <p className="font-medium">
            {isIncoming ? 'Received' : 'Sent'} ${(transaction.amount / 1).toFixed(2)}
          </p>
          <Badge variant={isIncoming ? 'success' : 'default'} className="text-xs">
            {isIncoming ? 'INCOMING' : 'OUTGOING'}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground">
          {isIncoming 
            ? `From: ${transaction.account_id_sender || 'Unknown'}` 
            : `To: ${transaction.account_id_receiver || 'Unknown'}`
          }
        </p>
        
        <p className="text-xs text-muted-foreground">
          {formattedDate}
        </p>
      </CardContent>
    </Card>
  );
};