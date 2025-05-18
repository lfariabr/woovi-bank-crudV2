# 1. JWT Authentication System
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
-- Log in to get a token (done)
-- Use the token for authenticated requests (done)
-- Test expiration of the token (done)
-- Verify old tokens become invalid after logout (done)
-- Add security headers (done)

# In Progress
-- Add Rate Limiting (leaky bucket)

# TODO
-- Add Password Reset
-- Add Email Verification

# Test transactions:
-- Verify proper error messages for insufficient balance
-- Confirm successful transactions

# Consider adding:
-- Password reset functionality
-- Email verification
-- Rate limiting for auth endpoints


# Step 1: Login
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { login(input: { email: \"test7@example.com\", password: \"test7test7\" }) { token account { id email } } }"
  }'

# Step 2: Get user info
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TOKEN]" \
  -d '{"query": "{ me { id email } }"}'

# Step 3: Logout
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { logout(input: { token: \"[TOKEN]\" }) { success } }"
  }'

# Step 4: Try to Get user info after logout
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TOKEN]" \
  -d '{"query": "{ me { id email } }"}'

# Step 5: See all blacklisted tokens
redis-cli -p 6381 KEYS "blacklist:*"

# Step 6: Check specific token (replace YOUR_TOKEN)
redis-cli -p 6381 GET "blacklist:[TOKEN]"


TOKEN=$(node -e "console.log(require('jsonwebtoken').sign({accountId: '6827fbf60eed6bf60501ed99'}, 'your_super_secure_secret_key_here_change_this_in_production', {expiresIn: 2}))") && echo "Token: $TOKEN" && sleep 10 && curl -X POST http://localhost:4000/graphql -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"query": "{ me { id email } }"}'