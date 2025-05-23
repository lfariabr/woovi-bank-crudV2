import { graphql } from 'react-relay';

export const AllAccountsQuery = graphql`
  query AllAccountsQuery($first: Int = 100, $after: String) {
    ...AllAccountsList_query @arguments(first: $first, after: $after)
  }
`;