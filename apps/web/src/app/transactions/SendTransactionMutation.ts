import { graphql, commitMutation } from 'react-relay';
import type { Environment } from 'relay-runtime';

const mutation = graphql`
  mutation SendTransactionMutation(
    $input: SendTransactionInput!
  ) {
    SendTransaction(input: $input) {
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

type Variables = {
  input: {
    account_id_sender: string;
    account_id_receiver: string;
    amount: number;
  };
};

export function sendTransaction(
  environment: Environment,
  accountIdSender: string,
  accountIdReceiver: string,
  amount: number,
  onCompleted: (response: any) => void,
  onError: (error: Error) => void
) {
  const variables: Variables = {
    input: {
      account_id_sender: accountIdSender,
      account_id_receiver: accountIdReceiver,
      amount: amount,
    },
  };

  return commitMutation(environment, {
    mutation,
    variables,
    onCompleted,
    onError,
  });
}
