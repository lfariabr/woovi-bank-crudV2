1. GraphQL Schema Definition
First, we defined the GraphQL schema for transactions:
type Transaction implements Node {
  id: ID!
  amount: Float!
  account_id_sender: String!
  account_id_receiver: String!
  createdAt: String!
}

type TransactionConnection {
  pageInfo: PageInfo!
  edges: [TransactionEdge]
}

type TransactionEdge {
  node: Transaction
  cursor: String!
}

type Query {
  transactions(
    after: String
    first: Int
    before: String
    last: Int
    account_id_sender: String
    account_id_receiver: String
    amount: Float
  ): TransactionConnection
}

2. Backend Implementation
2.1 Resolver Implementation
We created the resolver in transactionFields.ts to handle filtering:
export const transactionConnectionField = (key: string) => ({
  [key]: {
    type: TransactionConnection.connectionType,
    args: {
      ...connectionArgs,
      account_id_sender: { type: GraphQLString },
      account_id_receiver: { type: GraphQLString },
      amount: { type: GraphQLFloat },
    },
    resolve: async (_, args, context) => {
      const { account_id_sender, account_id_receiver, amount, ...paginationArgs } = args;
      
      // Smart filtering to show transactions for the user
      let filters = {};
      const filterConditions = [];
      
      if (account_id_sender) {
        filterConditions.push({
          $or: [
            { account_id_sender: new Types.ObjectId(account_id_sender) },
            { account_id_receiver: new Types.ObjectId(account_id_sender) }
          ]
        });
      }
      
      // Apply filters
      if (filterConditions.length === 1) {
        filters = filterConditions[0];
      }
      
      return await TransactionLoader.loadAll(context, { ...paginationArgs, filters });
    },
  },
});
3. Frontend Components
3.1 Transaction Component
First, we created the individual Transaction component:
// Transaction.tsx
const TRANSACTION_FRAGMENT = graphql`
  fragment Transaction_transaction on Transaction {
    id
    amount
    createdAt
    account_id_sender
    account_id_receiver
  }
`;

export const Transaction = (props) => {
  const transaction = useFragment(TRANSACTION_FRAGMENT, props.transaction);
  const isIncoming = transaction.account_id_receiver === props.account_id_sender;

  return (
    <Paper>
      <Typography>
        {isIncoming ? 'Received' : 'Sent'} ${(transaction.amount / 100).toFixed(2)}
      </Typography>
      <Chip label={isIncoming ? 'INCOMING' : 'OUTGOING'} />
    </Paper>
  );
};

3.2 TransactionsList Component
Next, we created the list with pagination:

tsx
CopyInsert
// TransactionsList.tsx
const TRANSACTIONS_FRAGMENT = graphql`
  fragment TransactionsList_query on Query
  @refetchable(queryName: "TransactionsListPaginationQuery")
  @argumentDefinitions(
    first: { type: "Int!" }
    after: { type: "String" }
    account_id_sender: { type: "String" }
    account_id_receiver: { type: "String" }
    amount: { type: "Float" }
  ) {
    transactions(
      first: $first, 
      after: $after,
      account_id_sender: $account_id_sender
      account_id_receiver: $account_id_receiver
      amount: $amount
    )
      @connection(key: "TransactionsList_transactions") {
      edges {
        node {
          id
          ...Transaction_transaction
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const TransactionsList = ({ 
  query,
  currentUserAccountId,
  account_id_sender,
  account_id_receiver,
  amount 
}) => {
  const { data, loadNext, isLoadingNext, hasNext } = usePaginationFragment(
    TRANSACTIONS_FRAGMENT,
    query
  );
  
  const loadMore = () => {
    if (isLoadingNext) return;
    loadNext(10);
  };

  return (
    <Box>
      {data.transactions.edges.map((edge) => (
        <Transaction
          key={edge.node.id}
          transaction={edge.node}
          account_id_sender={account_id_sender}
          account_id_receiver={account_id_receiver}
          amount={amount}
        />
      ))}
      
      {hasNext && (
        <Button onClick={loadMore} disabled={isLoadingNext}>
          {isLoadingNext ? 'Loading...' : 'Load More'}
        </Button>
      )}
    </Box>
  );
};
3.3 Main Query Definition
tsx
CopyInsert
// TransactionsQuery.ts
export const TRANSACTIONS_QUERY = graphql`
  query TransactionsQuery(
    $first: Int!, 
    $after: String,
    $account_id_sender: String,
    $account_id_receiver: String,
    $amount: Float
  ) {
    ...TransactionsList_query @arguments(
        first: $first, 
        after: $after, 
        account_id_sender: $account_id_sender,
        account_id_receiver: $account_id_receiver,
        amount: $amount
    )
  }
`;
3.4 Page Component
tsx
CopyInsert
// page.tsx
const TransactionsPage = () => {
  const { user, token } = authStore.getState();
  const [queryRef, loadQuery] = useQueryLoader(TRANSACTIONS_QUERY);
  const [cursor, setCursor] = useState(null);

  useEffect(() => {
    if (token) {
      loadQuery({ 
        first: 10, 
        after: cursor,
        account_id_sender: user.id,
        // Only pass real values
        account_id_receiver: undefined, 
        amount: undefined
      });
    }
  }, [token, loadQuery, cursor, user]);

  return (
    <Container>
      <Typography>Transactions</Typography>
      {queryRef ? (
        <Suspense fallback={<CircularProgress />}>
          <TransactionContent queryRef={queryRef} currentUserAccountId={user.id} />
        </Suspense>
      ) : (
        <CircularProgress />
      )}
    </Container>
  );
};

function TransactionContent({ queryRef, currentUserAccountId }) {
  const data = usePreloadedQuery(TRANSACTIONS_QUERY, queryRef);

  return (
    <TransactionsList 
      query={data} 
      currentUserAccountId={currentUserAccountId} 
      account_id_sender={currentUserAccountId}
      account_id_receiver=""
      amount={0}
    />
  );
}
4. Key Features Implemented
Relay Connection Pattern: Using proper Relay pagination with cursor-based navigation
Fragment-based Components: Each component declares exactly the data it needs
Smart Filtering: Transactions are filtered by user context (sender/receiver relationships)
Load More Functionality: Users can load more transactions with proper loading states
TypeScript Integration: Strong typing throughout for improved code quality
5. Issues We Solved
Schema vs Implementation Mismatch: We aligned the GraphQL schema definition with the backend implementation
MongoDB TypeScript Errors: We added proper type definitions for MongoDB filters
Filter Parameter Handling: We implemented intelligent filtering logic to show relevant transactions
Yes, we followed the same structure as the Message components, with similar patterns for fragments, queries, and pagination. The main differences are the additional filtering parameters and more complex UI logic for transaction display.