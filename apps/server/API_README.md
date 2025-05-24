# Woovi Bank API Documentation

This document provides instructions for using the GraphQL Playground and Postman collection to test the Woovi Bank API.

## GraphQL Playground

GraphQL Playground is an interactive, graphical interface for testing GraphQL APIs. It provides a convenient way to explore the schema, write queries, and test mutations.

### Accessing GraphQL Playground

1. Start the server by running:
   ```
   pnpm dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:4000/playground
   ```

3. GraphQL Playground will load, allowing you to interact with the API.

### Using GraphQL Playground

1. **Explore the Schema**: Click the "SCHEMA" tab on the right side to view all available queries, mutations, and types.
2. **Write Queries/Mutations**: Write your GraphQL queries or mutations in the editor.
3. **Set Variables**: Use the "QUERY VARIABLES" panel at the bottom to define variables for your queries.
4. **Execute**: Click the "Play" button to execute the query.
5. **Authentication**: For authenticated requests, add an `Authorization` header:
   ```json
   {
     "Authorization": "Bearer YOUR_TOKEN_HERE"
   }
   ```

## Postman Collection

The included Postman collection provides pre-configured requests for all API operations.

### Importing the Collection

1. Open Postman
2. Click "Import" button
3. Select "File" and upload `postman_collection.json`
4. The "Woovi Bank API" collection will be imported

### Setting Up Environment Variables

1. Create a new environment in Postman
2. Add the following variables:
   - `baseUrl`: `http://localhost:4000` (or your server URL)
   - `authToken`: After logging in, set this to the token value

### Available Requests

#### Accounts
- List Accounts
- Create Account
- Update Account
- Register Account
- Login
- Get Account Balance

#### Transactions
- List Transactions
- Filter Transactions by Account
- Send Transaction
- Receive Transaction

### Authentication

For endpoints requiring authentication:
1. Execute the "Login" request
2. Copy the token from the response
3. Set the `authToken` environment variable to this value

## API Overview

The Woovi Bank API provides the following core functionality:

1. **Account Management**:
   - Create account
   - Update account details
   - View account information
   - Calculate account balance

2. **Transaction Processing**:
   - Send money between accounts
   - Receive money
   - View transaction history

3. **Authentication**:
   - Register new users
   - Login
   - Secure access to protected resources 