import { graphql } from 'react-relay';

export const ACCOUNTS_QUERY = graphql`
  query AccountsQuery(
    $first: Int!, 
    $after: String
  ) {
    accounts(first: $first, after: $after) {
      edges {
        node {
          id
          first_name
          last_name
          balance
          taxId
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
