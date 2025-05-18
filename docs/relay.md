1: pointed schema to schema: '../server/schema/schema.graphql',
2: run npx relay-compiler
3: created user_login_mutation.ts and user_register_mutation.ts
4: created RelayProvider.tsx
5: wrapped layout.tsx with RelayProvider
6: integrated user_login_mutation.ts and user_register_mutation.ts into register and login pages
7: Verified that the mutations work - created new account and logged in

# Recompile
cd apps/web
npx relay-compiler

# Relay Integration Summary

## Overview

This project uses [Relay](https://relay.dev/) for efficient and type-safe data-fetching in the React frontend, leveraging a unified GraphQL schema.

## Key Steps Completed

### 1. Relay Environment Setup
- Created a custom Relay environment in `src/relay/environment.ts`.
- Provided the environment to the app using a `RelayProvider` client component, ensuring compatibility with Next.js app directory and server/client component boundaries.

### 2. GraphQL Schema Alignment
- Ensured the schema file (`apps/server/schema/schema.graphql`) matches the backend’s actual mutation/field names and casing.
- Synchronized mutation field names (e.g., `login`, `register`, `logout`) between backend resolvers, schema, and frontend queries.

### 3. Authentication Mutations
- Implemented Relay mutations for login and registration:
  - `src/app/login/user_login_mutation.ts`
  - `src/app/register/user_register_mutation.ts`
- Used correct input field names (`snake_case` as per schema, e.g., `first_name`, `last_name`).

### 4. Form Handling and Validation
- Used `react-hook-form` and `zod` for robust client-side form validation.
- Matched frontend validation with backend requirements (e.g., password length, required fields, CPF format).

### 5. Error Handling & Feedback
- Displayed backend and validation errors in the UI for both login and registration.
- Ensured clear user feedback for authentication failures.

### 6. Relay Artifacts & Configuration
- Configured [relay.config.js](cci:7://file:///Users/luisfaria/Desktop/sEngineer/lab/woovi-playground/apps/web/relay.config.js:0:0-0:0) to use the correct schema and artifact directory.
- Used `npx relay-compiler` to generate and update Relay artifacts after schema or query changes.

## Troubleshooting & Gotchas

- **Case Sensitivity:** GraphQL is case-sensitive. Always match mutation/query names exactly between backend, schema, and frontend.
- **Schema Sync:** If you change the backend schema, always update the schema file and re-run the Relay compiler.
- **Client/Server Boundaries:** Use a client component for Relay context provider in Next.js app directory projects.

## Useful Commands

```sh
# Compile Relay artifacts after schema or query changes
npx relay-compiler

# Regenerate schema (if needed)
npx get-graphql-schema http://localhost:4000/graphql > apps/server/schema/schema.graphql