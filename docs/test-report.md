# Test Report – Luồng L2: Tiếp nhận thiết bị bảo hành (track SE)

Sinh viên: Đoàn Xuân Tiến · MSSV 2374802010493

**Cách chạy**
- `npm test`: unit và route, không cần CSDL. Ngày 13/11/2026: 37 passed (5 suite: 33 unit/route, 2 nhất quán lược đồ, 2 nhất quán tài liệu).
- `$env:DB_NAME="smartcrm_test"; npm run test:integration`: tích hợp và API trên PostgreSQL thử. 33 passed (5 suite, chạy ngày 6/11/2026).
- Một lệnh cho cả hai: `$env:DB_NAME="smartcrm_test"; npm run test:all`.
- Trong container: `docker compose exec app npm test`: 35 passed (4 suite; `.dockerignore` loại test đọc README).
- Chạy riêng một test: `npx jest <tệp> -t "<tên test>" --testPathIgnorePatterns=/node_modules/`.

**Nguồn kết quả thực tế (mục 6 của mỗi test case):** lần chạy ngày 6/11/2026 trên bản clone sạch `D:\clean-bt3`. Mã TC-xx ở báo cáo khác số trong tên test của tệp; dùng dòng "Tên test trong code" để tra.

## Tổng quan

| Loại | Số lượng | Mã |
|---|---|---|
| Luồng đúng | 4 | TC-01, TC-02, TC-03, TC-04 |
| Giá trị biên (hai bên cùng một ranh giới) | 2 | TC-05, TC-06 |
| Dữ liệu sai | 2 | TC-07, TC-08 |
| Bảo mật | 2 | TC-09 (A01, QT-14), TC-10 (A07) |
| Tính tái lập | 1 | TC-11 |
| Hồi quy bug đã sửa | 1 | TC-12 (BUG-004) |

Theo tầng: 4 unit (TC-01, 03, 04, 07) · 3 tích hợp (TC-02, 11, 12) · 5 API (TC-05, 06, 08, 09, 10).

## Các test case

### TC-01 · Luồng đúng · Unit · Ưu tiên Cao
1. **Tiền điều kiện:** repository giả có khách 1, thiết bị 1 còn bảo hành; nhân viên trung tâm 1.
2. **Các bước:** gọi `createTicket` với `customerId=1`, `deviceId=1`.
3. **Dữ liệu thử:** `issueDesc` = "Màn hình bị sọc ngang, cảm ứng kém".
4. **Kết quả mong đợi:** mã `BH-000100/2026`; ưu tiên CAO (FR5); hạn cam kết +24h (QT-04); đúng 1 dòng log đầu tiên (QT-06).
5. **Tên test trong code:** `tests/ticket.service.test.js` → "TC01 - Luồng đúng …"
6. **Kết quả thực tế:** tệp `ticket.service.test.js` chạy 12/12 test PASS, trong đó có test này.
7. **PASS/FAIL:** PASS

### TC-02 · Luồng đúng · Tích hợp · Ưu tiên Cao
1. **Tiền điều kiện:** `smartcrm_test` đã seed; đăng nhập `nv1`; đếm trước hai bảng `ticket` và `ticket_status_log`.
2. **Các bước:** `POST /api/tickets`; đếm lại hai bảng; đọc dòng log của phiếu mới.
3. **Dữ liệu thử:** `{customer_id:1, device_id:1, issue_desc:"Thiet bi khong len nguon, man hinh soc xanh"}`.
4. **Kết quả mong đợi:** 201; `ticket_code` đúng dạng `BH-######/####`; mỗi bảng tăng đúng 1; dòng log có `from_status` rỗng, `to_status = MOI`.
5. **Tên test trong code:** `tests/integration.db.test.js` → "TC-08 tao phieu …"
6. **Kết quả thực tế:** `ticket` 38 → 39 và `ticket_status_log` 38 → 39 (mỗi bảng +1).
7. **PASS/FAIL:** PASS

### TC-03 · Luồng đúng · Unit · Ưu tiên Trung bình
1. **Tiền điều kiện:** có phiếu do Quản lý tạo cho khách có SĐT `0901234567`.
2. **Các bước:** nhân viên gọi `getTicket`; Quản lý gọi `getTicket`.
3. **Dữ liệu thử:** phiếu vừa tạo.
4. **Kết quả mong đợi:** nhân viên thấy `090****567`; Quản lý thấy `0901234567` (QT-15).
5. **Tên test trong code:** `tests/ticket.service.test.js` → "QT-15: nhân viên thấy SĐT đã che …"
6. **Kết quả thực tế:** nằm trong 12/12 PASS của `ticket.service.test.js`.
7. **PASS/FAIL:** PASS

