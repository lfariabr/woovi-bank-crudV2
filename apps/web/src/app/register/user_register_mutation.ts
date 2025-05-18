import { graphql } from 'react-relay';
import { commitMutation } from 'react-relay';
import { Environment } from 'relay-runtime';

const mutation = graphql`
  mutation userRegisterMutation($input: RegisterInput!) {
    register(input: $input) {
      token
      account {
        id
        email
        first_name
        last_name
        taxId
        accountId
        balance
        isActive
      }
    }
  }
`;

export function commitRegisterMutation(
  environment: Environment,
  input: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    taxId: string;
    accountId: string;
  }
) {
  return new Promise((resolve, reject) => {
    commitMutation(environment, {
      mutation,
      variables: { input },
      onCompleted: (response, errors) => {
        if (errors) {
          return reject(errors);
        }
        resolve(response);
      },
      onError: (error) => {
        reject(error);
      },
    });
  });
}