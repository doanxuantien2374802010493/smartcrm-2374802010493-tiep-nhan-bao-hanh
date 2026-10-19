# Nhật ký thay đổi thiết kế (Design Change Log)

* **Sinh viên:** Đoàn Xuân Tiến
* **MSSV:** 2374802010493
* **Lớp:** 261_71ITGR40203_03
* **Luồng / Hệ thống:** L2 – Tiếp nhận và phân loại yêu cầu bảo hành (SmartCRM, Mekong Mobile) · Track SE
* **Repository:** `smartcrm-2374802010493-tiep-nhan-bao-hanh` (Branch: `main` + `dev`)
* **Tệp tương ứng trong repo:** `docs/thay-doi-thiet-ke.md`
* **Thời gian cập nhật:** Ngày 19/10/2026 (Sau phản hồi Bài tập 1 - Buổi 8)

---

## TỔNG QUAN TÌNH HÌNH PHẢN HỒI VÀ HƯỚNG XỬ LÝ

Bài tập 1 đạt kết quả 7/10. Sáu điểm giảng viên góp ý đã được rà soát và xử lý theo đúng quy trình 4 bước của Buổi 8:
1. Đọc hết toàn bộ phản hồi từ Giảng viên.
2. Quản lý quyết định **SỬA** hoặc **GIỮ** cho từng điểm.
3. Ghi lại lý do kỹ thuật và đánh giá phạm vi ảnh hưởng.
4. Cập nhật lại toàn bộ Sơ đồ, SRS, DDL Script và Kiến trúc cho đồng bộ.

**Kết quả:** Cả 6 điểm góp ý đều được quyết định **SỬA**, không có điểm nào giữ nguyên. Mỗi thay đổi được cấp mã định danh **TD-01** đến **TD-06** để làm căn cứ đối soát và truy vết ở Bài tập 2 và Bài tập 3.

---

## BẢNG TỔNG HỢP NỘI DUNG THAY ĐỔI

| Mã TD | Điểm được góp ý | Quyết định | Phần bị ảnh hưởng |
| :--- | :--- | :--- | :--- |
| **TD-01** | Gắn lập luận kiến trúc số 3 với NFR4 | **SỬA** | Mục 3 BT1, DDL Script (Functions & Triggers), Service Layer (BT2) |
| **TD-02** | Giảm ERD/DDL từ 7 bảng xuống 6 bảng | **SỬA** | ERD Diagram, DDL Schema (`migrations/`), Bảng mô tả CSDL Mục 4 |
| **TD-03** | Bổ sung đặc tả Use Case UC2 đầy đủ | **SỬA** | Mục 2 BT1 (Đặc tả UC2), Test Suite (BT2) |
| **TD-04** | Ghi rõ từng Wireframe nối với Use Case nào | **SỬA** | Mục 5 BT1 (Wireframe UI), Frontend Components (BT2) |
| **TD-05** | Nộp một file PDF duy nhất, tên file chứa MSSV | **SỬA** | Quy trình đóng gói và quy định nộp bài |
| **TD-06** | Sửa ngày nộp thực tế trên trang bìa | **SỬA** | Trang bìa báo cáo Báo cáo thực hành / BT1 / BT2 |

---

## CHI TIẾT CÁC THAY ĐỔI THIẾT KẾ (TD-01 → TD-06)

### TD-01: Gắn lập luận kiến trúc số 3 với NFR4
* **Phản hồi của GV:** Lập luận kiến trúc số 3 chưa gắn với NFR4 (100% lần chuyển trạng thái đều có bản ghi log và 100% phiếu không xóa vật lý).
* **Quyết định:** **SỬA**
* **Lý do kỹ thuật:** NFR4 là yêu cầu cốt lõi về toàn vẹn dữ liệu và tính minh bạch lịch sử. Một quyết định kiến trúc chuẩn SE phải chỉ ra rõ nó giải quyết NFR nào và chấp nhận những đánh đổi (trade-offs) gì. Nếu không gắn NFR4, lập luận sẽ mất tính truy vết (traceability) về bản SRS.
* **Ảnh hưởng & Hiện thực:**
  * **BT1 (Mục 3):** Viết lại lập luận kiến trúc số 3 theo chuẩn: *"Vì NFR4 yêu cầu 100% phiếu không bị xóa vật lý và 100% lần chuyển trạng thái đều có bản ghi trong `ticket_status_log`, tôi chọn ghi log trong cùng Transaction với việc đổi trạng thái, chỉ cung cấp hàm cập nhật cờ `is_deleted` (không tạo endpoint DELETE) và thêm Trigger chặn UPDATE/DELETE ở tầng CSDL; đánh đổi là tăng thời gian xử lý khi ghi và mọi câu truy vấn SELECT phải kèm điều kiện `WHERE is_deleted = false`."*
  * **SRS (Mục 4):** NFR4 nêu định lượng rõ ràng: *100% phiếu không bị xóa vật lý, 100% lần chuyển trạng thái đều lưu log.*
  * **DDL (`migrations/001_create_tables.sql`):** Khai báo hàm `forbid_change()` và 2 triggers: `trg_log_append_only` (chặn sửa/xóa log) và `trg_ticket_no_delete` (chặn xóa vật lý phiếu).
  * **BT2 (Service Layer):** Hàm chuyển trạng thái và hàm tạo phiếu phải bọc trong CSDL Transaction (`BEGIN ... COMMIT`) để ghi đồng thời vào 2 bảng `ticket` và `ticket_status_log`.

