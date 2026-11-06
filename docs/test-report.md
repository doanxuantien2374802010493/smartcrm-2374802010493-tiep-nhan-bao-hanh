# Test Report – Luồng L2: Tiếp nhận thiết bị bảo hành (track SE)

Sinh viên: Đoàn Xuân Tiến · MSSV 2374802010493
Lệnh chạy: `npm test` (unit, không cần CSDL) và `$env:DB_NAME="smartcrm_test"; npm run test:integration` (cần PostgreSQL thử).

> Cột 7 chỉ ghi điều đã quan sát khi chạy thật. Cột 8 điền sau khi chạy lại tại chỗ và có ảnh chụp trong `docs/screenshots/`.
> Cột "Tên test trong code" giúp chạy lại đúng test: `npx jest <tệp> -t "<tên>"` (thêm `--testPathIgnorePatterns=/node_modules/` với tệp tích hợp).

## Tổng quan

| Loại | Số lượng | Mã |
|---|---|---|
| Luồng đúng | 4 | TC-01, TC-02, TC-03, TC-04 |
| Giá trị biên (hai bên cùng một ranh giới) | 2 | TC-05, TC-06 |
| Dữ liệu sai | 2 | TC-07, TC-08 |
| Bảo mật / chất lượng dữ liệu | 2 | TC-09, TC-10 |
| Tính tái lập | 1 | TC-11 |
| Hồi quy bug đã sửa | 1 | TC-12 |

Tầng: 5 unit (repository giả), 7 tích hợp / API trên PostgreSQL thử.

## Bảng test case

### TC-01 · Luồng đúng · Unit · Ưu tiên Cao
- **Tiền điều kiện:** repository giả có khách 1, thiết bị 1 còn bảo hành; nhân viên trung tâm 1.
- **Các bước:** 1. Gọi `createTicket` với `customerId=1`, `deviceId=1`, mô tả có chữ "màn hình".
- **Dữ liệu thử:** `issueDesc` = "Màn hình bị sọc ngang, cảm ứng kém".
- **Kết quả mong đợi:** mã `BH-000100/2026`, ưu tiên CAO (FR5), hạn cam kết +24h (QT-04), đúng 1 dòng log đầu tiên (QT-06).
- **Tên test trong code:** `tests/ticket.service.test.js` → "TC01 - Luồng đúng …"
- **Kết quả thực tế:** test chạy xanh trong lần chạy `--verbose` (12 passed, 12 total).
- **PASS/FAIL:** [điền sau khi chạy lại]

### TC-02 · Luồng đúng · Tích hợp · Ưu tiên Cao
- **Tiền điều kiện:** `smartcrm_test` đã seed; đăng nhập `nv1`; ghi lại số dòng `ticket` và `ticket_status_log`.
- **Các bước:** 1. Đăng nhập `nv1`. 2. `POST /api/tickets`. 3. Đếm lại hai bảng. 4. Đọc dòng log của phiếu mới.
- **Dữ liệu thử:** `{customer_id:1, device_id:1, issue_desc:"Thiet bi khong len nguon, man hinh soc xanh"}`.
- **Kết quả mong đợi:** 201; `ticket_code` đúng dạng `BH-######/####`; `ticket` +1 và `ticket_status_log` +1; dòng log có `from_status` rỗng, `to_status = MOI`.
- **Tên test trong code:** `tests/integration.db.test.js` → "TC-08 tao phieu …"
- **Kết quả thực tế:** xanh trong lần chạy tích hợp (nằm trong 33 passed ở lần chạy cuối).
- **PASS/FAIL:** [điền sau khi chạy lại]

### TC-03 · Luồng đúng · Unit · Ưu tiên Trung bình
- **Tiền điều kiện:** có phiếu do Quản lý tạo cho khách có SĐT `0901234567`.
- **Các bước:** 1. Nhân viên gọi `getTicket`. 2. Quản lý gọi `getTicket`.
- **Dữ liệu thử:** phiếu vừa tạo.
- **Kết quả mong đợi:** nhân viên thấy `090****567`; Quản lý thấy `0901234567` (QT-15).
- **Tên test trong code:** `tests/ticket.service.test.js` → "QT-15: nhân viên thấy SĐT đã che …"
- **Kết quả thực tế:** xanh trong lần chạy `--verbose`.
- **PASS/FAIL:** [điền sau khi chạy lại]

