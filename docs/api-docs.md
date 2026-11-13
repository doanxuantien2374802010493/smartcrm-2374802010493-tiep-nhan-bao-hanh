# API Documentation — SmartCRM: Warranty Request Intake & Classification

Base URL (local): `http://localhost:3000` · Format: JSON · Version: tag `v1.0`

## Conventions

- Field names are `snake_case`. Timestamps are ISO 8601 with `+07:00` (example: `2026-11-06T09:30:00+07:00`).
- List endpoints return `{ "data": [...], "page": n, "size": n, "total": n }` and accept `page` (integer from 1, default 1) and `size` (integer 1 to 100, default 20); invalid values return 400 `VALIDATION_FAILED` with `fields.page` or `fields.size`.
- Public endpoints (no token): `GET /api/health`, `POST /api/auth/login`. Every other endpoint requires a valid token (JWT). Send it as `Authorization: Bearer <token>`. The token payload carries `employee_id`, `full_name`, `role` and `center_id`; a missing, invalid or expired token returns 401 `UNAUTHORIZED`.
- Roles: `staff` = `NHAN_VIEN_TIEP_NHAN` (demo `nv1`, `nv2`), `manager` = Quản lý trung tâm (demo `ql1`).
- `:id` in a path must be a positive integer, otherwise 400 `VALIDATION_FAILED` with `fields.id`.
- No `DELETE` endpoints exist. "Delete" is a soft delete via `POST /:id/soft-delete`.
- Error body: `{ "error": { "code": "...", "message": "..." } }`. Validation errors add a `fields` object; other business errors may add `details`. Unknown `/api/...` paths return 404 `NOT_FOUND`. Every response carries an `X-Request-Id` header. System errors never expose internals (see Error codes).
- Phone numbers are masked in responses for staff (`090****567`); see the ticket and customer examples.

## Endpoint summary (15)

| # | Method | Path | Purpose | Token | Roles |
|---|---|---|---|---|---|
| 1 | GET | `/api/health` | Liveness check | no | public |
| 2 | POST | `/api/auth/login` | Log in, get token | no | public |
| 3 | GET | `/api/customers?phone=&name=` | Look up customer by phone | yes | <<VERIFY roles: nv1, ql1>> |
| 4 | POST | `/api/customers` | Create customer | yes | <<VERIFY roles>> |
| 5 | GET | `/api/customers/:id` | Get one customer | yes | <<VERIFY roles>> |
| 6 | PATCH | `/api/customers/:id` | Update customer | yes | <<VERIFY roles>> |
| 7 | POST | `/api/customers/:id/soft-delete` | Soft-delete customer | yes | <<VERIFY roles>> |
| 8 | GET | `/api/tickets` | List tickets (paged); `?warranty_verified=false` lists tickets awaiting verification | yes | <<VERIFY: nv1 and ql1 for list; who may use warranty_verified=false>> |
| 9 | POST | `/api/tickets` | Create ticket | yes | <<VERIFY roles>> |
| 10 | GET | `/api/tickets/:id` | Get one ticket (flat object, no `data` wrapper) | yes | staff and manager of the ticket's center; other center gets 403 |
| 11 | PATCH | `/api/tickets/:id` | Update ticket (only while status is `MOI`) | yes | <<VERIFY roles>> |
| 12 | PATCH | `/api/tickets/:id/approve-warranty` | Manager approves warranty verification | yes | <<VERIFY: nv1 gets 403, ql1 succeeds>> |
| 13 | GET | `/api/tickets/:id/status-log` | Status history of a ticket (paged) | yes | manager only (staff gets 403 `FORBIDDEN`) |
| 14 | POST | `/api/tickets/:id/soft-delete` | Soft-delete ticket | yes | <<VERIFY roles>> |
| 15 | GET | `/api/issue-categories` | List issue categories | yes | any logged-in user |

## Endpoint details

Every endpoint below has the same seven items: description, auth, request, success, errors, example request, example response. Example responses are copied from a real run on a clean clone (`scripts/api-run.ps1`, account `nv1` or `ql1`); long lists are marked "shortened".

### 1. GET /api/health

- Description: liveness check.
- Auth: none.
- Request: no parameters.
- Success: 200 `{"status":"ok"}`.
- Errors: none expected. If the process is down the connection is refused.
- Example request: `curl.exe -s http://localhost:3000/api/health`
- Example response: `{"status":"ok"}` (screenshot `docs/screenshots/health-ok.png`)

