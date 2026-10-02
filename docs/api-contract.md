# Hợp đồng API (Track SE)

## 1. Danh sách Endpoint

| **Phương thức** | **Đường dẫn**                      | **Mục đích**                  | **User Story**     |
|-----------------|------------------------------------|-------------------------------|--------------------|
| GET             | /api/customers?phone={phone}       | Tra cứu khách hàng theo SĐT   | US1                |
| POST            | /api/customers                     | Tạo khách hàng mới            | US2                |
| POST            | /api/tickets                       | Tạo phiếu bảo hành mới        | US3, US4, US5, US6 |
| PATCH           | /api/tickets/{id}/approve-warranty | Phê duyệt phiếu chưa xác minh | US4                |
| GET             | /api/tickets/{id}/status-log       | Xem lịch sử trạng thái phiếu  | US7                |

## 2. Quy ước chung

- Định dạng trao đổi: JSON (UTF-8). Header: Content-Type: application/json.

- Tên trường dùng snake_case, khớp đúng ERD.

- Múi giờ: ISO 8601 (VD: 2026-10-01T09:00:00+07:00).

- Cấu trúc lỗi chung: { "error": { "code": "...", "message": "...", "fields": {...} } }.

- Tiền tệ: không áp dụng ở luồng L2 (chưa có thanh toán).

- Phân trang: GET status-log nhận page (từ 1) và size (mặc định 20, tối đa 100); response kèm total.

## 3. Chi tiết Endpoint chính: POST /api/tickets

**Request body:**

```json
{
  "customer_id": 1024,
  "device_id": 3311,
  "center_id": 2,
  "issue_desc": "May sac khong vao, cam sac bao loi phu kien"
}
```

**Response 201 Created (Thành công):**

```json
{
  "ticket_id": 8801,
  "ticket_code": "BH-000123/2026",
  "status": "MOI",
  "is_warranty": true,
  "priority": "TRUNG_BINH",
  "category_id": 3,
  "due_date": "2026-10-05T09:00:00+07:00"
}
```

**Response 202 Accepted (Luồng chờ phê duyệt bảo hành):**

```json
{
  "ticket_id": 8801,
  "status": "CHO_PHE_DUYET",
  "message": "Khong xac dinh duoc ngay mua, can Quan ly phe duyet"
}
```

**Response 400 Bad Request (Lỗi validation):**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Du lieu khong hop le",
    "fields": { "issue_desc": "Truong bat buoc, khong duoc de trong" }
  }
}
```

Response 404 Not Found: customer_id hoặc device_id không tồn tại.

Response 409 Conflict: thiết bị đang có phiếu chưa đóng.

**PATCH /api/tickets/{id}/approve-warranty · Phê duyệt phiếu chờ xác minh · US4 (chỉ vai trò Quản lý)**

**Request body:**

```json
{
  "is_warranty": true,
  "note": "Da xac minh hoa don mua hang"
}
```

**Response 200 OK (Thành công):**

```json
{
  "ticket_id": 8801,
  "status": "MOI",
  "is_warranty": true
}
```

Response 400 Bad Request: is_warranty thiếu hoặc không phải true/false (error.code = VALIDATION_FAILED).

Response 403 Forbidden: người gọi không phải Quản lý trung tâm.

Response 404 Not Found: phiếu không tồn tại.

Response 409 Conflict: phiếu không ở trạng thái CHO_PHE_DUYET (QT-06, không lùi/nhảy trạng thái).

**Các endpoint còn lại — response thành công / response lỗi:**

GET /api/customers?phone= → 200: thông tin khách và danh sách thiết bị · 400: SĐT không đủ 10 chữ số sau chuẩn hóa (QT-02) · 404: SĐT chưa có (US1-AC2, FE mở form tạo mới).

POST /api/customers → 201: khách mới · 400: thiếu tên hoặc SĐT sai định dạng · 409: SĐT đã tồn tại (QT-01).

GET /api/tickets/{id}/status-log → 200: danh sách chuyển trạng thái theo thời gian · 403: vai trò không có quyền xem · 404: phiếu không tồn tại.

## 4. Bảng Validation (POST /api/tickets)

| **Trường**  | **Bắt buộc** | **Kiểu / ràng buộc**                       | **Thông báo lỗi**                      |
|-------------|--------------|--------------------------------------------|----------------------------------------|
| customer_id | Có           | Số nguyên dương, phải tồn tại              | Không tìm thấy khách hàng              |
| device_id   | Có           | Số nguyên dương, thuộc customer_id (QT-03) | Thiết bị không thuộc về khách hàng này |
| center_id   | Có           | Số nguyên dương, phải tồn tại              | Trung tâm không hợp lệ                 |
| issue_desc  | Có           | Chuỗi, 10–2000 ký tự                       | Mô tả lỗi phải có từ 10 đến 2000 ký tự |

## 5. Xác thực và phân quyền

- Mọi endpoint yêu cầu đăng nhập (header Authorization: Bearer \<token\>); thiếu hoặc hết hạn → 401 Unauthorized.

- Nhân viên tiếp nhận: GET/POST /api/customers, POST /api/tickets. Quản lý trung tâm: PATCH approve-warranty, GET status-log. Gọi sai vai trò → 403 Forbidden.

- Mỗi vai trò chỉ truy cập dữ liệu của trung tâm mình (QT-14); SĐT trong response bị che 4 chữ số giữa với vai trò khác Quản lý (NFR2).

## 6. Tự kiểm hợp đồng API

- Mỗi endpoint nối được về ít nhất một User Story.

- Mỗi endpoint có ít nhất một response thành công và hai response lỗi.

- Mọi trường trong request body tồn tại trong ERD.

- Không có endpoint thừa không phục vụ User Story nào.

- Quy tắc QT-03 (validation device_id), QT-04 (due_date), QT-05 (is_warranty / luồng 202), QT-01, QT-02, QT-06 đã xuất hiện trong validation hoặc mã lỗi.
