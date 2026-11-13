# API Documentation — SmartCRM: Warranty Request Intake & Classification

Student: Doan Xuan Tien (2374802010493) · Track: SE · Flow L2 · Version: tag `v1.0`

Base URL (local): `http://localhost:3000` · Format: JSON, UTF-8

All example requests and responses were captured from a real run of `scripts/api-run.ps1` against the seeded database (14 Nov 2026). Tokens are replaced by `<token>`. Where a response is shortened, the text says so. The endpoint list below has 15 endpoints, equal to the number of routes in `src/`.

## Conventions

- **Authentication.** Send `Authorization: Bearer <token>`. Get a token from endpoint 2. The token payload holds `employeeId`, `fullName`, `role`, `centerId`, `iat`, `exp`; it expires after 8 hours (`JWT_EXPIRES_IN=8h`).
- **Roles.** `NHAN_VIEN_TIEP_NHAN` (reception staff, demo user `nv1`) and `QUAN_LY` (center manager, demo user `ql1`). Demo password for both: `Mekong@123` (local development only).
- **Error format.** `{"error":{"code":"<CODE>","message":"<text>","fields":{...},"details":{...}}}`. `fields` appears for `VALIDATION_FAILED`; `details` appears for `PHONE_EXISTS`. Messages are in Vietnamese.
- **Request ID.** Every response carries an `X-Request-Id` header. An unexpected error returns `500 INTERNAL_ERROR` with a generic message and a lookup code; the stack trace stays in the server log.
- **Phone masking.** For `NHAN_VIEN_TIEP_NHAN`, phone numbers are masked (`090****567`). For `QUAN_LY` the full number is returned (`0901234567`).
- **Soft delete.** Deleting is a `POST .../soft-delete` that sets `is_deleted` to `true`; the row stays in the database. A soft-deleted customer is then answered with `404 CUSTOMER_NOT_FOUND`.
- **Pagination.** List endpoints take `page` and `size` (`size` is an integer from 1 to 100; the run shows a default of 20) and return `{"data":[...],"page":1,"size":20,"total":N}`.

## Endpoint index

| # | Method | Path | Token | Roles verified in the run |
|---|---|---|---|---|
| 1 | GET | `/api/health` | No | — |
| 2 | POST | `/api/auth/login` | No | — |
| 3 | GET | `/api/customers?phone=` | Yes | NHAN_VIEN_TIEP_NHAN |
| 4 | POST | `/api/customers` | Yes | NHAN_VIEN_TIEP_NHAN |
| 5 | GET | `/api/customers/:id` | Yes | NHAN_VIEN_TIEP_NHAN, QUAN_LY |
| 6 | PATCH | `/api/customers/:id` | Yes | NHAN_VIEN_TIEP_NHAN, QUAN_LY |
| 7 | POST | `/api/customers/:id/soft-delete` | Yes | NHAN_VIEN_TIEP_NHAN |
| 8 | GET | `/api/tickets` | Yes | NHAN_VIEN_TIEP_NHAN, QUAN_LY (filter `warranty_verified=false`: QUAN_LY only) |
| 9 | POST | `/api/tickets` | Yes | NHAN_VIEN_TIEP_NHAN |
| 10 | GET | `/api/tickets/:id` | Yes | NHAN_VIEN_TIEP_NHAN, QUAN_LY |
| 11 | PATCH | `/api/tickets/:id` | Yes | NHAN_VIEN_TIEP_NHAN, QUAN_LY |
| 12 | PATCH | `/api/tickets/:id/approve-warranty` | Yes | QUAN_LY only (NHAN_VIEN_TIEP_NHAN gets 403) |
| 13 | GET | `/api/tickets/:id/status-log` | Yes | QUAN_LY only (NHAN_VIEN_TIEP_NHAN gets 403) |
| 14 | POST | `/api/tickets/:id/soft-delete` | Yes | QUAN_LY only (NHAN_VIEN_TIEP_NHAN gets 403) |
| 15 | GET | `/api/issue-categories` | Yes | — |

## Error codes seen in the run

