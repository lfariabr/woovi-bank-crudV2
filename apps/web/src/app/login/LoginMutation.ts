import { graphql } from 'react-relay';

export const LOGIN_MUTATION = graphql`
  mutation LoginMutation($input: LoginInput!) {
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