### TC-04 · Luồng đúng · Unit · Ưu tiên Trung bình
1. **Tiền điều kiện:** phiếu cho thiết bị thiếu ngày mua (`warranty_verified = false`, luồng 5a).
2. **Các bước:** nhân viên thử phê duyệt; Quản lý phê duyệt; Quản lý phê duyệt lần hai.
3. **Dữ liệu thử:** `{isWarranty: true}`.
4. **Kết quả mong đợi:** bước 1 `FORBIDDEN`; bước 2 thành công, `warrantyVerified = true`; bước 3 `WARRANTY_ALREADY_VERIFIED` (409).
5. **Tên test trong code:** `tests/ticket.service.test.js` → "Phê duyệt bảo hành: chỉ Quản lý, và chỉ một lần (409)"
6. **Kết quả thực tế:** nằm trong 12/12 PASS của `ticket.service.test.js`.
7. **PASS/FAIL:** PASS

### TC-05 · Giá trị biên (dưới ranh giới) · API · Ưu tiên Cao
1. **Tiền điều kiện:** `smartcrm_test` đã seed; đăng nhập `nv1`; ghi lại số dòng `ticket`.
2. **Các bước:** `POST /api/tickets` với mô tả đúng 9 ký tự; đếm lại `ticket`.
3. **Dữ liệu thử:** `issue_desc` = "a" × 9 (ràng buộc 10–2000 ký tự).
4. **Kết quả mong đợi:** 400; không tạo phiếu.
5. **Tên test trong code:** `tests/robustness.test.js` → "BIEN 9 ky tu -> 400"
6. **Kết quả thực tế:** 400; `ticket` 39 → 39 (không thêm bản ghi).
7. **PASS/FAIL:** PASS

### TC-06 · Giá trị biên (trên ranh giới) · API · Ưu tiên Cao
1. **Tiền điều kiện:** như TC-05.
2. **Các bước:** `POST /api/tickets` với mô tả đúng 10 ký tự; đếm lại `ticket`.
3. **Dữ liệu thử:** `issue_desc` = "a" × 10.
4. **Kết quả mong đợi:** 201; `ticket` tăng 1.
5. **Tên test trong code:** `tests/robustness.test.js` → "BIEN 10 ky tu -> 201"
6. **Kết quả thực tế:** 201; `ticket` 39 → 40.
7. **PASS/FAIL:** PASS

### TC-07 · Dữ liệu sai · Unit · Ưu tiên Cao
1. **Tiền điều kiện:** không cần CSDL.
2. **Các bước:** gọi `validateCreateTicket` với mô tả rỗng.
3. **Dữ liệu thử:** `{customer_id:1, device_id:1, issue_desc:""}`.
4. **Kết quả mong đợi:** lỗi `VALIDATION_FAILED`, chi tiết có tên trường `issue_desc`.
5. **Tên test trong code:** `tests/ticket.service.test.js` → "TC03 - Dữ liệu sai …"
6. **Kết quả thực tế:** nằm trong 12/12 PASS của `ticket.service.test.js`. Test này kiểm mã lỗi nghiệp vụ và tên trường; mã HTTP 400 kèm `fields` được kiểm ở `tests/api.test.js` và thấy khi gọi API thật (`VALIDATION_FAILED`, `fields.username` / `fields.password`).
7. **PASS/FAIL:** PASS

### TC-08 · Dữ liệu sai · API · Ưu tiên Trung bình
1. **Tiền điều kiện:** có một phiếu do `nv1` vừa tạo, trạng thái MOI.
2. **Các bước:** `PATCH /api/tickets/{id}` đổi mức ưu tiên.
3. **Dữ liệu thử:** `{priority: "KHAN_CAP"}` (không thuộc CAO, TRUNG_BINH, THAP).
4. **Kết quả mong đợi:** 400, không phải 500.
5. **Tên test trong code:** `tests/robustness.test.js` → "doi uu tien sang gia tri khong hop le -> 400 …"
6. **Kết quả thực tế:** 400, không phải 500.
7. **PASS/FAIL:** PASS

