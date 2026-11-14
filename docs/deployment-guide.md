# Deployment Guide — SmartCRM: Warranty Request Intake & Classification

Student: Doan Xuan Tien (2374802010493) · Track: SE · Flow L2
Version: tag `v1.0`

Run the whole system with **two commands** from an empty folder:

```bash
cp .env.example .env
docker compose up -d --build
```

---

## 1. Requirements

| Item | Version used in testing |
|---|---|
| Docker Desktop (Engine + Compose v2) | 4.99.0 (Engine 29.9.3, Compose v5.7.0) |
| Git | any recent version |
| OS | Windows 11 with WSL 2 (Linux/macOS also work) |
| Free local port | **3000** (the API). Stop whatever uses it before starting. |

No local Node.js or PostgreSQL installation is needed; both run inside containers (`app`, `db`).

## 2. Setup steps

```bash
# 1. Clone the release tag into an empty folder
git clone --branch v1.0 https://github.com/doanxuantien2374802010493/smartcrm-2374802010493-tiep-nhan-bao-hanh.git
cd smartcrm-2374802010493-tiep-nhan-bao-hanh

# 2. Create the environment file (defaults in .env.example are enough to run)
cp .env.example .env        # Windows PowerShell: copy .env.example .env

# 3. Build and start (app + db)
docker compose up -d --build
```

On first start the `app` container waits for `db` to be healthy, then runs migrations `001` and `002` and loads the sample data automatically (visible in `docker compose logs app`).

To stop: `docker compose down`. To stop **and delete all data**: `docker compose down -v`.

## 3. Environment variables

Copy `.env.example` to `.env`. Do not commit `.env`.

| Variable | Purpose |
|---|---|
| `DB_HOST` | Database host (`db`, the compose service name) |
| `DB_PORT` | PostgreSQL port |
| `DB_NAME` | Database name |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password (placeholder value for local use only) |
| `PORT` | Port the API listens on (default 3000) |
| `JWT_SECRET` | Key used to sign login tokens (placeholder value for local use only) |
| `JWT_EXPIRES_IN` | Token lifetime |

The defaults in `.env.example` are enough to run the system locally; no value needs editing.

## 4. Sample data

Seed data is loaded automatically on first start (migration + seed step) and is idempotent: running it again does not duplicate rows.

| Table | Rows after seed |
|---|---|
| employee | 3 |
| customer | 3 |
| device | 4 |
| issue_category | 6 |
| ticket | 3 |
| ticket_status_log | 3 |

(Row counts observed on a clean clone after the seed ran twice; they do not change when the seed is re-run.)

To check the counts yourself (PowerShell):

```powershell
"select (select count(*) from employee) e, (select count(*) from customer) c, (select count(*) from device) d, (select count(*) from issue_category) ic, (select count(*) from ticket) t, (select count(*) from ticket_status_log) l;" | docker compose exec -T db sh -c 'psql -U $POSTGRES_USER -d $POSTGRES_DB'
```

Demo accounts (3 employees, two service centers):

| Username | Role / center | Password |
|---|---|---|
| `ql1` | Manager, center 1 | `Mekong@123` |
| `nv1` | Staff, center 1 | `Mekong@123` |
| `nv2` | Staff, center 2 | `Mekong@123` |

These accounts are for local development only.

Re-run the seed manually (safe to repeat):

```bash
docker compose exec app npm run db:setup
```

## 5. Verify it works

```bash
# 1. All services must show "healthy"
docker compose ps

# 2. Health endpoint
curl -s http://localhost:3000/api/health
# expected: {"status":"ok"}

# 3. Automated tests inside the container
docker compose exec app npm test
# expected: 4 suites, 35 tests, all passed
```

Expected result: `app` and `db` are `healthy`, the health endpoint returns `{"status":"ok"}`, and all 35 tests pass.

Optional: run the seed a second time (`docker compose exec app npm run db:setup`) and confirm the row counts in section 4 do not change.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `port is already allocated` on `up` | An old stack still holds port 3000 | `docker compose down`, or stop the other program using port 3000 |
| `app` exits with `getaddrinfo EAI_AGAIN db` after re-running `up` | Stale containers/network from a previous run | `docker compose down`, then `docker compose up -d --build` |
| Empty ticket list / `relation does not exist` | Database volume from an older run | `docker compose down -v`, then `docker compose up -d --build` |
| Need a full reset | | `docker compose down -v` |
## Known limitations

- **The React front end is not started by Docker Compose.** Compose starts only `db` and `app` (the API). To run the screens, use a second terminal: `cd src/frontend && npm ci && npm run dev` (http://localhost:5173, which forwards `/api` to port 3000). The checks in "Verify it works" cover the API only.
- **No API or screen to add a device record for a new customer.** A customer can be created (`POST /api/customers`), but devices exist only in the seed data. A ticket can be created only for an existing device (design change TD-12).
- **Ticket status never moves past `MOI`.** None of the 15 endpoints changes a ticket's status after creation; the status log holds only the creation entry. This prototype covers intake and classification only.
- **Demo accounts only.** Two users (`nv1` reception staff, `ql1` center manager) share one demo password from the seed data. Do not use them outside local development.
- **Local HTTP only.** No TLS and no production deployment; the Compose file is for local use.