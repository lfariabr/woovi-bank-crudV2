import { graphql } from 'react-relay';
import { commitMutation } from 'react-relay';
import { Environment } from 'relay-runtime';

const mutation = graphql`
  mutation userLoginMutation($input: LoginInput!) {
    login(input: $input) {
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

export function commitLoginMutation(
  environment: Environment,
  email: string,
  password: string
) {
  return new Promise((resolve, reject) => {
    commitMutation(environment, {
      mutation,
      variables: {
        input: { email, password }
      },
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
