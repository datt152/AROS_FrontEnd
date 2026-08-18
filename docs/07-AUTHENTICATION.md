# Authentication and Security

## Flow

```text
Login
  ↓
Receive authentication credentials/tokens
  ↓
Store according to security strategy
  ↓
Authenticated API request
  ↓
401
  ↓
Refresh authentication
  ↓
Retry original request
  ↓
If refresh fails → logout
```

## Security principles

Frontend route protection is NOT authorization.

The backend remains authoritative.

Never:
- trust role information from the UI alone
- expose secrets in frontend source
- store sensitive long-lived credentials in unsafe browser storage without evaluating the threat model
- treat hidden buttons as access control

## Token storage

Preferred browser strategy, where backend architecture allows it:

- Short-lived access token kept in memory.
- Refresh token handled with secure, HttpOnly, SameSite cookie.
- Frontend JavaScript should not need direct access to the refresh token.

If the backend currently requires another token arrangement, document the exact constraint rather than silently changing it.

## Axios interceptor

Responsibilities:
- attach access token
- detect 401
- perform refresh once
- retry queued/original request
- prevent refresh loops
- logout when refresh fails

Avoid multiple concurrent refresh requests.

## Route protection

Use:

```text
ProtectedRoute
RoleRoute
```

Responsibilities:
- authenticated route
- role-aware navigation
- redirect UX

They must not implement backend authorization rules.

## Logout

Logout should:
1. clear client auth state
2. clear sensitive local state
3. clear relevant TanStack Query cache
4. navigate to login
5. call backend logout/revocation endpoint when provided

## Token expiration

The frontend should gracefully handle:
- expired access token
- refresh failure
- revoked session
- network errors

Do not build complicated token logic in individual features.

Authentication is infrastructure.