---

### TD-02: Giảm ERD/DDL từ 7 xuống còn 6 bảng chuẩn 3NF
* **Phản hồi của GV:** Sơ đồ ERD/DDL đang có 7 bảng, vượt mức khuyến nghị 4–6 bảng cho dự án prototype; phần văn bản mô tả phải ghi đúng số lượng bảng.
* **Quyết định:** **SỬA**
* **Lý do kỹ thuật:** Phạm vi luồng L2 (Tiếp nhận & phân loại bảo hành) chỉ cần 5 bảng cốt lõi và 1 bảng phụ trợ phân quyền tối thiểu. Bảng trung tâm bảo hành (`service_center`) nằm ngoài phạm vi prototype (không làm các luồng L4, L5, L6); việc lưu `center_id` dưới dạng cột định danh trực tiếp trong bảng `employee` và `ticket` là đủ để đáp ứng quy tắc `QT-14`.
* **Ảnh hưởng & Hiện thực:**
  * **Sơ đồ ERD & CSDL:** Rút gọn còn đúng **6 bảng**: `customer`, `device`, `issue_category`, `ticket`, `ticket_status_log`, `employee`.
  * **Cấu trúc bảng:** `center_id` tại `employee` và `ticket` trở thành cột thuộc tính thường (không gắn Foreign Key sang bảng `service_center`). Khách hàng sở hữu phiếu được suy ra qua `device.customer_id` để giữ đúng chuẩn chuẩn hóa 3NF.
  * **BT2 (Migrations & Seed):** File `migrations/001_create_tables.sql` và seed data dựng đúng 6 bảng, không dư thừa.

---

### TD-03: Bổ sung đặc tả Use Case UC2 đầy đủ
* **Phản hồi của GV:** Đặc tả UC2 (Tạo phiếu bảo hành mới) còn thiếu các mục: Mục tiêu, Điều kiện trước, Điều kiện sau và Danh sách User Story liên quan.
* **Quyết định:** **SỬA**
* **Lý do kỹ thuật:** Nếu thiếu các mục này, lập trình viên và kiểm thử viên sẽ không xác định được ngữ cảnh khởi tạo, trạng thái kết thúc hợp lệ và không thể truy vết với danh sách User Story để viết Unit Tests.
* **Ảnh hưởng & Hiện thực:**
  * **BT1 (Mục 2):** Bổ sung đầy đủ thông tin UC2 bao gồm:
    * *Actor chính:* Nhân viên tiếp nhận (Mức: MUST).
    * *Mục tiêu:* Ghi nhận yêu cầu bảo hành vào hệ thống để theo dõi xuyên suốt vòng đời.
    * *User Story liên quan:* US1, US3, US4, US5, US6.
    * *Điều kiện trước:* Nhân viên đã đăng nhập và được phân quyền tại trung tâm tiếp nhận.
    * *Điều kiện sau:* Một bản ghi `ticket` ở trạng thái `MOI` được khởi tạo thành công cùng dòng bản ghi đầu tiên trong `ticket_status_log` (`from_status = NULL`, `to_status = 'MOI'`).
    * *Luồng chính 9 bước* và *các luồng ngoại lệ (3a, 5a, 8a)*.
  * **BT2 (Unit Test Suite):** Luồng ngoại lệ 5a (thiếu ngày mua $\rightarrow$ `warranty_verified = false`, chờ Quản lý duyệt) được chuyển hóa trực tiếp thành Test Case kiểm thử đơn vị (`TC02`).

---