### TC-09 · Bảo mật A01 (QT-14) · API · Ưu tiên Cao
1. **Tiền điều kiện:** `nv1` (trung tâm 1) tạo phiếu; `nv2` thuộc trung tâm 2; ghi lại `priority`, `status`, `is_deleted` của phiếu.
2. **Các bước:** đăng nhập `nv2`; `GET`, `PATCH`, soft-delete phiếu đó; đọc lại dòng phiếu trong CSDL; `nv1` đọc lại phiếu của mình.
3. **Dữ liệu thử:** token `nv2`; `{priority: "THAP"}`.
4. **Kết quả mong đợi:** 403 hoặc 404, không bao giờ 200; dữ liệu phiếu không đổi; `nv1` vẫn đọc được.
5. **Tên test trong code:** `tests/security.api.test.js` → "TC-11 A01 …"
6. **Kết quả thực tế:** 4/4 PASS: GET, PATCH, soft-delete của `nv2` đều bị từ chối, phiếu không đổi; `nv1` vẫn đọc được phiếu của mình. Khi tạm vô hiệu hóa kiểm tra trung tâm trong `getOwnTicket`, test GET và PATCH chuyển ĐỎ (2 failed) và test QT-14 ở tầng unit cũng đỏ; hoàn lại bằng `git checkout` thì xanh trở lại.
7. **PASS/FAIL:** PASS

### TC-10 · Bảo mật A07 · API · Ưu tiên Cao
1. **Tiền điều kiện:** đăng nhập `nv1` lấy token.
2. **Các bước:** sửa đúng một ký tự cuối của token; `GET /api/tickets` với token đã sửa.
3. **Dữ liệu thử:** token hợp lệ bị đổi ký tự cuối.
4. **Kết quả mong đợi:** 401.
5. **Tên test trong code:** `tests/security.owasp.test.js` → "TC-14 token bi sua mot ky tu -> 401"
6. **Kết quả thực tế:** 401.
7. **PASS/FAIL:** PASS

### TC-11 · Tính tái lập (C8) · Tích hợp · Ưu tiên Cao
1. **Tiền điều kiện:** `smartcrm_test` đã chạy `db:setup` một lần.
2. **Các bước:** chạy `npm run db:setup`, đếm 6 bảng; chạy lần hai, đếm lại.
3. **Dữ liệu thử:** bảng `customer, device, issue_category, employee, ticket, ticket_status_log`.
4. **Kết quả mong đợi:** lần hai không lỗi; số dòng mọi bảng không đổi.
5. **Tên test trong code:** `tests/integration.db.test.js` → "TC-10 db:setup chay lan hai …"
6. **Kết quả thực tế:** lần hai không lỗi; số dòng giữ nguyên: customer 3, device 4, issue_category 6, employee 3, ticket 42, ticket_status_log 42.
7. **PASS/FAIL:** PASS

### TC-12 · Hồi quy BUG-004 (seed rỗng) · Tích hợp · Ưu tiên Cao
1. **Tiền điều kiện:** CSDL đã chạy `db:setup`.
2. **Các bước:** đếm 4 bảng danh mục; kiểm có đủ `ql1`, `nv1`, `nv2`.
3. **Dữ liệu thử:** bảng `customer, device, issue_category, employee`.
4. **Kết quả mong đợi:** mỗi bảng > 0 dòng; đủ ba tài khoản mẫu.
5. **Tên test trong code:** `tests/regression.bt2.test.js` → "TC-24 (BUG-004) …"
6. **Kết quả thực tế:** 5/5 kiểm PASS trên CSDL đã seed. Trên CSDL chỉ có migration, không có seed (tái hiện trạng thái BUG-004), cả 5 kiểm ĐỎ (`Received: 0`, danh sách tài khoản rỗng).
7. **PASS/FAIL:** PASS

## Ghi chú trung thực

- Kết quả PASS ghi theo lần chạy ngày 6/11/2026 trên bản clone sạch; số test của `npm test` đã tăng từ 33 lên 37 sau khi thêm test nhất quán lược đồ và tài liệu, các test case trên không thay đổi.
- Ngoài 12 test case chính, bộ test còn có test cho QT-03, QT-13, QT-04, A02, A04, A05, đầu vào bất thường và hồi quy BUG-003; chúng chạy cùng các lệnh trên.
- Phép thử "làm sai có chủ đích" ở TC-09 và TC-12 chỉ để chứng minh test có khả năng thất bại; mã nguồn thật đã được hoàn lại.
- Ảnh chụp của từng test case nằm ở `docs/screenshots/`. Đối chiếu trước khi nộp: đã có ảnh cho TC-01, 03, 04, 06, 07, 08, 09, 10, 11, 12; còn thiếu ảnh TC-02 và ảnh TC-05 (9 ký tự trả 400, số `ticket` không đổi).