| HTTP | Code | Meaning |
|---|---|---|
| 400 | `VALIDATION_FAILED` | A field is missing or invalid; `fields` names it. |
| 401 | `UNAUTHORIZED` | No token (seen on `GET /api/tickets`). |
| 401 | `INVALID_CREDENTIALS` | Wrong password at login. |
| 403 | `FORBIDDEN` | The role is not allowed (message: only the center manager may do this). |
| 404 | `CUSTOMER_NOT_FOUND` | No such customer, or the customer is soft-deleted. |
| 404 | `TICKET_NOT_FOUND` | No such ticket. |
| 409 | `PHONE_EXISTS` | A customer with this phone already exists. |
| 409 | `WARRANTY_ALREADY_VERIFIED` | The ticket was already verified; it cannot be approved again. |
| 500 | `INTERNAL_ERROR` | Unexpected error; generic message plus a lookup code. |

## Ticket object

Returned by endpoints 8, 9, 10, 11 and 12. Fields: `ticket_id`, `ticket_code`, `device_id`, `category_id`, `center_id`, `issue_desc`, `priority` (`CAO`, `TRUNG_BINH`, `THAP`), `status` (`MOI` in every run response), `provided_purchase_date`, `is_warranty`, `warranty_verified`, `received_at`, `due_date`, `closed_at`, `is_deleted`, `device_name`, `serial_no`, `customer_id`, `customer_name`, `customer_phone`, `category_name`.

In the examples below, `NV` is a token of `nv1` and `QL` is a token of `ql1`, for example:

```bash
NV=$(curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"username":"nv1","password":"Mekong@123"}' | jq -r .token)
QL=$(curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"username":"ql1","password":"Mekong@123"}' | jq -r .token)
```

(On Windows PowerShell use `curl.exe` and escape the quotes; `scripts/api-run.ps1` does this.)

---

## 1. GET /api/health

**Description.** Liveness check used by the container healthcheck.
**Token / roles.** No token.
**Request.** No parameters.
**Success.** `200` with `{"status":"ok"}`.
**Errors.** None observed.

```bash
curl -i http://localhost:3000/api/health
```

```json
{"status":"ok"}
```

## 2. POST /api/auth/login

**Description.** Exchange a username and password for a JWT.
**Token / roles.** No token.
**Request.** Body: `username` (string), `password` (string).
**Success.** `200` with `token` and `user` (`employee_id`, `full_name`, `role`, `center_id`).
**Errors.** `401 INVALID_CREDENTIALS` for a wrong password.

```bash
curl -i -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"username":"nv1","password":"Mekong@123"}'
```

```json
{"token":"<token>","user":{"employee_id":2,"full_name":"Lê Văn Bình","role":"NHAN_VIEN_TIEP_NHAN","center_id":1}}
```

Error example (wrong password), `401`:

```json
{"error":{"code":"INVALID_CREDENTIALS","message":"Tên đăng nhập hoặc mật khẩu không đúng"}}
```

## 3. GET /api/customers?phone=

**Description.** Look up a customer by phone number and return the customer's devices.
**Token / roles.** Token required. Run as `NHAN_VIEN_TIEP_NHAN` (phone masked).
**Request.** Query: `phone`.
**Success.** `200` with `customer`, `devices` (`device_id`, `customer_id`, `device_name`, `serial_no`, `purchase_date`, `warranty_months`, `is_deleted`) and `warning` (`null` in the run).
**Errors.** `401 UNAUTHORIZED` without a token.

```bash
curl -i "http://localhost:3000/api/customers?phone=0901234567" -H "Authorization: Bearer $NV"
```

```json
{"customer":{"customer_id":1,"full_name":"Nguyễn Văn An","phone":"090****567","email":"an@example.com","is_deleted":false},"devices":[{"device_id":1,"customer_id":1,"device_name":"iPhone 13","serial_no":"SN-AN-0001","purchase_date":"2026-03-01","warranty_months":12,"is_deleted":false},{"device_id":2,"customer_id":1,"device_name":"Samsung Galaxy A54","serial_no":"SN-AN-0002","purchase_date":"2024-01-15","warranty_months":12,"is_deleted":false}],"warning":null}
```

