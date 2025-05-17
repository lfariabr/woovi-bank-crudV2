1. JWT Authentication System
- Added auth.service.ts:
-- Implements JWT token generation/verification
-- Handles password hashing with bcryptjs
-- Validates user credentials

- New Mutations:
-- RegisterMutation.ts: Handles user registration
-- LoginMutation.ts: Handles user login with JWT token

2. Account Model & Type Updates
- accountModel.ts:
-- Changed balance from Decimal128 to Number for simplicity
-- Added password hashing pre-save hook
-- Added proper indexes for email and accountId
- accountType.ts:
-- Updated GraphQL types to match the model
-- Fixed null handling for the balance field

3. Transaction Service Fixes
- TransactionService.ts:
-- Improved error handling for insufficient balance
-- Added better error messages
-- Fixed retry logic to fail fast for business logic errors

4. Documentation & Examples
- Updated examples.graphql with new mutations
- Added MongoDB commands in mongoose.md for database management

5. Dependency Updates
- Added jsonwebtoken and bcryptjs
- Removed native bcrypt to avoid conflicts

# Key Improvements
- Better Error Handling:
-- More descriptive error messages
-- Proper error propagation in GraphQL
- Security:
-- Passwords are properly hashed
-- JWT tokens for authentication
- Sensitive fields excluded from responses
- Developer Experience:
-- Clearer error messages
-- Better type safety
-- Consistent API responses

# Next Steps
- Test the authentication flow:
-- Register a new user (done)
-- Log in to get a token ()
-- Use the token for authenticated requests

- Test transactions:
-- Verify proper error messages for insufficient balance
-- Confirm successful transactions

- Consider adding:
-- Password reset functionality
-- Email verification
-- Rate limiting for auth endpoints