### TC-04 · Luồng đúng · Unit · Ưu tiên Trung bình
- **Tiền điều kiện:** phiếu cho thiết bị thiếu ngày mua (`warranty_verified=false`, luồng 5a).
- **Các bước:** 1. Nhân viên thử phê duyệt. 2. Quản lý phê duyệt. 3. Quản lý phê duyệt lần hai.
- **Dữ liệu thử:** `{isWarranty:true}`.
- **Kết quả mong đợi:** bước 1 `FORBIDDEN`; bước 2 thành công, `warrantyVerified=true`; bước 3 `WARRANTY_ALREADY_VERIFIED` (409).
- **Tên test trong code:** `tests/ticket.service.test.js` → "Phê duyệt bảo hành: chỉ Quản lý, và chỉ một lần (409)"
- **Kết quả thực tế:** xanh trong lần chạy `--verbose`.
- **PASS/FAIL:** [điền sau khi chạy lại]

### TC-05 · Giá trị biên (dưới) · API · Ưu tiên Cao
- **Tiền điều kiện:** `smartcrm_test` đã seed; đăng nhập `nv1`.
- **Các bước:** 1. `POST /api/tickets` với mô tả đúng 9 ký tự.
- **Dữ liệu thử:** `issue_desc = "a" × 9` (ràng buộc 10–2000).
- **Kết quả mong đợi:** 400, không tạo phiếu.
- **Tên test trong code:** `tests/robustness.test.js` → "BIEN 9 ky tu -> 400"
- **Kết quả thực tế:** xanh trong các lần chạy tích hợp.
- **PASS/FAIL:** [điền sau khi chạy lại]

### TC-06 · Giá trị biên (trên ranh giới) · API · Ưu tiên Cao
- **Tiền điều kiện:** như TC-05.
- **Các bước:** 1. `POST /api/tickets` với mô tả đúng 10 ký tự.
- **Dữ liệu thử:** `issue_desc = "a" × 10`.
- **Kết quả mong đợi:** 201.
- **Tên test trong code:** `tests/robustness.test.js` → "BIEN 10 ky tu -> 201"
- **Kết quả thực tế:** xanh trong các lần chạy tích hợp.
- **PASS/FAIL:** [điền sau khi chạy lại]

### TC-07 · Dữ liệu sai · Unit · Ưu tiên Cao
- **Tiền điều kiện:** không cần CSDL.
- **Các bước:** 1. Gọi `validateCreateTicket` với mô tả rỗng.
- **Dữ liệu thử:** `{customer_id:1, device_id:1, issue_desc:""}`.
- **Kết quả mong đợi:** lỗi `VALIDATION_FAILED`, chi tiết có tên trường `issue_desc`.
- **Tên test trong code:** `tests/ticket.service.test.js` → "TC03 - Dữ liệu sai …"
- **Kết quả thực tế:** xanh trong lần chạy `--verbose`. Test này kiểm mã lỗi nghiệp vụ và tên trường; mã HTTP 400 được kiểm riêng ở `tests/api.test.js`.
- **PASS/FAIL:** [điền sau khi chạy lại]

### TC-08 · Dữ liệu sai · API · Ưu tiên Trung bình
- **Tiền điều kiện:** có một phiếu do `nv1` vừa tạo, trạng thái MOI.
- **Các bước:** 1. `PATCH /api/tickets/{id}` đổi mức ưu tiên.
- **Dữ liệu thử:** `{priority:"KHAN_CAP"}` (không thuộc CAO, TRUNG_BINH, THAP).
- **Kết quả mong đợi:** 400 (không phải 500).
- **Tên test trong code:** `tests/robustness.test.js` → "doi uu tien sang gia tri khong hop le -> 400 …"
- **Kết quả thực tế:** xanh trong các lần chạy tích hợp.
- **PASS/FAIL:** [điền sau khi chạy lại]

