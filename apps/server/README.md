# Woovi Bank Server

This is the backend server for the Woovi Bank application, providing a GraphQL API for account and transaction management.

## Features

- GraphQL API with Relay support
- MongoDB integration for data storage
- Authentication and authorization
- Real-time subscriptions
- Complete CRUD operations for accounts and transactions

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB instance running
- Redis for subscriptions

### Installation

1. Install dependencies:
```
pnpm install
```

2. Configure environment:
```
pnpm config:local
```

3. Start the development server:
```
pnpm dev
```

The server will be available at `http://localhost:4000/graphql`.

## API Testing

### GraphQL Playground

A GraphQL Playground is available at `http://localhost:4000/playground`, providing an interactive environment to test queries and mutations.

### Postman Collection

A comprehensive Postman collection is included in this repository. You can import the `postman_collection.json` file into Postman to test all API endpoints.

For detailed instructions on using the GraphQL Playground and Postman collection, see [API_README.md](./API_README.md).

## API Overview

The API provides the following functionality:

- **Account Management**: Create, read, update, and calculate account balance
- **Transaction Processing**: Send and receive transactions between accounts
- **Authentication**: User registration, login, and token management

## Schema

The GraphQL schema is available in the `schema` directory. It defines:

- Query operations for retrieving data
- Mutation operations for modifying data
- Subscription operations for real-time updates
- Types and interfaces for data models

## Development

### Updating the Schema

After making changes to the schema, run:
```
pnpm schema
```

This will update the schema files and copy them to the web application. 