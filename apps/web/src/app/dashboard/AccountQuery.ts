import { graphql } from 'react-relay';

export const ACCOUNT_QUERY = graphql`
  query AccountQuery(
    $first: Int!, 
    $after: String,
  ) {
    ...AccountList_query @arguments(
      first: $first, 
      after: $after
    )
    
    # Transaction history
    transactions(first: $first, after: $after) {
      edges {
        node {
          id
          account_id_sender
          account_id_receiver
          amount
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;