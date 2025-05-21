# Relay Implementation Guide for Transaction Module

## Overview

This document provides a comprehensive step-by-step guide to our Relay-based Transaction module implementation in the banking application. This implementation follows Relay's recommended patterns for handling paginated data with proper GraphQL integration.

## Table of Contents

1. [GraphQL Schema Definition](#1-graphql-schema-definition)
2. [Backend Implementation](#2-backend-implementation)
3. [Frontend Components](#3-frontend-components)
4. [Data Flow and Filtering](#4-data-flow-and-filtering)
5. [Pagination Handling](#5-pagination-handling)
6. [Troubleshooting Common Issues](#6-troubleshooting-common-issues)
7. [Comparison with Message Implementation](#7-comparison-with-message-implementation)

## 1. GraphQL Schema Definition

First, we defined the GraphQL schema for transactions with Relay connection pattern support:

```graphql
# Transaction entity definition
type Transaction implements Node {
  id: ID!
  amount: Float!
  account_id_sender: String!
  account_id_receiver: String!
  createdAt: String!
}

# Relay connection pattern for pagination
type TransactionConnection {
  pageInfo: PageInfo!
  edges: [TransactionEdge]
}

type TransactionEdge {
  node: Transaction
  cursor: String!
}

# Query field with filter parameters
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
```

This schema follows the Relay specification for connections, which requires:
- A Connection type (TransactionConnection)
- Edge types with nodes and cursors (TransactionEdge)
- PageInfo for tracking pagination state
- Arguments for cursor-based pagination (after, first, before, last)
- Custom filter arguments (account_id_sender, account_id_receiver, amount)

## 2. Backend Implementation

### 2.1 Type Definitions

We defined TypeScript types for the MongoDB filters to ensure type safety:

```typescript
// Define filter types for better type checking
type TransactionFilter = {
  account_id_sender?: Types.ObjectId;
  account_id_receiver?: Types.ObjectId;
  amount?: { $eq: number };
};

type OrCondition = {
  $or: TransactionFilter[];
};

type FilterCondition = TransactionFilter | OrCondition;
```

### 2.2 Resolver Implementation

We implemented the transactions resolver in `transactionFields.ts` to handle the query with proper filtering:

```typescript
export const transactionConnectionField = (key: string) => ({
  [key]: {
    type: TransactionConnection.connectionType,
    args: {
      ...connectionArgs,  // This includes first, after, before, last from Relay
      account_id_sender: { type: GraphQLString },
      account_id_receiver: { type: GraphQLString },
      amount: { type: GraphQLFloat },
    },
    resolve: async (_, args, context) => {
      const { account_id_sender, account_id_receiver, amount, ...paginationArgs } = args;
      
      let filters: FilterCondition = {};
      
      // Build filters based on provided parameters
      const filterConditions: FilterCondition[] = [];
        
      // Handle user ID conditions
      if (account_id_sender && account_id_receiver) {
        // If both are provided, check if they're the same
        if (account_id_sender === account_id_receiver) {
          filterConditions.push({
            $or: [
              { account_id_sender: new Types.ObjectId(account_id_sender) },
              { account_id_receiver: new Types.ObjectId(account_id_sender) }
            ]
          });
        } else {
          // Different IDs - look for specific sender->receiver transactions
          filterConditions.push({ account_id_sender: new Types.ObjectId(account_id_sender) });
          filterConditions.push({ account_id_receiver: new Types.ObjectId(account_id_receiver) });
        }
      } else if (account_id_sender && account_id_sender.trim() !== '') {
        // Just sender provided - show transactions where user is either sender OR receiver
        filterConditions.push({
          $or: [
            { account_id_sender: new Types.ObjectId(account_id_sender) },
            { account_id_receiver: new Types.ObjectId(account_id_sender) }
          ]
        });
      } else if (account_id_receiver && account_id_receiver.trim() !== '') {
        // Just receiver provided
        filterConditions.push({
          $or: [
            { account_id_sender: new Types.ObjectId(account_id_receiver) },
            { account_id_receiver: new Types.ObjectId(account_id_receiver) }
          ]
        });
      }
      
      // Handle amount filter
      if (amount && amount > 0) {
        filterConditions.push({ amount: { $eq: amount } });
      }
      
      // Apply filters
      if (filterConditions.length === 1) {
        filters = filterConditions[0];
      } else if (filterConditions.length > 1) {
        filters = { $and: filterConditions };
      }
      
      return await TransactionLoader.loadAll(context, { ...paginationArgs, filters });
    },
  },
});
```

### 2.3 Register the Field in QueryType

In `QueryType.ts`, we registered our transaction connection field:

```typescript
const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    // Other fields...
    ...transactionConnectionField('transactions'),
  }),
});
```

### 2.4 TransactionLoader Implementation

The TransactionLoader is responsible for fetching transactions from the database and handling pagination:

```typescript
export class TransactionLoader {
  static async load(context, id) {
    return await Transaction.findById(id);
  }

  static async loadAll(context, { first, after, before, last, filters }) {
    // Create base query with filters
    let query = Transaction.find(filters || {});

    // Apply cursor-based pagination
    if (after) {
      // Convert cursor to ObjectId and fetch transactions after this cursor
      const afterTransaction = await Transaction.findById(fromGlobalId(after).id);
      if (afterTransaction) {
        query = query.where('_id').gt(afterTransaction._id);
      }
    }

    // Sort by ID (created date)
    query = query.sort({ _id: 1 });

    // Limit results based on 'first'
    if (first) {
      query = query.limit(first + 1); // +1 to check if there are more results
    }

    // Execute query
    const transactions = await query.exec();

    // Determine if there are more results
    const hasNextPage = first ? transactions.length > first : false;
    if (hasNextPage && first) {
      transactions.pop(); // Remove the extra item we fetched
    }

    // Create edges with cursors
    const edges = transactions.map(transaction => ({
      cursor: toGlobalId('Transaction', transaction._id.toString()),
      node: transaction,
    }));

    return {
      edges,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: Boolean(after), // If there's an 'after' cursor, there are previous items
        startCursor: edges.length > 0 ? edges[0].cursor : null,
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
      },
    };
  }
}
```

## 3. Frontend Components

### 3.1 Transaction Component

First, we created an individual Transaction component to display a single transaction:

```tsx
// Transaction.tsx
import React from 'react';
import { Box, Typography, Chip, Paper } from '@mui/material';
import { graphql, useFragment } from 'react-relay';
import { DateTime } from 'luxon';

import { Transaction_transaction$key } from '../../__generated__/Transaction_transaction.graphql';

// Define the fragment for a single transaction
// This declares exactly what data this component needs
const TRANSACTION_FRAGMENT = graphql`
  fragment Transaction_transaction on Transaction {
    id
    amount
    createdAt
    account_id_sender
    account_id_receiver
  }
`;

type TransactionProps = {
  transaction: Transaction_transaction$key; // Fragment reference type
  account_id_sender: string;
  account_id_receiver: string;
  amount: number;
};

export const Transaction = (props: TransactionProps) => {
  // Use the fragment to access data
  const transaction = useFragment(
    TRANSACTION_FRAGMENT,
    props.transaction
  );

  // Determine if transaction is incoming or outgoing relative to current user
  const isIncoming = transaction.account_id_receiver === props.account_id_sender;

  // Format date
  const formattedDate = DateTime.fromISO(transaction.createdAt).toLocaleString(DateTime.DATETIME_MED);

  return (
    <Paper sx={{ p: 2, boxShadow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography fontWeight={500}>
          {isIncoming ? 'Received' : 'Sent'} ${(transaction.amount / 100).toFixed(2)}
        </Typography>
        <Chip 
          label={isIncoming ? 'INCOMING' : 'OUTGOING'} 
          color={isIncoming ? 'success' : 'primary'} 
          size="small" 
        />
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {isIncoming 
          ? `From: ${transaction.account_id_sender}` 
          : `To: ${transaction.account_id_receiver}`}
      </Typography>
      
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
        {formattedDate}
      </Typography>
    </Paper>
  );
};
```

### 3.2 TransactionsList Component

Next, we created the list component with pagination support:

```tsx
// TransactionsList.tsx
import React from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { usePaginationFragment } from 'react-relay';
import { graphql } from 'react-relay';

import { Transaction } from './Transaction';
import { TransactionsList_query$key } from '../../__generated__/TransactionsList_query.graphql';

// Define a refetchable fragment for pagination
const TRANSACTIONS_FRAGMENT = graphql`
  fragment TransactionsList_query on Query
  @refetchable(queryName: "TransactionsListPaginationQuery") # Enable refetching
  @argumentDefinitions( # Define the arguments this fragment accepts
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
      @connection(key: "TransactionsList_transactions") { # Identify connection for Relay
      edges {
        node {
          id
          ...Transaction_transaction # Spread the Transaction fragment
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

type TransactionsListProps = {
  query: TransactionsList_query$key;
  currentUserAccountId: string;
  account_id_sender: string;
  account_id_receiver: string;
  amount: number;
};

export const TransactionsList = ({ 
  query,
  currentUserAccountId,
  account_id_sender,
  account_id_receiver,
  amount 
}: TransactionsListProps) => {
  // Use Relay's pagination fragment hook
  const { data, loadNext, isLoadingNext, hasNext } = usePaginationFragment(
    TRANSACTIONS_FRAGMENT,
    query
  );
  
  // Function to load more items
  const loadMore = () => {
    if (isLoadingNext) return;
    loadNext(10);
  };

  // Handle empty states
  if (!data?.transactions?.edges) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No transaction data available.
        </Typography>
      </Box>
    );
  }

  if (data.transactions.edges.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No transactions found.
        </Typography>
      </Box>
    );
  }

  // Render transactions list with pagination
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {data.transactions.edges.map((edge) =>
        edge && edge.node ? (
          <Transaction
            key={edge.node.id}
            transaction={edge.node}
            account_id_sender={account_id_sender}
            account_id_receiver={account_id_receiver}
            amount={amount}
          />
        ) : null
      )}
      
      {hasNext && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button 
            variant="outlined" 
            onClick={loadMore} 
            disabled={isLoadingNext}
            startIcon={isLoadingNext ? <CircularProgress size={20} /> : null}
          >
            {isLoadingNext ? 'Loading...' : 'Load More'}
          </Button>
        </Box>
      )}
    </Box>
  );
};
```

### 3.3 Main Query Definition

We defined the main query in a separate file:

```tsx
// TransactionsQuery.ts
import { graphql } from 'react-relay';

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
```

### 3.4 Page Component

Finally, we created the page component that loads the query:

```tsx
// page.tsx
'use client';
import React, { useState, Suspense, useEffect } from 'react';
import { Box, Typography, Paper, Container, Grid, Divider, CircularProgress } from '@mui/material';
import { usePreloadedQuery, useQueryLoader } from 'react-relay';

import { authStore } from '../../lib/auth-store';
import { TransactionsList } from '../../components/Transaction/TransactionsList';
import type { TransactionsQuery as TransactionsQueryType } from '../../__generated__/TransactionsQuery.graphql';
import { TRANSACTIONS_QUERY } from './TransactionsQuery';

type TransactionsPageProps = {
  currentUserAccountId: string;
  account_id_sender?: string;
  account_id_receiver?: string;
  amount?: number;
};

const TransactionsPage: React.FC<TransactionsPageProps> = ({
  currentUserAccountId,
  account_id_sender,
  account_id_receiver,
  amount
}) => {
  const { user, token } = authStore.getState();
  // This hook provides a function to load the query and a reference to the loaded data
  const [queryRef, loadQuery] = useQueryLoader<TransactionsQueryType>(TRANSACTIONS_QUERY);
  const [cursor, setCursor] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Next.js client-side rendering check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load the query when the component mounts or dependencies change
  useEffect(() => {
    if (token) {
      try {
        loadQuery({ 
          first: 10, 
          after: cursor,
          account_id_sender: user.id,
          // Only pass valid filter values to avoid unnecessary filtering
          account_id_receiver: account_id_receiver && account_id_receiver.trim() !== '' ? account_id_receiver : undefined, 
          amount: amount && amount > 0 ? amount : undefined
        });
      } catch (error) {
        console.error("Error loading transactions query:", error);
      }
    }
  }, [token, loadQuery, cursor, user, account_id_receiver, amount]);

  // Handle server-side rendering
  if (!isClient) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ height: '100vh' }} />
      </Container>
    );
  }

  // Check authentication
  if (!user || !token) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" align="center">
            Please log in to view transactions
          </Typography>
        </Paper>
      </Container>
    );
  }

  // Render the transactions page
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Transactions
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Transaction History
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {queryRef ? (
              <Suspense fallback={
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <CircularProgress />
                </Box>
              }>
                <TransactionContent queryRef={queryRef} currentUserAccountId={user.id} />
              </Suspense>
            ) : (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress />
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

// Separate component using Suspense
function TransactionContent({ 
  queryRef, 
  currentUserAccountId 
}: { 
  queryRef: any; 
  currentUserAccountId: string;
}) {
  // Use the preloaded query data
  const data = usePreloadedQuery<TransactionsQueryType>(TRANSACTIONS_QUERY, queryRef);

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

export default TransactionsPage;
```

## 4. Data Flow and Filtering

### 4.1 Data Flow

The data flows through the components as follows:

1. **Initialization**: The `page.tsx` component initializes the query with filters (user.id as account_id_sender)

2. **Query Execution**:
   - The GraphQL query is sent to the server
   - The server resolver (`transactionFields.ts`) applies the filtering logic
   - The resolver returns paginated results matching the filters

3. **Data Processing**:
   - The `TransactionsList` component receives the connection data via the fragment
   - It maps over the edges to render individual `Transaction` components
   - Each `Transaction` component receives the specific transaction data it needs via its fragment

4. **Pagination**: 
   - When the "Load More" button is clicked, Relay fetches the next page of results
   - The data is merged with the existing data in the store
   - The UI updates to show the additional items

### 4.2 Smart Filtering Logic

The filtering logic in the resolver is designed to handle multiple use cases:

1. **User's Transactions**:
   - When only `account_id_sender` is provided, we show transactions where the user is either sender OR receiver
   - This is implemented using MongoDB's `$or` operator

2. **Specific Transaction Search**:
   - When both sender and receiver are provided (and different), we look for specific transactions between those accounts

3. **Amount Filtering**:
   - Supports filtering by exact transaction amount

### 4.3 MongoDB Query Construction

The resolver builds MongoDB queries dynamically based on the provided parameters:

```typescript
// Example filter for user's transactions (user ID: 123)
{
  $or: [
    { account_id_sender: ObjectId("123") },
    { account_id_receiver: ObjectId("123") }
  ]
}

// Example filter for specific transaction between accounts
{
  $and: [
    { account_id_sender: ObjectId("123") },
    { account_id_receiver: ObjectId("456") }
  ]
}
```

## 5. Pagination Handling

### 5.1 Backend Pagination

The backend implements cursor-based pagination following the Relay specification:

1. **Cursor Generation**:
   - Each transaction's ID is used to create a cursor
   - Cursors are encoded using Relay's `toGlobalId` function

2. **Pagination Parameters**:
   - `first`: Number of items to fetch
   - `after`: Cursor to fetch items after
   - `before` and `last`: Support for backward pagination (not implemented in our UI)

3. **PageInfo Construction**:
   - `hasNextPage`: Determined by fetching one extra item beyond the requested `first`
   - `hasPreviousPage`: True if there's an `after` cursor
   - `startCursor` and `endCursor`: First and last cursors in the current page

### 5.2 Frontend Pagination

The frontend handles pagination through Relay's pagination primitives:

1. **usePaginationFragment**:
   - This hook manages the pagination state and provides functions to load more data
   - It returns `{ data, loadNext, isLoadingNext, hasNext }`

2. **@connection Directive**:
   - Identifies the connection for Relay to manage
   - Allows Relay to merge new pages of data with existing data

3. **Load More Button**:
   - Calls `loadNext(10)` to fetch the next 10 items
   - Shows loading state during data fetching
   - Only appears when `hasNext` is true

### 5.3 User Experience

The pagination implementation provides a smooth user experience:

1. **Initial Load**: Shows first 10 transactions
2. **Load More**: User can click to load 10 more
3. **Loading States**: Button shows a spinner during loading
4. **Automatic Merging**: New data is seamlessly merged with existing data

## 6. Troubleshooting Common Issues

### 6.1 Schema vs. Implementation Mismatch

**Problem**: "Unknown argument X on field Y"

**Solution**:
- Ensure your GraphQL schema (.graphql files) and resolver implementation match exactly
- Check that parameter names in your schema match the args defined in your resolver
- Verify that any schema changes are reflected in both frontend and backend code

### 6.2 TypeScript Errors with MongoDB Filters

**Problem**: "Argument of type '{ $or: ...}' is not assignable to parameter of type 'never'"

**Solution**:
- Define proper TypeScript interfaces for your MongoDB query operators
- Use explicit typing for filter variables: `const filterConditions: FilterCondition[] = []`
- Create union types for different filter conditions: `type FilterCondition = TransactionFilter | OrCondition`

### 6.3 Relay Compiler Errors

**Problem**: Relay compiler fails with schema validation errors

**Solution**:
- Ensure the schema.graphql file is up to date
- Check that fragment @argumentDefinitions match the variables in your queries
- Verify that @connection directives are properly formatted
- Run relay-compiler after any schema or query changes

### 6.4 Empty Query Results

**Problem**: No transactions are displayed even though they exist in the database

**Solution**:
- Check that filter parameters are being passed correctly
- Verify that MongoDB field names match your schema (e.g., account_id_sender vs from)
- Ensure that ObjectId conversion is happening correctly
- Add logging to see actual filter objects being created

## 7. Comparison with Message Implementation

Our Transaction implementation follows the same patterns as the Message implementation, with some differences:

### 7.1 Similarities

- **Component Structure**: Both use container/item pattern (MessageList/TransactionsList)
- **Fragment Design**: Both define fragments for list and individual items
- **Pagination Pattern**: Both use Relay connection pattern and loadNext functionality
- **Query Organization**: Both separate the main query from the components

### 7.2 Differences

- **Filtering Complexity**: Transactions have more elaborate filtering (sender, receiver, amount)
- **UI Complexity**: Transaction items have more detailed display logic
- **Data Relationships**: Transactions involve relationships between accounts
- **Business Logic**: Transaction display includes financial information formatting

## Conclusion

This Relay implementation for Transactions follows best practices for building scalable and maintainable GraphQL applications. It maintains a clear separation of concerns, properly handles pagination, and provides a type-safe experience throughout the application.

By following the Relay patterns, we've created a system that:

1. **Declares Data Dependencies**: Each component declares exactly what data it needs
2. **Enables Efficient Fetching**: Only required data is fetched from the server
3. **Supports Pagination**: Seamlessly loads more data as needed
4. **Maintains Type Safety**: Full TypeScript integration throughout
5. **Improves Developer Experience**: Clear organization and separation of concerns