### 2. POST /api/auth/login

- Description: authenticate an employee and return a token.
- Auth: none.
- Request body: `{ "username": "<string>", "password": "<string>" }`, both required.
- Success: 200 `{ "token": "<JWT>", "user": { "employee_id", "full_name", "role", "center_id" } }`.
- Errors: 400 `VALIDATION_FAILED` (missing field, adds `fields`); 401 `INVALID_CREDENTIALS` (wrong username or password, same message for both).
- Example request: `curl.exe -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"nv1\",\"password\":\"Mekong@123\"}"`
- Example response (success, `nv1`):

```json
{"token":"eyJhbGciOi...(truncated)","user":{"employee_id":2,"full_name":"Lê Văn Bình","role":"NHAN_VIEN_TIEP_NHAN","center_id":1}}
```

Example response (empty body, 400):

```json
{"error":{"code":"VALIDATION_FAILED","message":"Dữ liệu không hợp lệ","fields":{"username":"Bắt buộc nhập tên đăng nhập","password":"Bắt buộc nhập mật khẩu"}}}
```

### 3. GET /api/customers?phone=&name=

- Description: look up a customer by phone, with their devices. `name` is optional and used to cross-check.
- Auth: token. Roles: <<VERIFY>>.
- Request: query `phone` (required; 10 digits starting with 0), `name` (optional).
- Success: 200 `{ "customer": {...}, "devices": [...] }`.
- Errors: 400 `VALIDATION_FAILED` (`fields.phone` missing or bad format); 404 `CUSTOMER_NOT_FOUND`; 401 `UNAUTHORIZED`.
- Example request: `GET /api/customers?phone=0901234567` with `Authorization: Bearer <token>`.
- Example response (200, device list shortened):

```json
{
  "customer": { "customer_id": 1, "full_name": "Nguyễn Văn An", "phone": "090****567", "email": "an@example.com", "is_deleted": false },
  "devices": [
    { "device_id": 1, "customer_id": 1, "device_name": "iPhone 13", "serial_no": "SN-AN-0001", "purchase_date": "2026-03-01", "warranty_months": 12, "is_deleted": false }
  ]
}
```

```json
// phone=0999999999 -> 404
{"error":{"code":"CUSTOMER_NOT_FOUND","message":"Chưa có khách hàng với số điện thoại này"}}
// phone=123 -> 400
{"error":{"code":"VALIDATION_FAILED","message":"Dữ liệu không hợp lệ","fields":{"phone":"Số điện thoại phải đủ 10 chữ số, bắt đầu bằng 0"}}}
```

### 4. POST /api/customers

- Description: create a customer.
- Auth: token. Roles: <<VERIFY>>.
- Request body: `full_name` (required, max 120), `phone` (required; format and duplicate checks in the service), `email` (optional, must look like an email).
- Success: 201 with the created customer.
- Errors: 400 `VALIDATION_FAILED`; 409 `PHONE_EXISTS` (duplicate phone); 401 `UNAUTHORIZED`.
- Example request: `{ "full_name": "<<name>>", "phone": "<<phone>>", "email": "<<email>>" }`
- Example response: <<PASTE real 201 body from api-run-output.txt, section "04 customers create">>
- Error example: <<PASTE real 409 body, section "04 customers create trung SDT">>

### 5. GET /api/customers/:id

- Description: get one customer.
- Auth: token. Roles: <<VERIFY with nv1 and ql1>>.
- Request: path `:id`.
- Success: 200 <<PASTE: shape>>.
- Errors: 400 (bad id); 404 `CUSTOMER_NOT_FOUND`; 401.
- Example request: `GET /api/customers/<<id>>`
- Example response: <<PASTE real 200, section "05 customers get">>

### 6. PATCH /api/customers/:id

- Description: update a customer.
- Auth: token. Roles: <<VERIFY with nv1 and ql1>>.
- Request body: at least one of `full_name` (not blank, max 120), `phone` (not blank), `email` (valid email, or blank/null to clear). Empty body returns 400 with `fields.body`.
- Success: 200 <<PASTE: shape>>.
- Errors: 400 `VALIDATION_FAILED`; 404 `CUSTOMER_NOT_FOUND`; 409 `PHONE_EXISTS`; 401.
- Example request: `{ "email": "<<email>>" }`
- Example response: <<PASTE real 200, section "06 customers patch">>

### 7. POST /api/customers/:id/soft-delete

