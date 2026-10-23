# Hệ thống Tiếp nhận và Phân loại Yêu cầu Bảo hành (SmartCRM - Mekong Mobile)

- **Sinh viên:** Đoàn Xuân Tiến
- **Mã sinh viên:** 2374802010493
- **Học phần:** Chuyên đề Tốt nghiệp 1 (HK1 2026-2027)
- **Track:** Software Engineering (SE)
- **Luồng nghiệp vụ:** L2 – Tiếp nhận và phân loại yêu cầu bảo hành

---

## 1. Mục tiêu Hệ thống

Hệ thống giúp số hóa quy trình tiếp nhận bảo hành, tra cứu thông tin khách hàng (`QT-01`, `QT-02`), xác minh hạn bảo hành thiết bị (`QT-05`), tự động phân loại sự cố (`FR5`) và tính toán thời gian giải quyết cam kết SLA (`QT-04`). Hệ thống giải quyết triệt để tình trạng trễ hạn, thất lạc phiếu và ngăn chặn việc tạo trùng phiếu bảo hành đối với thiết bị đang trong quá trình xử lý (`QT-09`).

---

## 2. Yêu cầu Môi trường

- **Runtime:** Node.js version `20.x LTS`
- **Cơ sở dữ liệu:** PostgreSQL `16.x`
- **Giao diện:** React (Vite)
- **Cấu hình môi trường:** Sao chép từ tệp `.env.example`

---

## 3. Cấu trúc Thư mục Dự án

```text
smartcrm-2374802010493-tiep-nhan-bao-hanh/
├── db/
├── docs/
│   ├── ai-disclosure.md        # Bảng khai báo sử dụng công cụ AI (BT2)
│   ├── srs.md                  # Tài liệu Đặc tả Yêu cầu Phần mềm (SRS)
│   └── thay-doi-thiet-ke.md     # Nhật ký thay đổi thiết kế (TD-01 -> TD-06)
├── migrations/
│   └── 001_create_tables.sql   # DDL 6 bảng chuẩn 3NF & Triggers bảo mật NFR4
├── seeds/
│   └── 001_seed_data.sql       # Dữ liệu khởi tạo mẫu (Khách hàng, Thiết bị, Nhóm lỗi)
├── src/
│   ├── frontend/               # Giao diện React (Vite) - 3 màn hình nghiệp vụ
│   │   ├── src/
│   │   │   ├── api/            # Tích hợp API gọi Backend
│   │   │   ├── components/     # Thành phần UI (DataState,...)
│   │   │   ├── hooks/          # Custom Hooks (useTickets)
│   │   │   └── pages/          # ReceiveDevicePage, TicketListPage, TicketDetailPage
│   │   └── package.json
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
│   └── app.js                  # Khởi chạy Express Server & Tích hợp Mock/DB
├── tests/
│   └── ticket.service.test.js  # Bộ Unit Test Cases tự động (TC01, TC02, TC03)
├── .env                        # Biến môi trường thực tế
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
Cài đặt cho cả Backend và Frontend:
```bash
npm install
```

### Bước 3: Khởi tạo Cơ sở dữ liệu PostgreSQL
Khởi tạo cấu trúc 6 bảng chuẩn 3NF và nạp dữ liệu mẫu:
```bash
# Thực thi script khởi tạo bảng và triggers
psql -U postgres -d smartcrm -f migrations/001_create_tables.sql

# Thực thi nạp dữ liệu mẫu
psql -U postgres -d smartcrm -f seeds/001_seed_data.sql
```

### Bước 4: Khởi chạy ứng dụng
- **Khởi chạy Backend Server:**
  ```bash
  node src/app.js
  ```
- **Khởi chạy Frontend (Development mode):**
  ```bash
  cd src/frontend
  npm run dev
  ```

Sau khi khởi chạy, hệ thống Frontend sẽ kết nối trực tiếp với API Backend để phục vụ 3 màn hình nghiệp vụ: **Tiếp nhận thiết bị**, **Danh sách phiếu** và **Chi tiết phiếu**.

---

## 5. Kết quả Kiểm thử Hệ thống (Unit Tests)

Thực thi bộ Unit Test tự động kiểm thử các logic nghiệp vụ tính hạn SLA (`QT-04`), kiểm tra bảo hành (`QT-05`) và chặn phiếu trùng (`QT-09`):
```bash
npm test
```

**Kết quả thực thi mẫu:**
```text
  PASS  smartcrm-2374802010493-tiep-nhan-bao-hanh/tests/ticket.service.test.js (5.78 s)
  TicketService Core Rules
    √ TC01 - Luồng đúng: Tạo phiếu bảo hành thành công cho thiết bị còn hạn (6 ms)
    √ TC02 - Giá trị biên (QT-05): Ngày cuối cùng còn bảo hành vs ngày đầu tiên hết hạn
    √ TC03 - Dữ liệu sai (QT-09): Thiết bị đã có phiếu đang mở thì bị từ chối với mã PHIEU_DANG_MO (4 ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        16.747 s
```

---

## 6. Trạng thái Phát triển Hiện tại

- [x] **Buổi 2:** Khởi tạo cấu trúc dự án, thiết lập kiểm thử khói (Smoke Test).
- [x] **Buổi 6 (BT1):** Hoàn thiện và nộp hồ sơ Phân tích & Thiết kế (SRS, ERD, Sơ đồ kiến trúc, Wireframe UI).
- [x] **Buổi 8 (BT1 Feedback):** Cập nhật Nhật ký thay đổi thiết kế (`TD-01` đến `TD-06`), chuẩn hóa CSDL còn 6 bảng.
- [x] **Buổi 8–10 (BT2):** Hiện thực hóa Module Cốt lõi tiếp nhận yêu cầu bảo hành, hoàn thiện kiến trúc 3 tầng độc lập, cài đặt Trigger NFR4 và viết bộ Unit Test cases.
- [x] **Buổi 10 (Sprint 1 Integration):** Tích hợp hoàn chỉnh Frontend React (Vite) với 3 màn hình chính gọi API thật, đạt chuẩn End-to-End.