# Hệ thống Tiếp nhận và Phân loại Yêu cầu Bảo hành (SmartCRM - Mekong Mobile)

- **Sinh viên:** Đoàn Xuân Tiến · **MSSV:** 2374802010493
- **Học phần:** Chuyên đề Tốt nghiệp 1 (HK1 2026-2027) · **Track:** SE · **Luồng:** L2 – Tiếp nhận và phân loại yêu cầu bảo hành
- **Phiên bản nộp:** tag `v0.2` (Bài tập 2)

## 1. Mục tiêu hệ thống

Số hóa quy trình tiếp nhận bảo hành: tra cứu và tạo khách hàng (QT-01, QT-02), kiểm tra thiết bị thuộc về khách (QT-03), tính hạn cam kết theo mức ưu tiên (QT-04), xác minh còn bảo hành hay không (QT-05), ghi lịch sử trạng thái chỉ-ghi-thêm (QT-06), xóa mềm (QT-13), phân quyền theo trung tâm (QT-14) và che số điện thoại (QT-15). Hệ thống đề xuất nhóm sự cố từ mô tả lỗi (FR5).

## 2. Yêu cầu môi trường

- Node.js 20 LTS (npm 10) · PostgreSQL 16
- Biến môi trường: xem `.env.example` (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `PORT`, `JWT_SECRET`, `JWT_EXPIRES_IN`)

## 3. Cấu trúc thư mục

| Thư mục | Nội dung |
| --- | --- |
| `src/routes/`, `src/validators/`, `src/middleware/` | Lớp trình bày: nhận HTTP, kiểm định dạng (tầng 1), xác thực JWT, dịch lỗi sang mã HTTP |
| `src/services/` | Lớp nghiệp vụ (tầng 2): quy tắc QT-xx trong `rules.js` và `ticket.service.js`; không biết HTTP |
| `src/repositories/` | Lớp truy cập dữ liệu: chỉ đọc/ghi PostgreSQL bằng SQL thuần |
| `migrations/`, `seeds/` | Tạo 6 bảng + trigger (tầng 3); dữ liệu mẫu. Chạy lại nhiều lần không lỗi, không nhân đôi |
| `src/frontend/` | Giao diện React (Vite) |
| `tests/` | Kiểm thử Jest (không cần CSDL) |
| `docs/` | SRS, API contract, sơ đồ, `thay-doi-thiet-ke.md`, `ai-disclosure.md`, `bug-log.md` |

## 4. Cài đặt và chạy (mỗi bước một lệnh)

```bash
git clone --branch v0.2 https://github.com/doanxuantien2374802010493/smartcrm-2374802010493-tiep-nhan-bao-hanh.git
cd smartcrm-2374802010493-tiep-nhan-bao-hanh
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

### Chạy bằng Docker (thay cho các bước trên, 2 lệnh)

```bash
cp .env.example .env            # đặt DB_PASSWORD và JWT_SECRET
docker compose up --build       # db + api + web; api tự chạy migration và seed (chạy lại được)
```

Giao diện: http://localhost:8080 · API: http://localhost:3000. Trong container, API gọi CSDL bằng tên dịch vụ `db`. Xem log: `docker compose logs -f api --tail 50`. Dừng: `docker compose down` (thêm `-v` để xóa cả dữ liệu).

Tài khoản mẫu (chỉ để phát triển, mật khẩu `Mekong@123`): `ql1` (Quản lý, trung tâm 1), `nv1` (Nhân viên, trung tâm 1), `nv2` (Nhân viên, trung tâm 2).

## 5. Chạy kiểm thử

```bash
npm test
```

Bộ test dùng repository giả, tự dựng dữ liệu, PASS bằng một lệnh. Ba loại bắt buộc nằm ở `tests/ticket.service.test.js`: TC01 luồng đúng, TC02 giá trị biên (QT-05), TC03 dữ liệu sai. Ngoài ra `tests/rules.test.js` (QT-01, QT-04, QT-05, QT-15, FR5) và `tests/api.test.js` (mã HTTP, lỗi rõ ràng, không lộ lỗi thô).

## 6. Kiểm tra hệ thống chạy đúng

```bash
curl -s http://localhost:3000/api/health
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login -H 'Content-Type: application/json' \
  -d '{"username":"nv1","password":"Mekong@123"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')
curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:3000/api/customers?phone=0901234567"
curl -s -X POST http://localhost:3000/api/tickets -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"customer_id":1,"device_id":1,"issue_desc":"Màn hình bị sọc ngang, cảm ứng kém"}'
```

Gửi thiếu `issue_desc` phải nhận HTTP 400 kèm `error.fields.issue_desc`.

## 7. Trạng thái hiện tại

- [x] Migration 6 bảng + trigger, seed thật, chạy lại không nhân đôi
- [x] Backend nối PostgreSQL thật, tách 3 lớp, theo `docs/api-contract.md`
- [x] CRUD khách hàng và phiếu (xóa mềm), QT-01..QT-06, QT-13..QT-15, FR5
- [x] 33 kiểm thử Jest PASS
- [x] Giao diện React 3 màn hình (danh sách, tiếp nhận, chi tiết) + đăng nhập, gọi API thật qua lớp client riêng, đủ 3 trạng thái (đang tải, rỗng, lỗi có nút Thử lại)
- [x] Docker / docker-compose (điểm cộng) · [ ] Tiến: ghi lại kết quả tự chạy `docker compose up --build`
- Ghi chú: các thay đổi so với BT1 ghi ở `docs/thay-doi-thiet-ke.md` (TD-07 đến TD-10).
