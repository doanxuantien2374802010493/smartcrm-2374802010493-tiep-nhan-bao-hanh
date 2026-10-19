# Hệ thống Tiếp nhận và Phân loại Yêu cầu Bảo hành (SmartCRM - Mekong Mobile)

* **Sinh viên:** Đoàn Xuân Tiến
* **Mã sinh viên:** 2374802010493
* **Học phần:** Chuyên đề Tốt nghiệp 1 (HK1 2026-2027)
* **Track:** Software Engineering (SE)
* **Luồng nghiệp vụ:** L2 – Tiếp nhận và phân loại yêu cầu bảo hành

---

## 1. Mục tiêu Hệ thống

Hệ thống giúp số hóa quy trình tiếp nhận bảo hành, tra cứu thông tin khách hàng (`QT-01`, `QT-02`), xác minh hạn bảo hành thiết bị (`QT-05`), tự động phân loại sự cố (`FR5`) và tính toán thời gian giải quyết cam kết SLA (`QT-04`). Hệ thống giải quyết triệt để tình trạng trễ hạn, thất lạc phiếu và ngăn chặn việc tạo trùng phiếu bảo hành đối với thiết bị đang trong quá trình xử lý (`QT-09`).

---

## 2. Yêu cầu Môi trường

* **Runtime:** Node.js version `20.x LTS`
* **Cơ sở dữ liệu:** PostgreSQL `16.x`
* **Cấu hình môi trường:** Sao chép từ tệp `.env.example`

---

## 3. Cấu trúc Thư mục Dự án

```text
smartcrm-2374802010493-tiep-nhan-bao-hanh/
├── docs/
│   ├── srs.md                  # Tài liệu Đặc tả Yêu cầu Phần mềm (SRS)
│   ├── thay-doi-thiet-ke.md    # Nhật ký thay đổi thiết kế (TD-01 -> TD-06)
│   └── ai-disclosure.md        # Bảng khai báo sử dụng công cụ AI (BT2)
├── migrations/
│   └── 001_create_tables.sql   # DDL 6 bảng chuẩn 3NF & Triggers bảo mật NFR4
├── seeds/
│   └── 001_seed_data.sql       # Dữ liệu khởi tạo mẫu (Khách hàng, Thiết bị, Nhóm lỗi)
├── src/
│   ├── errors/
│   │   └── AppError.js         # Lớp xử lý lỗi nghiệp vụ hệ thống
│   ├── validators/
│   │   └── ticket.validator.js # Tầng 1: Kiểm tra định dạng dữ liệu HTTP Request
│   ├── repositories/
│   │   ├── customer.repository.js
│   │   └── ticket.repository.js   # Tầng 3: Truy vấn CSDL / SQL thuần
│   ├── services/
│   │   └── ticket.service.js      # Tầng 2: Logic nghiệp vụ cốt lõi (QT-04, QT-05, QT-09)
│   ├── routes/
│   │   └── ticket.routes.js       # Tầng 1: Controller Express / Dịch mã lỗi HTTP
│   └── app.js                  # Khởi chạy Express Server
├── tests/
│   └── ticket.service.test.js  # Bộ 3 Unit Test Cases (TC01, TC02, TC03)
├── .env.example                # Mẫu khai báo biến môi trường
├── package.json
└── README.md                   # Tài liệu hướng dẫn hệ thống
```

---

## 4. Hướng dẫn Cài đặt & Khởi chạy

### Bước 1: Thiết lập biến môi trường
Tạo tệp `.env` từ tệp cấu hình mẫu và cập nhật các thông số kết nối CSDL:
```bash
cp .env.example .env
```

### Bước 2: Cài đặt các thư viện phụ thuộc
```bash
npm install
```

### Bước 3: Khởi tạo Cơ sở dữ liệu PostgreSQL
Khởi tạo cấu trúc 6 bảng chuẩn 3NF và nạp dữ liệu mẫu:
```bash
# Thực thi script khởi tạo bảng và triggers
psql -U postgres -d smartcrm -f migrations/001_create_tables.sql

# Thực thi nạp dữ liệu mẫu (nếu có)
psql -U postgres -d smartcrm -f seeds/001_seed_data.sql
```

### Bước 4: Khởi chạy ứng dụng
* **Chế độ phát triển (Development mode):**
  ```bash
  npm run dev
  ```
* **Chế độ sản xuất (Production mode):**
  ```bash
  npm start
  ```

Sau khi khởi chạy, kiểm tra sức khỏe hệ thống tại: `http://localhost:3000/health`

---

## 5. Kiểm thử Hệ thống (Unit Tests)

Thực thi bộ Unit Test kiểm thử các logic nghiệp vụ tính hạn SLA (`QT-04`), kiểm tra bảo hành (`QT-05`) và chặn phiếu trùng (`QT-09`):
```bash
npm test
```

---

## 6. Trạng thái Phát triển Hiện tại

- [x] **Buổi 2:** Khởi tạo cấu trúc dự án, thiết lập kiểm thử khói (Smoke Test).
- [x] **Buổi 6 (BT1):** Hoàn thiện và nộp hồ sơ Phân tích & Thiết kế (SRS, ERD, Sơ đồ kiến trúc, Wireframe UI).
- [x] **Buổi 8 (BT1 Feedback):** Cập nhật Nhật ký thay đổi thiết kế (`TD-01` đến `TD-06`), chuẩn hóa CSDL còn 6 bảng.
- [x] **Buổi 8–10 (BT2):** Hiện thực hóa Module Cốt lõi tiếp nhận yêu cầu bảo hành, hoàn thiện kiến trúc 3 tầng độc lập, cài đặt Trigger NFR4 và viết bộ 3 Unit Test cases.