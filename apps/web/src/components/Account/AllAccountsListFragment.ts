import { graphql } from 'react-relay';

export const ALL_ACCOUNTS_LIST_FRAGMENT = graphql`
  fragment AllAccountsListFragment_query on Query
  @refetchable(queryName: "AllAccountsListPaginationQuery")
  @argumentDefinitions(
    first: { type: "Int", defaultValue: 2 }
    after: { type: "String" }
  ) {
    allAccounts(first: $first, after: $after)
      @connection(key: "AllAccountsList_allAccounts") {
      edges {
        node {
          id
          accountId
          first_name
          last_name
          balance
          taxId
          createdAt
          isActive
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;