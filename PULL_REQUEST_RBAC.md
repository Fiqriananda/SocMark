## 📌 Pull Request: Implement Dynamic RBAC, Role Switching & Onboarding Backend

### 🏷️ PR Metadata
- **Branch**: `feat/15-RBAC-SYSTEM` ➔ `development`
- **Epic**: `#1: Multi-Entity Authentication & Profiling`
- **Feature Code**: `#1.2 Dynamic RBAC & Role Switching`, `#1.3 Creator Onboarding`, `#1.4 Merchant KYC`
- **Type**: `Architecture & Feature Implementation`
- **Priority**: `P0 (Critical / Blocker for Phase 1)`

---

### 📝 Description & Context
In the SocMark (Social Marketplace) ecosystem, a single account entity (`users`) is not restricted to one account type. A user can hold multiple roles simultaneously (e.g., an active *Merchant* who also produces video content as a *Content Creator*, while remaining an active shopper as a *Buyer*).

This Pull Request implements the core backend infrastructure for:
1. **Many-to-Many Database Schema (`users` ↔ `roles`)** along with onboarding and KYC models.
2. **Auto-Assign Default Role (`REGULAR_USER`)** during user registration.
3. **Context-Aware RBAC Middleware/Guard** powered by the `X-Active-Role` HTTP header to safeguard role-specific endpoints.
4. **Dynamic Role Switcher Endpoints** allowing instant 1-click role/context switching without requiring user re-authentication.
5. **AES-256-GCM Encryption Service** to protect sensitive PII (ID Card / NIK and Bank Account numbers) at rest.
6. **Creator Onboarding & Merchant KYC Submission Endpoints**.

---

### 🛠️ Key Changes & Implementation Details

#### 1. Database Schema & Prisma Migrations (`backend/prisma/`)
- Introduced new models and relationships in `schema.prisma`:
  - `roles`: Master roles table (`REGULAR_USER`, `CONTENT_CREATOR`, `MERCHANT`, `ADMIN`).
  - `user_roles`: Many-to-Many junction table with composite uniqueness `@@unique([userId, roleId])`, `status` (`ACTIVE`, `PENDING_VERIFICATION`, `SUSPENDED`), and `metadata JSONB`.
  - `merchant_kyc`: Legal store verification application table (AES-256 encrypted ID card, encrypted bank account, warehouse address coordinates, status `PENDING/APPROVED/REJECTED`).
  - `creator_profiles`: Content creator profile table (content niches, social links, portfolio URL, status `APPROVED`).
- Created a database seeder for master roles in `backend/prisma/seed.ts`.

#### 2. Base Auth Hardening & Auto-Assign Hook (`backend/src/auth/`)
- Updated `AuthService.register()`: Automatically creates and links an active `REGULAR_USER` role in `user_roles` for newly registered users.
- Updated `AuthService.login()`: The generated JWT payload now includes active `roles` and the initial `activeRole`.

#### 3. Security, Cryptography & RBAC Guard (`backend/src/common/`)
- **`EncryptionService` (`aes-256-gcm`)**: Encrypts and decrypts sensitive PII using random 96-bit IVs and authentication tags formatted as `iv:authTag:ciphertext`.
- **`RbacGuard`**:
  - Validates Bearer JWT tokens.
  - Extracts the requested role from the `X-Active-Role` header.
  - Verifies that the user holds an `ACTIVE` role in `user_roles`.
  - Enforces route restrictions annotated with `@Roles(...)`. Rejects unauthorized requests with `403 Forbidden` (`INSUFFICIENT_ROLE_PERMISSIONS`).
  - Injects `req.activeRole` and store context (`req.storeId`) into the request handler.
- **Custom Decorators**:
  - `@Roles(...)`: Route role protection decorator.
  - `@ActiveRole()`: Parameter decorator to extract the verified active role.
  - `@CurrentUser()`: Parameter decorator to extract authenticated user claims.

#### 4. RBAC & Onboarding API Endpoints (`backend/src/rbac/`)
- `GET /api/v1/me/roles`: Returns all assigned roles for the user and identifies the current active role context.
- `POST /api/v1/me/switch-role`: Validates the target role and issues a new JWT access token reflecting the updated `activeRole`.
- `POST /api/v1/onboarding/creator`: Submits creator profile data and activates the `CONTENT_CREATOR` role.
- `POST /api/v1/onboarding/merchant/kyc`: Encrypts sensitive legal/bank details and creates a `MERCHANT` role marked as `PENDING_VERIFICATION`.
- **Protected Sample Endpoints**:
  - `POST /api/v1/posts` (guarded for `CONTENT_CREATOR` & `MERCHANT`).
  - `POST /api/v1/products` (guarded for `MERCHANT`).
  - `GET /api/v1/merchant/dashboard` (guarded for `MERCHANT`).

---

### 🧪 Automated Testing & Verification

All automated unit tests pass via Vitest (`npm run test`):
```bash
 ✓ src/common/crypto/encryption.service.spec.ts (2 tests)
 ✓ src/rbac/rbac.service.spec.ts (5 tests)
 ✓ src/common/guards/rbac.guard.spec.ts (5 tests)
 ✓ src/auth/auth.service.spec.ts (1 test)
 ✓ src/auth/auth.controller.spec.ts (1 test)
 ✓ src/app.controller.spec.ts (1 test)

Test Files  6 passed (6)
     Tests  15 passed (15)
```
- Backend Linter (`npm run lint` / oxlint): **0 errors**.

---

### ✅ Reviewer Checklist

- [x] Many-to-Many `users` ↔ `roles` database schema properly structured and migrated.
- [x] New user registration automatically assigns `REGULAR_USER` role with `ACTIVE` status.
- [x] API requests with unauthorized `X-Active-Role` headers are rejected with `403 Forbidden`.
- [x] Role switching via `POST /api/v1/me/switch-role` returns updated JWT session and store context.
- [x] Sensitive KYC data (ID Card number, bank account) is encrypted using AES-256-GCM.
- [x] All unit test suites pass (15/15 tests).
- [x] Zero regressions to existing authentication features (login, register, forgot/reset password).
