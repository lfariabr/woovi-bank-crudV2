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
  // Ensure we have a valid date string before parsing
  const createdAtDate = transaction.createdAt || new Date().toISOString();
  const formattedDate = DateTime.fromISO(createdAtDate).toFormat('dd/MM/yyyy HH:mm');
  
  return (
    <Card className={`border-0 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-200`}>
      <div className={`h-2 w-full ${isIncoming ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-red-300 to-red-400'}`}></div>
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isIncoming ? 'bg-green-100' : 'bg-[#edfdf9]'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isIncoming ? 'green' : '#03d69d'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isIncoming ? (
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                ) : (
                  <path d="M21 9v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9M7 16l5 5 5-5M12 3v18"/>
                )}
              </svg>
            </div>
            <div>
              <p className="font-medium">
                {isIncoming ? 'Received' : 'Sent'}
              </p>
              <p className="text-xs text-muted-foreground">
                {formattedDate}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <p className={`font-bold text-lg ${isIncoming ? 'text-green-600' : 'text-[#03d69d]'}`}>
              ${(transaction.amount / 1).toFixed(2)}
            </p>
            <Badge variant={isIncoming ? 'success' : 'destructive'} className={`text-xs mt-1 ${!isIncoming ? 'bg-red-100 text-red-600 hover:bg-red-200' : ''}`}>
              {isIncoming ? 'INCOMING' : 'OUTGOING'}
            </Badge>
          </div>
        </div>
        
        <div className="pt-2 border-t border-gray-100">
          <p className="text-sm text-muted-foreground flex justify-between">
            <span className="font-medium">{isIncoming ? 'From:' : 'To:'}</span>
            <span className="bg-gray-100 px-2 py-1 rounded-md text-xs">
              {isIncoming 
                ? transaction.account_id_sender || 'Unknown'
                : transaction.account_id_receiver || 'Unknown'
              }
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};