## 4. POST /api/customers

**Description.** Create a customer.
**Token / roles.** Token required. Run as `NHAN_VIEN_TIEP_NHAN`.
**Request.** Body: `full_name` (required), `phone`, `email`.
**Success.** `201` with the customer (`customer_id`, `full_name`, `phone`, `email`, `is_deleted`).
**Errors.** `400 VALIDATION_FAILED` when `full_name` is missing (`fields.full_name`). `409 PHONE_EXISTS` when the phone is already used; `details.existing_customer` holds the existing customer.

```bash
curl -i -X POST http://localhost:3000/api/customers -H "Authorization: Bearer $NV" -H "Content-Type: application/json" -d '{"full_name":"Khach Thu API","phone":"0965838162","email":"thu@example.com"}'
```

```json
{"customer_id":13,"full_name":"Khach Thu API","phone":"096****162","email":"thu@example.com","is_deleted":false}
```

Duplicate phone, `409`:

```json
{"error":{"code":"PHONE_EXISTS","message":"Số điện thoại này đã có khách hàng","details":{"existing_customer":{"customer_id":13,"full_name":"Khach Thu API","phone":"096****162","email":"thu@example.com","is_deleted":false}}}}
```

Missing name, `400`:

```json
{"error":{"code":"VALIDATION_FAILED","message":"Dữ liệu không hợp lệ","fields":{"full_name":"Bắt buộc nhập họ tên"}}}
```

## 5. GET /api/customers/:id

**Description.** Get one customer.
**Token / roles.** Token required. `NHAN_VIEN_TIEP_NHAN` sees a masked phone; `QUAN_LY` sees the full phone.
**Request.** Path: `id` (positive integer).
**Success.** `200` with the customer object.
**Errors.** `400 VALIDATION_FAILED` when `id` is not a positive integer (`fields.id`). `404 CUSTOMER_NOT_FOUND`.

```bash
curl -i http://localhost:3000/api/customers/13 -H "Authorization: Bearer $QL"
```

```json
{"customer_id":13,"full_name":"Khach Thu API","phone":"0965838162","email":"thu@example.com","is_deleted":false}
```

`GET /api/customers/abc`, `400`:

```json
{"error":{"code":"VALIDATION_FAILED","message":"Dữ liệu không hợp lệ","fields":{"id":"Phải là số nguyên dương"}}}
```

`GET /api/customers/999999`, `404`:

```json
{"error":{"code":"CUSTOMER_NOT_FOUND","message":"Không tìm thấy khách hàng"}}
```

## 6. PATCH /api/customers/:id

**Description.** Update the name, phone or email of a customer.
**Token / roles.** Token required. Both `NHAN_VIEN_TIEP_NHAN` and `QUAN_LY` got `200`.
**Request.** Path: `id`. Body: at least one of `full_name`, `phone`, `email`.
**Success.** `200` with the updated customer.
**Errors.** `400 VALIDATION_FAILED` for an empty body (`fields.body`).

```bash
curl -i -X PATCH http://localhost:3000/api/customers/13 -H "Authorization: Bearer $QL" -H "Content-Type: application/json" -d '{"full_name":"Khach Thu API (sua)","email":"sua@example.com"}'
```

```json
{"customer_id":13,"full_name":"Khach Thu API (sua)","phone":"0965838162","email":"sua@example.com","is_deleted":false}
```

Empty body, `400`:

```json
{"error":{"code":"VALIDATION_FAILED","message":"Dữ liệu không hợp lệ","fields":{"body":"Cần ít nhất một trường: full_name, phone, email"}}}
```

## 7. POST /api/customers/:id/soft-delete

**Description.** Soft-delete a customer (sets `is_deleted` to `true`).
**Token / roles.** Token required. `NHAN_VIEN_TIEP_NHAN` got `200`.
**Request.** Path: `id`. No body.
**Success.** `200` with the customer and `is_deleted: true`.
**Errors.** `404 CUSTOMER_NOT_FOUND` when the customer does not exist or is already deleted (seen when `QUAN_LY` called it after `NHAN_VIEN_TIEP_NHAN` had deleted the customer).

