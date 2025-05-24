import { graphql } from 'react-relay';

export const ACCOUNT_QUERY = graphql`
  query AccountQuery(
    $first: Int!, 
    $after: String,
    $account_id_sender: String,
    $account_id_receiver: String,
    $amount: Float
  ) {
    # Direct query for the current user's account
    myAccount {
      id
      first_name
      last_name
      email
      taxId
      accountId
      balance
    }
    
    ...AccountList_query @arguments(
      first: $first, 
      after: $after
    )

    # Include the TransactionsList fragment
    ...TransactionsList_query @arguments(
      first: $first,
      after: $after,
      account_id_sender: $account_id_sender,
      account_id_receiver: $account_id_receiver,
      amount: $amount
    )
  }
`;