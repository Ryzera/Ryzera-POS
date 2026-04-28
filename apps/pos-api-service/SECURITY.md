# Security Best Practices Documentation
## Ryzera POS — Authentication & User Management Module

---

## 1. Authentication

### JWT (JSON Web Token)
- All protected endpoints require a valid JWT token in the `Authorization` header
- Format: `Authorization: Bearer <token>`
- Token expiry: **8 hours** (`JWT_EXPIRES_IN=8h`)
- Tokens are signed with a secret key stored in environment variables

### Password Security
- Passwords are hashed using **bcrypt** with a salt round of **12**
- Plain text passwords are never stored in the database
- Password comparison is done using `bcrypt.compare()`

---

## 2. Authorization

### Role-Based Access Control (RBAC)
The system has the following roles:

| Role | Description |
|------|-------------|
| `ADMIN` | Full access to all endpoints |
| `MANAGER` | Can manage staff and view reports |
| `CASHIER` | Limited access to POS operations |

### Guards
- **JwtAuthGuard** — Verifies JWT token on every protected request
- **RolesGuard** — Checks if the user has the required role

---

## 3. API Security

### Public Endpoints (No Authentication Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login and get JWT token |

### Protected Endpoints (JWT Required)
| Method | Endpoint | Required Role |
|--------|----------|---------------|
| POST | `/auth/logout` | Any authenticated user |
| GET | `/auth/me` | Any authenticated user |
| POST | `/users` | ADMIN |
| GET | `/users` | ADMIN |
| GET | `/users/:id` | ADMIN |
| PATCH | `/users/:id` | ADMIN |
| PATCH | `/users/:id/role` | ADMIN |
| DELETE | `/users/:id` | ADMIN |
| GET | `/users/:id/logs` | ADMIN |

---

## 4. Account Security

### Account Locking
- Failed login attempts are tracked in `failed_login_attempts` field
- Account can be locked until `account_locked_until` datetime

### User Status
| Status | Description |
|--------|-------------|
| `ACTIVE` | User can login normally |
| `INACTIVE` | User is deactivated, cannot login |

---

## 5. Audit Logging

All user actions are logged in `ryzera_pos_user_log` table:

| Field | Description |
|-------|-------------|
| `action` | Action performed (LOGIN, LOGOUT, ROLE_ASSIGNED) |
| `status` | Result (SUCCESS, FAILED) |
| `ip_address` | Client IP address |
| `device_info` | User agent / device info |
| `timestamp` | When the action occurred |

---

## 6. Environment Variables

Store these securely — never commit to version control:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=your-strong-secret-key-here
JWT_EXPIRES_IN=8h
PORT=3002
```

### Best Practices for Environment Variables
- Use strong, random `JWT_SECRET` (minimum 32 characters)
- Never expose `.env` files in Git (add to `.gitignore`)
- Use different secrets for development and production

---

## 7. Security Checklist

- [x] Passwords hashed with bcrypt (salt rounds: 12)
- [x] JWT authentication implemented
- [x] Role-based access control
- [x] Audit logging for user actions
- [x] User status management (active/inactive)
- [x] Environment variables for sensitive data
- [x] `.env` files in `.gitignore`
- [ ] Rate limiting (recommended for production)
- [ ] HTTPS enforcement (recommended for production)
- [ ] Token refresh mechanism (recommended)

---

## 8. Recommendations for Production

1. **Rate Limiting** — Use `@nestjs/throttler` to prevent brute force attacks
2. **HTTPS** — Always use SSL/TLS in production
3. **Strong JWT Secret** — Use minimum 256-bit random secret
4. **Token Refresh** — Implement refresh tokens for better UX
5. **Input Validation** — All DTOs use `class-validator` decorators
6. **CORS** — Configure allowed origins properly