### TD-04: Ghi rõ mối liên kết Wireframe UI với Use Case
* **Phản hồi của GV:** Wireframe thiết kế giao diện chưa thể hiện rõ từng màn hình dùng để phục vụ Use Case nào.
* **Quyết định:** **SỬA**
* **Lý do kỹ thuật:** Màn hình giao diện là phương tiện để Actor tương tác với Use Case. Việc gắn mã UC/US bên dưới mỗi wireframe giúp đảm bảo tính đồng bộ giữa thiết kế UI và tài liệu phân tích.
* **Ảnh hưởng & Hiện thực:**
  * **BT1 (Mục 5):** Bổ sung chi tiết liên kết cho 3 màn hình:
    * *Màn hình 1 (Danh sách phiếu bảo hành):* Phục vụ UC6, UC7 (Truy vết: US4, US7). Hiển thị danh sách, che 4 số giữa của SĐT theo NFR2 và đánh dấu cờ chờ duyệt.
    * *Màn hình 2 (Form tạo phiếu bảo hành):* Phục vụ UC1, UC2, UC3, UC4, UC5 (Truy vết: US1, US2, US3, US4, US5, US6). Tra cứu khách hàng, chọn thiết bị, xác định hạn bảo hành và gợi ý nhóm sự cố.
    * *Màn hình 3 (Chi tiết phiếu & Nhật ký lịch sử):* Phục vụ UC6, UC7 (Truy vết: US4, US7). Xem tiến trình trạng thái và nút phê duyệt bảo hành dành cho vai trò Quản lý.
  * **BT2 (Frontend Module):** Hiện thực 3 màn hình chuẩn theo Wireframe và kết nối API thật.

---

### TD-05: Chuẩn hóa định dạng và tên file nộp bài (PDF + MSSV)
* **Phản hồi của GV:** Bài nộp đang ở định dạng `.docx` và tên file thiếu mã số sinh viên (MSSV).
* **Quyết định:** **SỬA**
* **Lý do kỹ thuật:** Tuân thủ đúng quy định hình thức nộp bài của học phần để thuận tiện cho việc chấm điểm và lưu trữ bài làm.
* **Ảnh hưởng & Hiện thực:**
  * Xuất toàn bộ báo cáo ra **1 file PDF duy nhất**.
  * Đặt tên file theo đúng cú pháp quy định: `BT2_2374802010493_DoanXuanTien.pdf`.
  * Các file `.docx` hay `.md` chỉ đóng vai trò là bản thảo chỉnh sửa nội bộ trong repo.

---

### TD-06: Sửa ngày nộp thực tế trên trang bìa
* **Phản hồi của GV:** Ngày nộp ghi trên trang bìa chưa chính xác với thời điểm nộp thực tế.
* **Quyết định:** **SỬA**
* **Lý do kỹ thuật:** Thông tin thời gian nộp bài trên trang bìa phải chính xác để làm căn cứ xét duyệt nộp bài đúng hạn.
* **Ảnh hưởng & Hiện thực:**
  * Cập nhật ngày nộp thực tế của bản sửa Bài tập 1 và các bài tập tiếp theo (BT2/BT3) ngay trên trang bìa trước khi xuất file PDF chính thức.

---

## TÁC ĐỘNG TỔNG THỂ KHI CHUYỂN SANG BÀI TẬP 2 (BT2)

Các thay đổi từ **TD-01** đến **TD-06** được áp dụng trực tiếp vào mã nguồn của **Bài tập 2** như sau:
1. **Migration & DDL:** Dựng đúng 6 bảng trong PostgreSQL/Prisma, gắn Trigger `forbid_change()` để chặn lệnh `DELETE` vật lý và cấm chỉnh sửa `ticket_status_log` (Đáp ứng TD-01, TD-02).
2. **Business Logic trong Service Layer:**
   * Hàm `createTicket()` tự động tạo bản ghi `ticket` và ghi ngay bản ghi khởi tạo trạng thái `MOI` vào `ticket_status_log` trong cùng 1 Transaction (Đáp ứng TD-01, TD-03).
   * Kiểm tra điều kiện ngày mua: Nếu thiếu ngày mua $\rightarrow$ tự động gán `is_warranty = false` và `warranty_verified = false` (Đáp ứng TD-03).
3. **Unit Tests:** Xây dựng bộ Unit Tests kiểm thử tính đúng đắn của logic `QT-04` (tính hạn cam kết SLA) và `QT-05` (xác minh bảo hành).
4. **Giao diện Frontend:** Dựng 3 màn hình React/Vite chuẩn theo Wireframe ở TD-04, gọi API thực tế và xử lý đủ 3 trạng thái giao diện (Loading, Empty, Success/Error).

---

*(Ghi chú: Mọi thay đổi phát sinh tiếp theo sau phản hồi Bài tập 2 sẽ được bổ sung tiếp nối vào tệp này bắt đầu từ mã **TD-07**).*