import { graphql } from 'react-relay';

export const REGISTER_MUTATION = graphql`
  mutation RegisterMutation($input: RegisterInput!) {
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