- Description: soft-delete a customer (sets `is_deleted`; the row is kept).
- Auth: token. Roles: <<VERIFY with nv1 and ql1>>.
- Request: path `:id`, no body.
- Success: <<PASTE status and shape>>.
- Errors: 400 (bad id); 404 `CUSTOMER_NOT_FOUND`; 401.
- Example request: `POST /api/customers/<<id>>/soft-delete`
- Example response: <<PASTE real response, section "07 customers soft-delete">>

### 8. GET /api/tickets

- Description: list tickets, paged. `?warranty_verified=false` lists tickets awaiting manager verification.
- Auth: token. Roles: staff and manager can list (verified with `nv1`); <<VERIFY who may use `warranty_verified=false`: sections "08 tickets cho duyet ql/nv">>.
- Request: query `page`, `size`, `warranty_verified` (only `false` is accepted; any other value returns 400).
- Success: 200 `{ "data": [...], "page", "size", "total" }`.
- Errors: 400 `VALIDATION_FAILED`; 403 `FORBIDDEN` <<VERIFY>>; 401.
- Example request: `GET /api/tickets?page=1&size=2`
- Example response (200, one ticket shown):

```json
{
  "data": [
    {
      "ticket_id": 3, "ticket_code": "BH-000003/2026", "device_id": 3, "category_id": 2, "center_id": 1,
      "issue_desc": "Pin tụt nhanh, sạc không đầy", "priority": "TRUNG_BINH", "status": "MOI",
      "provided_purchase_date": null, "is_warranty": false, "warranty_verified": false,
      "received_at": "2026-10-15T11:00:00+07:00", "due_date": "2026-10-19T11:00:00+07:00", "closed_at": null,
      "is_deleted": false, "device_name": "Xiaomi Redmi Note 12", "serial_no": "SN-BICH-0001",
      "customer_id": 2, "customer_name": "Trần Thị Bích", "customer_phone": "091****678", "category_name": "PIN"
    }
  ],
  "page": 1, "size": 2, "total": 3
}
```

### 9. POST /api/tickets

- Description: create a warranty ticket and its first status-log row in one transaction.
- Auth: token. Roles: <<VERIFY>>.
- Request body: `customer_id` (required, positive integer), `device_id` (required, positive integer), `issue_desc` (required, 10 to 2000 chars), `provided_purchase_date` (optional, `YYYY-MM-DD`). `center_id` comes from the token, never from the body.
- Success: 201 with the created ticket.
- Errors: 400 `VALIDATION_FAILED` (9 characters rejected, 10 accepted: TC-05/TC-06; missing `issue_desc` returns `fields.issue_desc`); 404 `CUSTOMER_NOT_FOUND` or `DEVICE_NOT_FOUND`; 401.
- Example request: `{ "customer_id": 1, "device_id": 1, "issue_desc": "Màn hình bị sọc ngang, cảm ứng kém" }`
- Example response: <<PASTE real 201 body, section "09 tickets create">>
- Error example: <<PASTE real 400 body, section "09 tickets create 9 ky tu">>

### 10. GET /api/tickets/:id

- Description: get one ticket (flat object, no `data` wrapper).
- Auth: token. Staff and manager of the ticket's own center.
- Request: path `:id`.
- Success: 200, same fields as one item of the ticket list.
- Errors: 400 (bad id); 403 `FORBIDDEN` (ticket belongs to another center, TC-09); 404 `TICKET_NOT_FOUND`; 401.
- Example request: `GET /api/tickets/3`
- Example response: <<PASTE real 200, section "10 tickets get nv">>

```json
// nv2 (center 2) reading ticket 3 -> 403
{"error":{"code":"FORBIDDEN","message":"Phiếu này thuộc trung tâm khác, bạn không có quyền truy cập"}}
```

### 11. PATCH /api/tickets/:id

- Description: update a ticket, only while it is still new (`MOI`).
- Auth: token. Roles: <<VERIFY with nv1 and ql1>>.
- Request body: at least one of `issue_desc` (10 to 2000), `category_id` (positive integer or `null`), `priority` (`CAO`, `TRUNG_BINH`, `THAP`). Empty body returns 400 with `fields.body`.
- Success: 200 <<PASTE: shape>>.
- Errors: 400 `INVALID_PRIORITY` or `VALIDATION_FAILED` (TC-08, never 500); 403 `FORBIDDEN` (other center); 404 `TICKET_NOT_FOUND`; 409 `TICKET_NOT_EDITABLE`; 401.
- Example request: `{ "priority": "CAO" }`
- Example response: <<PASTE real 200, section "11 tickets patch">>
- Error example: <<PASTE real 400, section "11 tickets patch priority sai">>

