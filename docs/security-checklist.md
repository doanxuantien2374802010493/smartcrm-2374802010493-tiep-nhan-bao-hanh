# Security Checklist — SmartCRM: Warranty Request Intake & Classification

Student: Doan Xuan Tien (2374802010493) · Track: SE · Tag: `v1.0`

Status values: DONE / NOT DONE / NOT APPLICABLE.

| # | Item | Status | Evidence (one line) |
|---|---|---|---|
| 1 | No secrets in the repository | DONE | `git log --all --oneline -- .env` prints nothing (`.env` never committed); `.env` is ignored by `.gitignore`; `.env.example` holds placeholder values only. |
| 2 | Authentication | DONE | `src/services/auth.service.js` checks `bcryptjs.compare` against `password_hash`; wrong user and wrong password return the same `INVALID_CREDENTIALS`; JWT has an expiry (`JWT_EXPIRES_IN`); `tests/security.owasp.test.js`: missing, altered, expired and wrongly signed tokens all return 401. |
| 3 | Authorization (access control) | DONE | TC-09: staff of center 2 cannot GET, PATCH or soft-delete tickets of center 1 (4/4 PASS); staff calling `GET /api/tickets/:id/status-log` gets 403 `FORBIDDEN`. |
| 4 | Input validation | DONE | TC-05/TC-06: 9 characters rejected with 400, 10 accepted with 201; TC-08: invalid priority returns 400, not 500; validators in `src/validators/`. |
| 5 | Dependency vulnerabilities | DONE | BUG-005: `npm audit --omit=dev` went from 2 findings (body-parser high, qs moderate) to 0; `docs/screenshots/npm-audit-before.png`, `npm-audit-after.png`. |
| 6 | Safe error handling | DONE | Central handler `src/middleware/error-handler.js`: unexpected errors return a generic message plus `X-Request-Id`; the stack trace goes to the server log only; `docs/screenshots/error-response-400.png`. |
| 7 | Database not exposed to the host | DONE | `docker compose ps` shows `db` with `5432/tcp` only; only the app is published on 3000; `docs/screenshots/compose-ps-healthy.png`. |

## Known limitations

- `X-Powered-By: Express` header is sent.
- CORS is open to every origin (`cors()` with defaults).
- Demo accounts share one password (`Mekong@123`), for local development only.
- Plain HTTP on localhost, no HTTPS.
- No rate limiting on login.