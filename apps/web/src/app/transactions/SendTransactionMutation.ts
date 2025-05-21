import { graphql } from 'react-relay';

export const SEND_TRANSACTION_MUTATION = graphql`
  mutation SendTransactionMutation($input: SendTransactionInput!) {
    sendTransaction(input: $input) {
      transaction {
        id
        amount
        createdAt
        account_id_sender
        account_id_receiver
      }
    }
  }
`;