```bash
curl -i -X POST http://localhost:3000/api/customers/13/soft-delete -H "Authorization: Bearer $NV"
```

```json
{"customer_id":13,"full_name":"Khach Thu API (sua)","phone":"096****162","email":"sua@example.com","is_deleted":true}
```

## 8. GET /api/tickets

**Description.** List warranty tickets, newest first by `ticket_id` order as returned in the run. With `warranty_verified=false` it lists tickets waiting for approval.
**Token / roles.** Token required. The plain list works for both roles. The filter `warranty_verified=false` works for `QUAN_LY` only (`NHAN_VIEN_TIEP_NHAN` gets `403`).
**Request.** Query: `page`, `size` (1–100), `warranty_verified` (only the value `false` is accepted).
**Success.** `200` with `{"data":[ticket,...],"page","size","total"}`.
**Errors.** `401 UNAUTHORIZED` without a token. `400 VALIDATION_FAILED` for `size=0` (`fields.size`) or `warranty_verified=true` (`fields.warranty_verified`). `403 FORBIDDEN` as described above.

```bash
curl -i "http://localhost:3000/api/tickets?page=1&size=2" -H "Authorization: Bearer $NV"
```

Response (shortened to the first ticket; the run returned 2 tickets, `total` 3):

```json
{"data":[{"ticket_id":1,"ticket_code":"BH-000001/2026","device_id":1,"category_id":1,"center_id":1,"issue_desc":"Màn hình bị sọc ngang","priority":"CAO","status":"MOI","provided_purchase_date":null,"is_warranty":true,"warranty_verified":true,"received_at":"2026-10-12T09:00:00+07:00","due_date":"2026-10-13T09:00:00+07:00","closed_at":null,"is_deleted":false,"device_name":"iPhone 13","serial_no":"SN-AN-0001","customer_id":1,"customer_name":"Nguyễn Văn An","customer_phone":"090****567","category_name":"MAN_HINH"}],"page":1,"size":2,"total":3}
```

Errors, `400` / `401` / `403`:

```json
{"error":{"code":"UNAUTHORIZED","message":"Bạn chưa đăng nhập"}}
{"error":{"code":"VALIDATION_FAILED","message":"Dữ liệu không hợp lệ","fields":{"size":"Phải là số nguyên từ 1 đến 100"}}}
{"error":{"code":"VALIDATION_FAILED","message":"Dữ liệu không hợp lệ","fields":{"warranty_verified":"Chỉ nhận giá trị false"}}}
{"error":{"code":"FORBIDDEN","message":"Chỉ Quản lý trung tâm được thực hiện thao tác này"}}
```

`GET /api/tickets?warranty_verified=false` as `QUAN_LY` returned `total: 1` (ticket 3, `warranty_verified: false`, `size: 20`).

## 9. POST /api/tickets

**Description.** Create a warranty ticket. The response shows the status `MOI`, the priority and the due date set by the system.
**Token / roles.** Token required. Run as `NHAN_VIEN_TIEP_NHAN`.
**Request.** Body fields used in the run: `device_id`, `category_id`, `issue_desc` (required, 10 to 2000 characters).
**Success.** `201` with the ticket object.
**Errors.** `400 VALIDATION_FAILED` for `issue_desc` shorter than 10 characters or missing (`fields.issue_desc`).

```bash
curl -i -X POST http://localhost:3000/api/tickets -H "Authorization: Bearer $NV" -H "Content-Type: application/json" -d '{"device_id":1,"category_id":1,"issue_desc":"Man hinh soc ngang, cam ung kem"}'
```

