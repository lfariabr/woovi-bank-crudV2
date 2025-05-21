import { graphql } from 'react-relay';

export const TRANSACTIONS_QUERY = graphql`
  query TransactionsQuery(
    $first: Int!, 
    $after: String,
    $account_id_sender: String,
    $account_id_receiver: String,
    $amount: Float
  ) {
    ...TransactionsList_query @arguments(
        first: $first, 
        after: $after, 
        account_id_sender: $account_id_sender,
        account_id_receiver: $account_id_receiver,
        amount: $amount
    )
  }
`;