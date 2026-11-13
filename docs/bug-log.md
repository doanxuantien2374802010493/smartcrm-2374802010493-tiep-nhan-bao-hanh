# Nhật ký lỗi (Bug Log)

Các lỗi BUG-001 đến BUG-004 được phát hiện khi chạy thử repo theo README từ thư mục trống (phép thử "clone-and-run") trên commit `dbb3b6d`, rồi gỡ theo bốn bước: tái lập, khoanh vùng, sửa nguyên nhân, xác nhận. Để tái lập, chạy `git checkout dbb3b6d` ở một thư mục clone riêng. BUG-005 và BUG-006 phát hiện ở giai đoạn BT3.

Lưu ý về commit sửa: BUG-002, BUG-003 và BUG-004 được sửa trong giai đoạn hiện thực BT2 và cùng nằm trong commit `34a1a5c` (commit gộp nhiều thay đổi, message ghi `docs:`), nên không đưa vào ba mục nộp của BT3. Ba bug có commit riêng là BUG-001, BUG-005 và BUG-006.

## Tổng hợp

| Mã | Mức độ | Tóm tắt | Commit sửa |
| --- | --- | --- | --- |
| BUG-001 | Critical | Không cài và chạy được theo README: thiếu `package.json` ở gốc | [2ba1c54](https://github.com/doanxuantien2374802010493/smartcrm-2374802010493-tiep-nhan-bao-hanh/commit/2ba1c54) |
| BUG-002 | Critical | API chạy bằng dữ liệu giả trong bộ nhớ, không dùng PostgreSQL | [34a1a5c](https://github.com/doanxuantien2374802010493/smartcrm-2374802010493-tiep-nhan-bao-hanh/commit/34a1a5c) |
| BUG-003 | Major | Repository khách hàng truy vấn cột không tồn tại trong DDL | [34a1a5c](https://github.com/doanxuantien2374802010493/smartcrm-2374802010493-tiep-nhan-bao-hanh/commit/34a1a5c) |
| BUG-004 | Critical | Tệp seed rỗng: không có tài khoản nào để đăng nhập | [34a1a5c](https://github.com/doanxuantien2374802010493/smartcrm-2374802010493-tiep-nhan-bao-hanh/commit/34a1a5c) |
| BUG-005 | Critical | Phụ thuộc gián tiếp có lỗ hổng (body-parser high, qs moderate) | [11b667f](https://github.com/doanxuantien2374802010493/smartcrm-2374802010493-tiep-nhan-bao-hanh/commit/11b667f) |
| BUG-006 | Minor | `db/schema.sql` lệch 7 bảng so với `migrations/` 6 bảng | [47dafb0](https://github.com/doanxuantien2374802010493/smartcrm-2374802010493-tiep-nhan-bao-hanh/commit/47dafb0) |

---

## BUG-001

1. **Mã và mức độ:** BUG-001 · Critical. Người chấm không cài và chạy được hệ thống, kéo theo mọi mục khác không kiểm chứng được (C1, C4).
2. **Phát hiện bởi:** phép thử "thư mục trống" (BT2): clone repo, làm đúng README bước cài đặt. Kiểm chứng lại ở BT3 bằng phép thử máy trắng (clone vào thư mục trống, `npm ci`, `npm test`).
3. **Triệu chứng:** `npm install` báo lỗi không tìm thấy `package.json`; `npm test` cũng không chạy được.
4. **Cách tái lập:**
   ```
   git clone <repo> t && cd t && git checkout dbb3b6d
   npm install        # ENOENT: no such file or directory, open '.../package.json'
   ```
   (`git ls-tree dbb3b6d --name-only` không có `package.json` ở thư mục gốc.)
5. **Nguyên nhân:** `package.json` chỉ nằm trong `src/backend/` (và thiếu `cors`, Jest), trong khi README và `src/app.js` chạy từ thư mục gốc. Gốc rễ là cấu trúc thư mục lệch với hướng dẫn, không phải lỗi gõ lệnh.
6. **Cách sửa:** tạo `package.json` ở gốc với đủ thư viện (express, cors, pg, dotenv, jsonwebtoken, bcryptjs, jest) và commit `package-lock.json`; xóa mã trùng lặp trong `src/backend/` (chỉ còn `.gitkeep`); README dùng `npm ci`.
7. **Commit và xác nhận:** https://github.com/doanxuantien2374802010493/smartcrm-2374802010493-tiep-nhan-bao-hanh/commit/2ba1c54 · clone mới vào thư mục trống, `npm ci`, `npm test` → PASS (ảnh phép thử máy trắng ở mục 7 của PDF).

---

## BUG-002

1. **Mã và mức độ:** BUG-002 · Critical. Dữ liệu không được lưu vào cơ sở dữ liệu, vi phạm yêu cầu dữ liệu phải lấy từ nguồn thật của hệ thống.
2. **Phát hiện bởi:** đọc `src/app.js` khi khoanh vùng vì sao seed rỗng và migration không tác động tới API. Test hồi quy: TC-02 trong Test Report (`tests/integration.db.test.js`, "TC-08 tao phieu …").
3. **Triệu chứng:** tạo phiếu rồi khởi động lại máy chủ thì phiếu biến mất; không có dòng nào được ghi vào bảng `ticket`.
4. **Cách tái lập:** xem `src/app.js` ở commit `dbb3b6d`: phiếu nằm trong mảng `mockTicketsDB`, và hàm xem chi tiết trả `mockTicketsDB[0]` cho mọi id không tìm thấy.
   ```
   git show dbb3b6d:src/app.js | Select-String "mockTicketsDB"
   ```
5. **Nguyên nhân:** `app.js` được nối với bản giả (mock) để chụp ảnh minh họa và chưa bao giờ được nối lại với lớp repository dùng PostgreSQL.
6. **Cách sửa:** bỏ mock; `src/server.js` tạo `pg.Pool` và nối repositories, services, routes; phiếu và dòng log đầu tiên ghi cùng một transaction.
7. **Commit và xác nhận:** https://github.com/doanxuantien2374802010493/smartcrm-2374802010493-tiep-nhan-bao-hanh/commit/34a1a5c (commit gộp; phần sửa bug này nằm ở `src/app.js` và `src/server.js`) · TC-02 PASS: tạo phiếu thì `ticket` và `ticket_status_log` cùng tăng 1 trong PostgreSQL (38 → 39).

---

## BUG-003

1. **Mã và mức độ:** BUG-003 · Major. Tra cứu khách hàng sẽ lỗi ngay khi chạy với PostgreSQL thật.
2. **Phát hiện bởi:** đối chiếu câu SQL trong repository với DDL khi nối repository vào CSDL thật. Test hồi quy: `tests/regression.bt2.test.js` ("TC-23 (BUG-003) …").
3. **Triệu chứng:** truy vấn báo cột không tồn tại.
4. **Cách tái lập:**
   ```
   psql -d smartcrm -c "SELECT address, segment FROM customer LIMIT 1"
   # ERROR:  column "address" does not exist
   ```
5. **Nguyên nhân:** repository viết theo một lược đồ cũ (có `address`, `segment`, `created_at`), còn DDL của BT1 chỉ có `full_name`, `phone`, `email`, `is_deleted`. Lược đồ và mã bị lệch từ khi thiết kế được sửa ở BT1.
6. **Cách sửa:** viết lại repository chỉ dùng các cột có trong DDL; không thêm cột ngoài thiết kế.
7. **Commit và xác nhận:** https://github.com/doanxuantien2374802010493/smartcrm-2374802010493-tiep-nhan-bao-hanh/commit/34a1a5c (commit gộp; phần sửa bug này nằm ở `src/repositories/customer.repository.js`) · TC-23 PASS: tìm khách theo SĐT `0901234567` trả 200 và thấy đúng khách trên PostgreSQL dựng từ migration.

---

## BUG-004

1. **Mã và mức độ:** BUG-004 · Critical. Seed rỗng nghĩa là bảng `employee` không có tài khoản nào, không đăng nhập được, nên hệ thống không dùng được; đồng thời không có khách, thiết bị hay nhóm sự cố để thử.
2. **Phát hiện bởi:** chạy migration rồi seed trên CSDL trống và đếm dòng. Test hồi quy: TC-12 trong Test Report (`tests/regression.bt2.test.js`, "TC-24 (BUG-004) …").
3. **Triệu chứng:** sau khi nạp seed, mọi bảng đều có 0 dòng.
4. **Cách tái lập:**
   ```
   git cat-file -s dbb3b6d:seeds/001_seed_data.sql
   # 0
   ```
5. **Nguyên nhân:** tệp seed được tạo nhưng chưa bao giờ có nội dung.
6. **Cách sửa:** viết seed thật (nhóm sự cố, nhân viên, khách, thiết bị, 3 phiếu kèm log) dùng khóa nghiệp vụ và `ON CONFLICT` / `WHERE NOT EXISTS`; `ORDER BY` để id cố định giữa các lần dựng.
7. **Commit và xác nhận:** https://github.com/doanxuantien2374802010493/smartcrm-2374802010493-tiep-nhan-bao-hanh/commit/34a1a5c (commit gộp; phần sửa bug này nằm ở `seeds/001_seed_data.sql`) · TC-12 PASS trên CSDL đã seed; trên CSDL chỉ có migration không có seed (tái hiện trạng thái lỗi) cả 5 kiểm đều FAIL (`Received: 0`). TC-11 (`db:setup` chạy hai lần, số dòng không đổi) PASS.

---

## BUG-005

1. **Mã và mức độ:** BUG-005 · Critical. Phụ thuộc chạy thật có lỗ hổng bảo mật: `body-parser` (mức high, từ chối dịch vụ khi thân yêu cầu nén có byte thừa phía sau) xử lý thân JSON của mọi API, kèm `qs` (mức moderate).
2. **Phát hiện bởi:** kiểm tra tĩnh `npm audit --omit=dev` ở đầu BT3 (công cụ phát hiện, không phải một test case; xem dòng 7 về kiểm chứng).
3. **Triệu chứng:** `npm audit --omit=dev` báo 2 lỗ hổng (1 high, 1 moderate); một yêu cầu độc hại có thể làm API từ chối dịch vụ.
4. **Cách tái lập:**
   ```
   git checkout 40146fd
   npm ci
   npm audit --omit=dev
   ```
5. **Nguyên nhân:** `body-parser` và `qs` là phụ thuộc gián tiếp của Express; `package-lock.json` đang khóa ở phiên bản có lỗ hổng vì chưa ai chạy `npm audit` sau khi dựng.
6. **Cách sửa:** chạy `npm audit fix` (không dùng `--force`), chỉ cập nhật `package-lock.json` lên bản đã vá.
7. **Commit và xác nhận:** https://github.com/doanxuantien2374802010493/smartcrm-2374802010493-tiep-nhan-bao-hanh/commit/11b667f (chỉ đổi `package-lock.json`) · `npm audit --omit=dev` → found 0 vulnerabilities; `npm test` vẫn PASS; ảnh trước và sau: `docs/screenshots/npm-audit-before.png`, `npm-audit-after.png`.

---

## BUG-006

1. **Mã và mức độ:** BUG-006 · Minor. Tài liệu lược đồ lệch với hệ thống thật; nghiệp vụ vẫn chạy đúng vì mã dùng `migrations/`.
2. **Phát hiện bởi:** rà soát tĩnh `Select-String … "CREATE TABLE"` trên `migrations/` và `db/` khi kiểm C9. Test hồi quy: `tests/schema.consistency.test.js` ("db/schema.sql (neu con) co cung tap bang voi migrations").
3. **Triệu chứng:** `db/schema.sql` định nghĩa 7 bảng (có thêm `service_center`), trong khi thiết kế TD-02 và `migrations/001_create_tables.sql` chỉ có 6 bảng. Ai dựng CSDL từ `db/schema.sql` sẽ nhận lược đồ không khớp mã.
4. **Cách tái lập:**
   ```
   git show 40146fd:db/schema.sql | Select-String "CREATE TABLE"     # 7 bảng, có service_center
   Select-String -Path migrations\001_create_tables.sql -Pattern "CREATE TABLE"   # 6 bảng
   ```
5. **Nguyên nhân:** `db/schema.sql` được viết ở giai đoạn BT1. Khi ERD giảm từ 7 xuống 6 bảng (TD-02), `migrations/` trở thành nguồn thật nhưng tệp cũ không bị xóa hay cập nhật, và không có kiểm thử nào đối chiếu hai nơi.
6. **Cách sửa:** xóa `db/schema.sql` (không tệp nào tham chiếu, `git grep "schema.sql"` không có kết quả); thêm test kiểm `migrations/` tạo đúng 6 bảng và `db/schema.sql` (nếu còn) có cùng tập bảng.
7. **Commit và xác nhận:** https://github.com/doanxuantien2374802010493/smartcrm-2374802010493-tiep-nhan-bao-hanh/commit/47dafb0 (commit chỉ có hai thay đổi này) · trước khi sửa test đỏ (`Expected - 0, Received + 1: service_center`), sau khi sửa `Tests: 2 passed, 2 total`.

---

## Rà soát trước khi nộp

Các kiểm tra tĩnh trên `src/` và `scripts/` (PowerShell). Kết quả mong đợi: trống, trừ `scripts/db-setup.js` ở lệnh thứ hai.

```
# catch rỗng (loại node_modules)
Get-ChildItem src,scripts -Recurse -Include *.js | Where-Object { $_.FullName -notmatch 'node_modules' } | Select-String -Pattern 'catch\s*(\([^)]*\))?\s*\{\s*\}'
# console.* ngoài frontend (loại node_modules)
Get-ChildItem src,scripts -Recurse -Include *.js | Where-Object { $_.FullName -notmatch 'frontend|node_modules' } | Select-String -Pattern 'console\.'
# .env thật không nằm trong repo
git ls-files | Select-String -Pattern '(^|/)\.env$'
# .env chưa từng bị commit vào lịch sử
git log --all --full-history --oneline -- .env
# node_modules không nằm trong repo
git ls-files | Select-String 'node_modules' | Measure-Object
```

Kết quả (14/11/2026):
- catch rỗng: trống
- console.* ngoài frontend: chỉ `scripts/db-setup.js` (dòng 13 và 27), được phép
- .env trong repo: trống
- .env trong lịch sử: trống
- node_modules trong repo: `Count : 0`

Ghi chú: hai lệnh đầu loại thư mục `node_modules` khỏi phạm vi quét vì đó là thư viện bên thứ ba cài cục bộ, không phải mã của dự án và không được Git theo dõi (lệnh cuối).

Ảnh chụp: `docs/screenshots/static-checks-env-history.png`, `docs/screenshots/static-checks-filtered.png`.