```json
{"ticket_id":4,"ticket_code":"BH-000004/2026","device_id":1,"category_id":1,"center_id":1,"issue_desc":"Man hinh soc ngang, cam ung kem","priority":"CAO","status":"MOI","provided_purchase_date":null,"is_warranty":true,"warranty_verified":true,"received_at":"2026-11-14T02:34:01+07:00","due_date":"2026-11-16T02:34:01+07:00","closed_at":null,"is_deleted":false,"device_name":"iPhone 13","serial_no":"SN-AN-0001","customer_id":1,"customer_name":"Nguyễn Văn An","customer_phone":"090****567","category_name":"MAN_HINH"}
```

Nine characters, `400`:

```json
{"error":{"code":"VALIDATION_FAILED","message":"Dữ liệu không hợp lệ","fields":{"issue_desc":"Mô tả lỗi phải có từ 10 đến 2000 ký tự"}}}
```

Missing `issue_desc`, `400`:

```json
{"error":{"code":"VALIDATION_FAILED","message":"Dữ liệu không hợp lệ","fields":{"issue_desc":"Trường bắt buộc, không được để trống"}}}
```

## 10. GET /api/tickets/:id

**Description.** Get one ticket.
**Token / roles.** Token required. Both roles got `200`; the phone is masked for `NHAN_VIEN_TIEP_NHAN` and full for `QUAN_LY`.
**Request.** Path: `id`.
**Success.** `200` with the ticket object.
**Errors.** `404 TICKET_NOT_FOUND`.

```bash
curl -i http://localhost:3000/api/tickets/4 -H "Authorization: Bearer $QL"
```

Response: the ticket of endpoint 9 with `"customer_phone":"0901234567"`.

`GET /api/tickets/999999`, `404`:

```json
{"error":{"code":"TICKET_NOT_FOUND","message":"Không tìm thấy phiếu bảo hành"}}
```

## 11. PATCH /api/tickets/:id

**Description.** Update `issue_desc`, `category_id` or `priority` of a ticket. When the priority changes, the due date is recalculated (in the run, `CAO` to `THAP` moved `due_date` from 16 Nov to 20 Nov).
**Token / roles.** Token required. Both `NHAN_VIEN_TIEP_NHAN` and `QUAN_LY` got `200`.
**Request.** Path: `id`. Body: at least one of `issue_desc`, `category_id`, `priority` (`CAO`, `TRUNG_BINH`, `THAP`).
**Success.** `200` with the updated ticket.
**Errors.** `400 VALIDATION_FAILED` for an invalid priority (`fields.priority`) or an empty body (`fields.body`).

```bash
curl -i -X PATCH http://localhost:3000/api/tickets/4 -H "Authorization: Bearer $QL" -H "Content-Type: application/json" -d '{"priority":"THAP"}'
```

Response (shortened to the changed fields; the other fields are as in endpoint 9, with `"customer_phone":"0901234567"`):

```json
{"ticket_id":4,"priority":"THAP","status":"MOI","due_date":"2026-11-20T02:34:01+07:00"}
```

Invalid priority, `400`:

```json
{"error":{"code":"VALIDATION_FAILED","message":"Dữ liệu không hợp lệ","fields":{"priority":"Phải là CAO, TRUNG_BINH hoặc THAP"}}}
```

Empty body, `400`:

```json
{"error":{"code":"VALIDATION_FAILED","message":"Dữ liệu không hợp lệ","fields":{"body":"Cần ít nhất một trường: issue_desc, category_id, priority"}}}
```

## 12. PATCH /api/tickets/:id/approve-warranty

**Description.** The center manager confirms whether a ticket is covered by warranty. It sets `warranty_verified` to `true` and `is_warranty` to the given value. A ticket can be approved once.
**Token / roles.** Token required. `QUAN_LY` only; `NHAN_VIEN_TIEP_NHAN` gets `403`.
**Request.** Path: `id`. Body: `is_warranty` (required, `true` or `false`).
**Success.** `200` with the updated ticket.
**Errors.** `400 VALIDATION_FAILED` when `is_warranty` is missing (`fields.is_warranty`). `403 FORBIDDEN`. `409 WARRANTY_ALREADY_VERIFIED` on the second call.

