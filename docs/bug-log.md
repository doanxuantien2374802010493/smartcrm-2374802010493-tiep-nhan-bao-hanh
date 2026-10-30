# Nhật ký lỗi (Bug Log)

Các lỗi dưới đây được phát hiện khi chạy thử repo theo README từ thư mục trống (phép thử "clone-and-run") trên commit `dbb3b6d`, rồi gỡ theo bốn bước: tái lập, khoanh vùng, sửa nguyên nhân, xác nhận.
Để tái lập, chạy `git checkout dbb3b6d` ở một thư mục clone riêng.

## Tổng hợp

| Mã | Mức độ | Tóm tắt | Commit sửa |
| --- | --- | --- | --- |
| BUG-001 | Critical | Không cài và chạy được theo README: thiếu `package.json` ở gốc | [điền: link commit] |
| BUG-002 | Critical | API chạy bằng dữ liệu giả trong bộ nhớ, không dùng PostgreSQL | [điền: link commit] |
| BUG-003 | Major | Repository khách hàng truy vấn cột không tồn tại trong DDL | [điền: link commit] |
| BUG-004 | Major | Tệp seed rỗng, README nói đã có dữ liệu mẫu | [điền: link commit] |

---

## BUG-001

1. **Mã và mức độ:** BUG-001 · Critical. Người chấm không cài và chạy được hệ thống, kéo theo mọi mục khác không kiểm chứng được (C1, C4).
2. **Phát hiện bởi:** phép thử "thư mục trống": clone repo, làm đúng README bước cài đặt.
3. **Triệu chứng:** `npm install` báo lỗi không tìm thấy `package.json`; `npm test` cũng không chạy được.
4. **Cách tái lập:**
   ```
   git clone <repo> t && cd t && git checkout dbb3b6d
   npm install        # ENOENT: no such file or directory, open '.../package.json'
   ```
5. **Nguyên nhân:** `package.json` chỉ nằm trong `src/backend/` (và thiếu `cors`, Jest), trong khi README và `src/app.js` chạy từ thư mục gốc. Gốc rễ là cấu trúc thư mục lệch với hướng dẫn, không phải lỗi gõ lệnh.
6. **Cách sửa:** tạo `package.json` ở gốc với đủ thư viện (express, cors, pg, dotenv, jsonwebtoken, bcryptjs, jest) và commit `package-lock.json`; xóa `src/backend/` trùng lặp; README dùng `npm ci`.
7. **Commit và xác nhận:** [điền: link commit] · clone mới, `npm ci`, `npm test` PASS.

---

## BUG-002

1. **Mã và mức độ:** BUG-002 · Critical. Dữ liệu không được lưu vào cơ sở dữ liệu, vi phạm yêu cầu dữ liệu phải lấy từ nguồn thật của hệ thống.
2. **Phát hiện bởi:** đọc `src/app.js` khi khoanh vùng vì sao seed rỗng và migration không tác động tới API.
3. **Triệu chứng:** tạo phiếu rồi khởi động lại máy chủ thì phiếu biến mất; không có dòng nào được ghi vào bảng `ticket`.
4. **Cách tái lập:** xem `src/app.js` ở commit `dbb3b6d`: phiếu nằm trong mảng `mockTicketsDB`, hàm tìm thiết bị luôn trả một bản ghi cố định, quy tắc QT-09 bị tắt trong mock.
5. **Nguyên nhân:** `app.js` được nối với bản giả (mock) để chụp ảnh minh họa và chưa bao giờ được nối lại với lớp repository dùng PostgreSQL.
6. **Cách sửa:** bỏ mock; `src/server.js` tạo `pg.Pool` và nối repositories, services, routes; phiếu và dòng log đầu tiên ghi cùng một transaction.
7. **Commit và xác nhận:** [điền: link commit] · tạo phiếu, khởi động lại máy chủ, phiếu vẫn còn; `SELECT * FROM ticket_status_log` có dòng đầu tiên.

---

## BUG-003

1. **Mã và mức độ:** BUG-003 · Major. Tra cứu khách hàng sẽ lỗi ngay khi chạy với PostgreSQL thật.
2. **Phát hiện bởi:** đối chiếu câu SQL trong repository với DDL khi nối repository vào CSDL thật.
3. **Triệu chứng:** truy vấn báo cột không tồn tại.
4. **Cách tái lập:**
   ```
   psql -d smartcrm -c "SELECT address, segment FROM customer LIMIT 1"
   # ERROR:  column "address" does not exist
   ```
5. **Nguyên nhân:** repository viết theo một lược đồ cũ (có `address`, `segment`, `created_at`), còn DDL của BT1 chỉ có `full_name`, `phone`, `email`, `is_deleted`. Lược đồ và mã bị lệch từ khi thiết kế được sửa ở BT1.
6. **Cách sửa:** viết lại repository chỉ dùng các cột có trong DDL; không thêm cột ngoài thiết kế.
7. **Commit và xác nhận:** [điền: link commit] · tra cứu khách theo SĐT trả 200 trên CSDL dựng từ migration.

---

## BUG-004

1. **Mã và mức độ:** BUG-004 · Major. Hệ thống lên trống trơn, không có khách, thiết bị, nhóm sự cố hay tài khoản để thử.
2. **Phát hiện bởi:** chạy migration rồi seed trên CSDL trống và đếm dòng.
3. **Triệu chứng:** sau khi nạp seed, mọi bảng đều có 0 dòng.
4. **Cách tái lập:** `wc -c seeds/001_seed_data.sql` cho kết quả 0 byte ở commit `dbb3b6d`.
5. **Nguyên nhân:** tệp seed được tạo nhưng chưa bao giờ có nội dung.
6. **Cách sửa:** viết seed thật (nhóm sự cố, nhân viên, khách, thiết bị, 3 phiếu kèm log) dùng khóa nghiệp vụ và `ON CONFLICT` / `WHERE NOT EXISTS`; `ORDER BY` để id cố định giữa các lần dựng.
7. **Commit và xác nhận:** [điền: link commit] · chạy `npm run db:setup` hai lần, số dòng không đổi (3 phiếu, 3 log, 3 khách).

---

## Rà soát trước khi nộp

Kết quả các lệnh `grep` của buổi 11 trên `src/` và `scripts/` (kết quả mong đợi: trống):

```
grep -rnE "catch *(\([^)]*\))? *\{ *\}" src scripts        # catch rỗng: trống
grep -rn "console\." src --include=*.js | grep -v frontend  # chỉ còn scripts/db-setup.js (công cụ dòng lệnh)
git ls-files | grep -E "(^|/)\.env$"                         # .env thật không nằm trong repo: trống
```