### TC-09 · Bảo mật A01 (QT-14) · API · Ưu tiên Cao
- **Tiền điều kiện:** `nv1` (trung tâm 1) tạo phiếu; `nv2` thuộc trung tâm 2; ghi lại `priority`, `status`, `is_deleted` của phiếu.
- **Các bước:** 1. Đăng nhập `nv2`. 2. `GET /api/tickets/{id}`. 3. `PATCH /api/tickets/{id}`. 4. Đọc lại dòng phiếu trong CSDL.
- **Dữ liệu thử:** token `nv2`; `{priority:"THAP"}`.
- **Kết quả mong đợi:** 403 hoặc 404, không bao giờ 200; dữ liệu phiếu không đổi.
- **Tên test trong code:** `tests/security.api.test.js` → "TC-11 A01 …"
- **Kết quả thực tế:** xanh khi mã đúng. Khi tạm vô hiệu hóa kiểm tra trung tâm trong `getOwnTicket`, test GET và PATCH chuyển ĐỎ (2 failed), test unit QT-14 cũng đỏ; sau khi hoàn lại (`git checkout`) tất cả xanh trở lại.
- **PASS/FAIL:** [điền sau khi chạy lại]

### TC-10 · Bảo mật A07 · API · Ưu tiên Cao
- **Tiền điều kiện:** đăng nhập `nv1` lấy token.
- **Các bước:** 1. Sửa đúng một ký tự cuối của token. 2. `GET /api/tickets` với token đã sửa.
- **Dữ liệu thử:** token hợp lệ bị đổi ký tự cuối.
- **Kết quả mong đợi:** 401.
- **Tên test trong code:** `tests/security.owasp.test.js` → "TC-14 token bi sua mot ky tu -> 401"
- **Kết quả thực tế:** xanh trong các lần chạy tích hợp.
- **PASS/FAIL:** [điền sau khi chạy lại]

### TC-11 · Tính tái lập (C8) · Tích hợp · Ưu tiên Cao
- **Tiền điều kiện:** `smartcrm_test` đã chạy `db:setup` một lần.
- **Các bước:** 1. Chạy `npm run db:setup`, đếm 6 bảng. 2. Chạy `npm run db:setup` lần hai, đếm lại.
- **Dữ liệu thử:** bảng `customer, device, issue_category, employee, ticket, ticket_status_log`.
- **Kết quả mong đợi:** lần hai không lỗi; số dòng mọi bảng không đổi.
- **Tên test trong code:** `tests/integration.db.test.js` → "TC-10 db:setup chay lan hai …"
- **Kết quả thực tế:** xanh trong các lần chạy tích hợp.
- **PASS/FAIL:** [điền sau khi chạy lại]

### TC-12 · Hồi quy BUG-004 (seed rỗng) · Tích hợp · Ưu tiên Cao
- **Tiền điều kiện:** CSDL đã chạy `db:setup`.
- **Các bước:** 1. Đếm 4 bảng danh mục. 2. Kiểm có đủ `ql1`, `nv1`, `nv2`.
- **Dữ liệu thử:** bảng `customer, device, issue_category, employee`.
- **Kết quả mong đợi:** mỗi bảng > 0 dòng; đủ ba tài khoản mẫu.
- **Tên test trong code:** `tests/regression.bt2.test.js` → "TC-24 (BUG-004) …"
- **Kết quả thực tế:** xanh trên CSDL đã seed. Trên CSDL chỉ có migration, không seed (tái hiện trạng thái BUG-004), cả 5 test TC-24 ĐỎ (`Received: 0`, danh sách tài khoản rỗng).
- **PASS/FAIL:** [điền sau khi chạy lại]

## Ghi chú trung thực

- Các mã TC-01…TC-12 ở trên là mã của báo cáo. Tên trong tệp test dùng số khác (ví dụ TC-08 trong code là TC-02 ở đây); cột "Tên test trong code" là cách tra cứu.
- Cột 7 chỉ tóm tắt kết quả quan sát; ảnh chụp từng lần chạy nằm ở `docs/screenshots/` và mục 7 của PDF.
- Bộ test còn có thêm các test không nằm trong 12 test case chính (QT-03, QT-13, QT-04, A02, A04, A05, đầu vào bất thường). Chúng chạy cùng các lệnh trên.
- Phép thử "làm sai có chủ đích" ở TC-09 và TC-12 chỉ để chứng minh test có khả năng thất bại; mã nguồn thật đã được hoàn lại.
