# MCIT Agent — authentication & admin bootstrap

## Goals

- Private deployment for official MCIT data
- Email/password auth via Better Auth
- One-time **admin bootstrap** without leaving the first account to public signup luck
- Trusted origins include Alloy/preview hosts so sign-in cookies work behind the proxy

## Sign-in / sign-up fixes

Set in `docker-compose/mcit/.env`:

```bash
APP_URL=http://localhost:3210
# If you use Alloy preview on :8080:
# APP_URL=http://localhost:8080
INTERNAL_APP_URL=http://127.0.0.1:3210

# Always include every browser origin users will open:
AUTH_TRUSTED_ORIGINS=http://localhost:8080,http://127.0.0.1:8080,http://localhost:3210,http://127.0.0.1:3210,http://localhost:8502,http://127.0.0.1:8502

# Optional: disable public registration after admin exists
# AUTH_DISABLE_EMAIL_PASSWORD=0

# Captcha can block local/dev sign-up when no captcha provider is configured:
FEATURE_FLAGS=-auth_captcha,-market,-cloud_promotion
```

Source also trusts local preview origins in `src/libs/better-auth/utils/config.ts`.

## Admin bootstrap (professional gate)

1. Generate a long random token:

```bash
openssl rand -hex 32
```

2. Put it only on the server:

```bash
MCIT_ADMIN_BOOTSTRAP_TOKEN=<that-token>
```

3. Open `/admin` and create username + password (min 12 chars) + paste the token.
4. Sign in at `/signin`.
5. **Delete or rotate** `MCIT_ADMIN_BOOTSTRAP_TOKEN` so the gate closes.

API:

- `GET /webapi/mcit/admin/bootstrap` — whether bootstrap is enabled
- `POST /webapi/mcit/admin/bootstrap` — header `x-mcit-bootstrap-token`, body `{ username, email, password }`

Token comparison uses SHA-256 + `timingSafeEqual` (fail closed if env unset).

## Audit notes

| Control | Status |
|---------|--------|
| Passwords hashed by Better Auth (scrypt) | yes |
| Session cookies host-scoped | yes when APP_URL matches |
| Bootstrap token required | yes |
| Bootstrap disabled without token | yes |
| Public market/onboarding cloud calls | disable via FEATURE_FLAGS |
| Telemetry default off | `telemetry: false` + `TELEMETRY_DISABLED=1` |

Do **not** commit real bootstrap tokens or `.env` files.