### 12. PATCH /api/tickets/:id/approve-warranty

- Description: the manager of the ticket's center approves a warranty that could not be verified automatically (`warranty_verified` becomes true).
- Auth: token. Manager only: <<VERIFY: nv1 gets 403, ql1 succeeds; sections "12 approve">>.
- Request body: `is_warranty` (required, boolean), `note` (optional, string, max 500).
- Success: 200 <<PASTE: shape>>.
- Errors: 400 `VALIDATION_FAILED`; 403 `FORBIDDEN`; 404 `TICKET_NOT_FOUND`; 409 `WARRANTY_ALREADY_VERIFIED` (second approval); 401.
- Example request: `{ "is_warranty": true, "note": "<<note>>" }`
- Example response: <<PASTE real 200, section "12 approve ql lan 1">>
- Error examples: <<PASTE real 403 (nv) and 409 (second call)>>

### 13. GET /api/tickets/:id/status-log

- Description: status history of a ticket, oldest first or as the API returns it <<VERIFY order>>.
- Auth: token. Manager only; staff gets 403.
- Request: path `:id`, query `page`, `size`.
- Success: 200 `{ "data": [...], "page", "size", "total" }`.
- Errors: 400; 403 `FORBIDDEN`; 404 `TICKET_NOT_FOUND`; 401.
- Example request: `GET /api/tickets/3/status-log` as `ql1`.
- Example response (200): <<PASTE real 200, section "13 status-log ql">>

```json
// nv1 (staff) -> 403
{"error":{"code":"FORBIDDEN","message":"Chỉ Quản lý trung tâm được thực hiện thao tác này"}}
```

### 14. POST /api/tickets/:id/soft-delete

- Description: soft-delete a ticket (`is_deleted`; no physical delete, NFR4).
- Auth: token. Roles: <<VERIFY with nv1 and ql1>>.
- Request: path `:id`, no body.
- Success: <<PASTE status and shape>>.
- Errors: 400; 403 `FORBIDDEN` (other center, TC-09); 404 `TICKET_NOT_FOUND`; 401.
- Example request: `POST /api/tickets/<<id>>/soft-delete`
- Example response: <<PASTE real response, section "14 tickets soft-delete">>

### 15. GET /api/issue-categories

- Description: list issue categories. Defined in `src/app.js`, no paging.
- Auth: token, any logged-in user (verified with `nv1`).
- Request: no parameters.
- Success: 200 `{ "data": [...] }`.
- Errors: 401.
- Example request: `GET /api/issue-categories`
- Example response (200, shortened):

```json
{ "data": [
  { "category_id": 2, "category_name": "PIN", "default_priority": "TRUNG_BINH", "is_active": true },
  { "category_id": 5, "category_name": "NUOC_VAO", "default_priority": "CAO", "is_active": true }
] }
```

## Error codes

All errors use `{ "error": { "code", "message" } }`.

| HTTP | `code` | When |
|---|---|---|
| 400 | `VALIDATION_FAILED` | Missing/invalid field, bad id or paging, body is not valid JSON (adds `fields`) |
| 400 | `INVALID_PRIORITY` | Priority value not allowed (TC-08) |
| 401 | `UNAUTHORIZED` | No token, invalid or expired token (TC-10) |
| 401 | `INVALID_CREDENTIALS` | Wrong username or password at login |
| 403 | `FORBIDDEN` | Role not allowed, or the ticket belongs to another service center (TC-09) |
| 404 | `CUSTOMER_NOT_FOUND`, `DEVICE_NOT_FOUND`, `TICKET_NOT_FOUND`, `CATEGORY_NOT_FOUND` | Resource does not exist |
| 404 | `NOT_FOUND` | Unknown `/api/...` path |
| 409 | `PHONE_EXISTS` | Customer phone already registered |
| 409 | `WARRANTY_ALREADY_VERIFIED` | Ticket already approved |
| 409 | `TICKET_NOT_EDITABLE` | Ticket state does not allow editing |
| 503 | `DB_UNAVAILABLE` | Database unreachable |
| 500 | `INTERNAL_ERROR` | Unexpected server error. Generic message plus a lookup code (`X-Request-Id`); stack trace is logged on the server only. |
