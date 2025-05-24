import { graphql } from 'react-relay';

export const AllAccountsQuery = graphql`
  query AllAccountsQuery($first: Int = 2, $after: String) {
    ...AllAccountsListFragment_query @arguments(first: $first, after: $after)
  }
`;