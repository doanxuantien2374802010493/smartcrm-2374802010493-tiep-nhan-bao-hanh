# Hệ thống Tiếp nhận và Phân loại Yêu cầu Bảo hành (SmartCRM - Mekong Mobile)

- **Sinh viên:** Đoàn Xuân Tiến · **MSSV:** 2374802010493
- **Học phần:** Chuyên đề Tốt nghiệp 1 (HK1 2026-2027) · **Track:** SE · **Luồng:** L2 – Tiếp nhận và phân loại yêu cầu bảo hành
- **Phiên bản nộp:** tag `v1.0` (Bài tập 3)

## 1. Mục tiêu hệ thống

Số hóa quy trình tiếp nhận bảo hành: tra cứu và tạo khách hàng (QT-01, QT-02), kiểm tra thiết bị thuộc về khách (QT-03), tính hạn cam kết theo mức ưu tiên (QT-04), xác minh còn bảo hành hay không (QT-05), ghi lịch sử trạng thái chỉ-ghi-thêm (QT-06), xóa mềm (QT-13), phân quyền theo trung tâm (QT-14) và che số điện thoại (QT-15). Hệ thống đề xuất nhóm sự cố từ mô tả lỗi (FR5).

## 2. Chạy hệ thống (hai lệnh, từ thư mục trống)

Yêu cầu: Docker và Docker Compose, Git.

```bash
git clone --branch v1.0 https://github.com/doanxuantien2374802010493/smartcrm-2374802010493-tiep-nhan-bao-hanh.git
cd smartcrm-2374802010493-tiep-nhan-bao-hanh
```

```bash
cp .env.example .env
docker compose up -d --build
```

Các giá trị trong `.env.example` đủ để chạy thử trên máy cá nhân; mọi mật khẩu và `JWT_SECRET` trong đó chỉ là giá trị mẫu, phải đổi trước khi triển khai thật. API tự chạy migration và seed khi khởi động (chạy lại được, không nhân đôi dữ liệu). API tại http://localhost:3000.

Kiểm tra hệ thống chạy đúng:

```bash
docker compose ps                                  # mọi dịch vụ: healthy
curl -s http://localhost:3000/api/health           # {"status":"ok"}
docker compose exec app npm test                   # bộ test không cần CSDL
```

Hướng dẫn đầy đủ (năm mục, bằng tiếng Anh): `docs/deployment-guide.md`. Dừng: `docker compose down` (thêm `-v` để xóa cả dữ liệu).

Tài khoản mẫu (chỉ để phát triển, mật khẩu `Mekong@123`): `ql1` (Quản lý, trung tâm 1), `nv1` (Nhân viên, trung tâm 1), `nv2` (Nhân viên, trung tâm 2).

## 3. Cấu trúc thư mục

| Thư mục | Nội dung |
| --- | --- |
| `src/routes/`, `src/validators/`, `src/middleware/` | Lớp trình bày: nhận HTTP, kiểm định dạng (tầng 1), xác thực JWT, dịch lỗi sang mã HTTP |
| `src/services/` | Lớp nghiệp vụ (tầng 2): quy tắc QT-xx trong `rules.js` và `ticket.service.js`; không biết HTTP |
| `src/repositories/` | Lớp truy cập dữ liệu: chỉ đọc/ghi PostgreSQL bằng SQL thuần |
| `migrations/`, `seeds/` | Tạo 6 bảng + trigger (tầng 3); dữ liệu mẫu. Chạy lại nhiều lần không lỗi, không nhân đôi |
| `src/frontend/` | Giao diện React (Vite) |
| `tests/` | Kiểm thử Jest (`npm test` không cần CSDL; `npm run test:integration` cần PostgreSQL) |
| `Dockerfile`, `docker-compose.yml` | Đóng gói API và PostgreSQL |
| `docs/` | SRS, API contract, sơ đồ, `test-plan.md`, `test-report.md`, `bug-log.md`, `deployment-guide.md`, `security-checklist.md`, `api-docs.md`, `thay-doi-thiet-ke.md`, `ai-disclosure.md`, `screenshots/` |

## 4. Chạy không dùng Docker (phát triển)

Yêu cầu: Node.js 20 LTS (npm 10), PostgreSQL 16.

```bash
cp .env.example .env            # rồi sửa DB_USER, DB_PASSWORD, JWT_SECRET cho máy của em
npm ci                          # cài đúng phiên bản theo package-lock.json
createdb -U postgres smartcrm   # tạo CSDL rỗng
npm run db:setup                # chạy migrations/*.sql rồi seeds/*.sql (chạy lại được)
npm start                       # API tại http://localhost:3000
```

Giao diện (mở terminal thứ hai):

```bash
cd src/frontend && npm ci && npm run dev   # http://localhost:5173, tự chuyển /api sang cổng 3000
```

Biến môi trường: xem `.env.example` (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `PORT`, `JWT_SECRET`, `JWT_EXPIRES_IN`).

## 5. Chạy kiểm thử

```bash
npm test
```

Bộ test dùng repository giả, tự dựng dữ liệu, PASS bằng một lệnh: 37 test, không cần CSDL.

Bộ đầy đủ gồm thêm 33 test tích hợp và bảo mật chạy trên PostgreSQL thật. Các test này từ chối chạy trên CSDL không có chữ "test" trong tên, để không làm hỏng dữ liệu thật:

```powershell
createdb -U postgres smartcrm_test
$env:DB_NAME="smartcrm_test"
npm run db:setup
npm run test:all                # 10 suite, 70 test
```

(`.env` phải có `DB_PASSWORD` đúng với PostgreSQL trên máy.) Chi tiết 12 test case chính, ánh xạ sang tên test trong code: `docs/test-report.md`.

## 6. Gọi thử API

```bash
curl -s http://localhost:3000/api/health
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login -H 'Content-Type: application/json' \
  -d '{"username":"nv1","password":"Mekong@123"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')
curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:3000/api/customers?phone=0901234567"
curl -s -X POST http://localhost:3000/api/tickets -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"customer_id":1,"device_id":1,"issue_desc":"Màn hình bị sọc ngang, cảm ứng kém"}'
```

Gửi thiếu `issue_desc` phải nhận HTTP 400 kèm `error.fields.issue_desc`. Mô tả đầy đủ 15 endpoint, kèm ví dụ chạy thật: `docs/api-docs.md`.

## 7. Trạng thái hiện tại

- [x] Migration 6 bảng + trigger, seed thật, chạy lại không nhân đôi
- [x] Backend nối PostgreSQL thật, tách 3 lớp, theo `docs/api-contract.md`
- [x] CRUD khách hàng và phiếu (xóa mềm), QT-01..QT-06, QT-13..QT-15, FR5
- [x] Giao diện React 3 màn hình (danh sách, tiếp nhận, chi tiết) + đăng nhập, gọi API thật qua lớp client riêng, đủ 3 trạng thái (đang tải, rỗng, lỗi có nút Thử lại)
- [x] Bài tập 3: 12 test case có báo cáo (`npm test` 37 PASS; `npm run test:all` 70 PASS), Bug Log 6 bug, đóng gói bằng Docker, Deployment Guide, checklist bảo mật bảy mục, API docs 15 endpoint
- Ghi chú: các thay đổi so với BT1 và BT2 ghi ở `docs/thay-doi-thiet-ke.md`.
