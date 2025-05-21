import { graphql } from 'react-relay';

export const COMPONENT_SEND_TRANSACTION_MUTATION = graphql`
  mutation sendTransactionMutation($input: SendTransactionInput!) {
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