```bash
curl -i -X PATCH http://localhost:3000/api/tickets/3/approve-warranty -H "Authorization: Bearer $QL" -H "Content-Type: application/json" -d '{"is_warranty":true}'
```

```json
{"ticket_id":3,"ticket_code":"BH-000003/2026","device_id":3,"category_id":2,"center_id":1,"issue_desc":"Pin tụt nhanh, sạc không đầy","priority":"TRUNG_BINH","status":"MOI","provided_purchase_date":null,"is_warranty":true,"warranty_verified":true,"received_at":"2026-10-15T11:00:00+07:00","due_date":"2026-10-19T11:00:00+07:00","closed_at":null,"is_deleted":false,"device_name":"Xiaomi Redmi Note 12","serial_no":"SN-BICH-0001","customer_id":2,"customer_name":"Trần Thị Bích","customer_phone":"0912345678","category_name":"PIN"}
```

Second call, `409`:

```json
{"error":{"code":"WARRANTY_ALREADY_VERIFIED","message":"Phiếu này đã được xác minh bảo hành, không duyệt lại được"}}
```

Missing `is_warranty`, `400`:

```json
{"error":{"code":"VALIDATION_FAILED","message":"Dữ liệu không hợp lệ","fields":{"is_warranty":"Bắt buộc, là true hoặc false"}}}
```

## 13. GET /api/tickets/:id/status-log

**Description.** The status history of a ticket, with the employee who made each change.
**Token / roles.** Token required. `QUAN_LY` only; `NHAN_VIEN_TIEP_NHAN` gets `403`.
**Request.** Path: `id`. Query: `page`, `size`.
**Success.** `200` with `{"data":[{log_id, ticket_id, from_status, to_status, changed_by, changed_at, changed_by_name}],"page","size","total"}`.
**Errors.** `403 FORBIDDEN` for `NHAN_VIEN_TIEP_NHAN`.

```bash
curl -i "http://localhost:3000/api/tickets/3/status-log?page=1&size=10" -H "Authorization: Bearer $QL"
```

```json
{"data":[{"log_id":3,"ticket_id":3,"from_status":null,"to_status":"MOI","changed_by":2,"changed_at":"2026-10-15T11:00:00+07:00","changed_by_name":"Lê Văn Bình"}],"page":1,"size":10,"total":1}
```

A new ticket (ticket 4) has one log entry when created: `from_status: null`, `to_status: "MOI"`, `changed_by: 2`.

## 14. POST /api/tickets/:id/soft-delete

**Description.** Soft-delete a ticket.
**Token / roles.** Token required. `QUAN_LY` only; `NHAN_VIEN_TIEP_NHAN` gets `403`.
**Request.** Path: `id`. No body.
**Success.** `200` with `{"ticket_id":4,"is_deleted":true}`.
**Errors.** `403 FORBIDDEN` for `NHAN_VIEN_TIEP_NHAN`.

```bash
curl -i -X POST http://localhost:3000/api/tickets/4/soft-delete -H "Authorization: Bearer $QL"
```

```json
{"ticket_id":4,"is_deleted":true}
```

## 15. GET /api/issue-categories

**Description.** List the issue categories with their default priority.
**Token / roles.** Token required.
**Request.** No parameters.
**Success.** `200` with `{"data":[{category_id, category_name, default_priority, is_active}]}`.
**Errors.** `401 UNAUTHORIZED` without a token.

```bash
curl -i http://localhost:3000/api/issue-categories -H "Authorization: Bearer $NV"
```

```json
{"data":[{"category_id":1,"category_name":"MAN_HINH","default_priority":"CAO","is_active":true},{"category_id":2,"category_name":"PIN","default_priority":"TRUNG_BINH","is_active":true},{"category_id":3,"category_name":"SAC","default_priority":"TRUNG_BINH","is_active":true},{"category_id":4,"category_name":"PHAN_MEM","default_priority":"THAP","is_active":true},{"category_id":5,"category_name":"NUOC_VAO","default_priority":"CAO","is_active":true},{"category_id":6,"category_name":"KHAC","default_priority":"THAP","is_active":true}]}
```
