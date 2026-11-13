# Nhật ký thay đổi thiết kế (Design Change Log)

* **Sinh viên:** Đoàn Xuân Tiến
* **MSSV:** 2374802010493
* **Lớp:** 261_71ITGR40203_03
* **Luồng / Hệ thống:** L2 – Tiếp nhận và phân loại yêu cầu bảo hành (SmartCRM, Mekong Mobile) · Track SE
* **Repository:** `smartcrm-2374802010493-tiep-nhan-bao-hanh` (Branch: `main` + `dev`)
* **Tệp tương ứng trong repo:** `docs/thay-doi-thiet-ke.md`
* **Thời gian cập nhật:** Ngày 13/11/2026 (Sau phản hồi Bài tập 1 - Buổi 8 và Bài tập 2)

---

## TỔNG QUAN TÌNH HÌNH PHẢN HỒI VÀ HƯỚNG XỬ LÝ

Bài tập 1 đạt kết quả 7/10. Sáu điểm giảng viên góp ý đã được rà soát và xử lý theo đúng quy trình 4 bước của Buổi 8:
1. Đọc hết toàn bộ phản hồi từ Giảng viên.
2. Quản lý quyết định **SỬA** hoặc **GIỮ** cho từng điểm.
3. Ghi lại lý do kỹ thuật và đánh giá phạm vi ảnh hưởng.
4. Cập nhật lại toàn bộ Sơ đồ, SRS, DDL Script và Kiến trúc cho đồng bộ.

**Kết quả BT1:** Cả 6 điểm góp ý đều được quyết định **SỬA**, không có điểm nào giữ nguyên. Mỗi thay đổi được cấp mã định danh **TD-01** đến **TD-06** để làm căn cứ đối soát và truy vết ở Bài tập 2 và Bài tập 3.

Bài tập 2 đạt kết quả 9.5/10. Giảng viên ghi nhận điểm mạnh (CSDL 6 bảng có trigger, QT-01→06 và QT-13→15, CRUD khách hàng và phiếu, JWT phân quyền theo trung tâm, 33 kiểm thử Jest PASS, giao diện React 3 màn hình đủ ba trạng thái, mục kiểm chứng bảng 4.2 đạt đủ) và nêu **hai điểm cần khắc phục**, được ghi nhận với mã **TD-11** và **TD-12**. Thay đổi phát sinh khi hiện thực BT2 là TD-07 đến TD-10; thay đổi phát sinh khi hiện thực BT3 là TD-13 đến TD-15.

---

## BẢNG TỔNG HỢP NỘI DUNG THAY ĐỔI

| Mã TD | Điểm được góp ý / nguồn phát sinh | Quyết định | Phần bị ảnh hưởng |
| :--- | :--- | :--- | :--- |
| **TD-01** | Gắn lập luận kiến trúc số 3 với NFR4 | **SỬA** | Mục 3 BT1, DDL Script (Functions & Triggers), Service Layer (BT2) |
| **TD-02** | Giảm ERD/DDL từ 7 bảng xuống 6 bảng | **SỬA** | ERD Diagram, DDL Schema (`migrations/`), Bảng mô tả CSDL Mục 4 |
| **TD-03** | Bổ sung đặc tả Use Case UC2 đầy đủ | **SỬA** | Mục 2 BT1 (Đặc tả UC2), Test Suite (BT2) |
| **TD-04** | Ghi rõ từng Wireframe nối với Use Case nào | **SỬA** | Mục 5 BT1 (Wireframe UI), Frontend Components (BT2) |
| **TD-05** | Nộp một file PDF duy nhất, tên file chứa MSSV | **SỬA** | Quy trình đóng gói và quy định nộp bài |
| **TD-06** | Sửa ngày nộp thực tế trên trang bìa | **SỬA** | Trang bìa báo cáo |
| **TD-07** | Cột đăng nhập cho bảng `employee` | **SỬA (bổ sung)** | Migration `002`, ERD |
| **TD-08** | Endpoint ngoài hợp đồng BT1 | **SỬA (bổ sung)** | `docs/api-docs.md`, routes |
| **TD-09** | Dùng `pg` thay Prisma | **SỬA** | `src/repositories/`, `package.json` |
| **TD-10** | Không hiện thực QT-09 | **GIỮ** | README, bộ test |
| **TD-11** | Docker chưa kiểm chứng trên máy sinh viên | **SỬA** | `Dockerfile`, `docker-compose.yml`, `docs/deployment-guide.md`, README |
| **TD-12** | Chưa có chức năng thêm hồ sơ thiết bị cho khách mới | **GIỮ** (hạn chế đã biết) | README, Deployment Guide (Known limitations) |
| **TD-13** | Lược đồ CSDL có hai nguồn (BUG-006) | **SỬA** | `db/schema.sql` (xóa), `tests/` |
| **TD-14** | Thiếu kiểm thử trên CSDL thật và kiểm thử nhất quán tài liệu | **SỬA (bổ sung)** | `tests/`, `package.json` |
| **TD-15** | Phân quyền `GET /api/tickets` khác hợp đồng BT2 | **SỬA hợp đồng** | `docs/api-contract.md`, `docs/api-docs.md` |

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
  * Đặt tên file theo đúng cú pháp quy định: `BT2_2374802010493_DoanXuanTien.pdf` (BT1/BT2). Bài tập 3 đặt tên `BT3_2374802010493_DoanXuanTien.pdf`.
  * Các file `.docx` hay `.md` chỉ đóng vai trò là bản thảo chỉnh sửa nội bộ trong repo.

---

### TD-06: Sửa ngày nộp thực tế trên trang bìa
* **Phản hồi của GV:** Ngày nộp ghi trên trang bìa chưa chính xác với thời điểm nộp thực tế.
* **Quyết định:** **SỬA**
* **Lý do kỹ thuật:** Thông tin thời gian nộp bài trên trang bìa phải chính xác để làm căn cứ xét duyệt nộp bài đúng hạn.
* **Ảnh hưởng & Hiện thực:**
  * Cập nhật ngày nộp thực tế của bản sửa Bài tập 1 và các bài tập tiếp theo (BT2/BT3) ngay trên trang bìa trước khi xuất file PDF chính thức.

---

## THAY ĐỔI PHÁT SINH KHI HIỆN THỰC BÀI TẬP 2 (TD-07 → TD-10)

### TD-07: Bổ sung cột đăng nhập cho bảng employee
* **Nguồn phát sinh:** API contract mục 5 yêu cầu xác thực JWT và gán `center_id` từ token (QT-14), nhưng ERD BT1 chưa có thông tin đăng nhập.
* **Quyết định:** **SỬA (bổ sung)**
* **Lý do kỹ thuật:** Không có tên đăng nhập và mật khẩu băm thì không xác định được người dùng, vai trò và trung tâm của họ.
* **Ảnh hưởng & Hiện thực:** Migration `002_triggers_and_auth.sql` thêm `username` (UNIQUE) và `password_hash` vào `employee`. ERD vẫn 6 bảng. Nguồn sự thật về lược đồ là `migrations/` (xem TD-13); hai cột mới được thêm vào `erd.drawio` để khớp.

### TD-08: Bổ sung endpoint ngoài hợp đồng BT1
* **Nguồn phát sinh:** Đề BT2 yêu cầu ≥ 2 thực thể đủ CRUD và giao diện cần danh sách phiếu; hợp đồng BT1 chưa có các endpoint này.
* **Quyết định:** **SỬA (bổ sung)**
* **Lý do kỹ thuật:** Đủ thao tác tạo, đọc, sửa, xóa cho `customer` và `ticket`. "Xóa" là xóa mềm bằng `POST /:id/soft-delete`, vẫn không có endpoint DELETE (QT-13).
* **Ảnh hưởng & Hiện thực:** Thêm `POST /api/auth/login`, `GET/PATCH /api/customers/{id}`, `POST /api/customers/{id}/soft-delete`, `GET /api/tickets`, `PATCH /api/tickets/{id}`, `POST /api/tickets/{id}/soft-delete`, `GET /api/issue-categories`. `docs/api-contract.md` giữ nguyên là hợp đồng BT1/BT2 (lịch sử); `docs/api-docs.md` là tài liệu mô tả hệ thống thật (15 endpoint) và là căn cứ khi hai tài liệu khác nhau.

### TD-09: Dùng thư viện pg (SQL thuần) thay cho Prisma; kiểm thử bằng Jest
* **Nguồn phát sinh:** Stack ghi ở BT1 là PostgreSQL/Prisma; khi hiện thực chọn `pg` trực tiếp.
* **Quyết định:** **SỬA**
* **Lý do kỹ thuật:** Lớp repository viết SQL tường minh, giao dịch ghi phiếu cùng log (NFR4) kiểm soát bằng `BEGIN/COMMIT`, không cần bước sinh client; dễ giải thích từng dòng khi vấn đáp.
* **Ảnh hưởng & Hiện thực:** Chỉ ảnh hưởng `src/repositories/` và `package.json`; ba lớp và DDL không đổi.

### TD-10: Không hiện thực QT-09 (chặn phiếu mở trùng) trong BT2
* **Nguồn phát sinh:** README và test cũ nhắc QT-09, nhưng SRS BT1 (mục quy tắc nghiệp vụ) không có QT-09.
* **Quyết định:** **GIỮ NGUYÊN thiết kế BT1** (không thêm quy tắc ngoài SRS)
* **Lý do kỹ thuật:** BT2 phải hiện thực đúng thiết kế đã nộp; quy tắc không có trong SRS thì không truy vết được. Các quy tắc hiện thực: QT-01, QT-02, QT-03, QT-04, QT-05, QT-06, QT-13, QT-14, QT-15.
* **Ảnh hưởng & Hiện thực:** README và bộ test không còn nhắc QT-09. Nếu muốn giữ, phải bổ sung QT-09 vào `docs/srs.md` trước.

---

## PHẢN HỒI BÀI TẬP 2 CỦA GIẢNG VIÊN VÀ HƯỚNG XỬ LÝ (TD-11 → TD-12)

### TD-11: Kiểm chứng đóng gói Docker trên máy sinh viên
* **Phản hồi của GV:** Docker chưa kiểm chứng trên máy em (em đã ghi nhận).
* **Quyết định:** **SỬA**
* **Lý do kỹ thuật:** Cấu hình Docker chưa chạy thử thì không chứng minh được người khác dựng lại hệ thống từ thư mục trống bằng tối đa 2 lệnh. Phải chạy thật trên bản clone sạch, không dùng thư mục đang làm việc.
* **Ảnh hưởng & Hiện thực:**
  * Cài Docker Desktop 4.99.0 (Engine 29.9.3, Compose v5.7.0) trên Windows 11 với WSL 2; `docker run hello-world` chạy được (13/11/2026).
  * Phép thử máy trắng trên bản clone sạch (`cp .env.example .env`, `docker compose up -d --build`): `app` và `db` đều healthy, cổng 3000 mở ra máy, log có migration 001, 002 và seed, `/api/health` trả `{"status":"ok"}`, `docker compose exec app npm test` báo 4 suite, 35 test PASS.
  * Chạy lại `npm run db:setup` nhiều lần: số dòng các bảng giữ nguyên (3, 3, 4, 6, 3, 3), không nhân đôi dữ liệu.
  * Hai sự cố thật đã gặp và ghi vào mục Troubleshooting của Deployment Guide: `port is already allocated` (stack cũ giữ cổng 3000) và `getaddrinfo EAI_AGAIN db` khi chạy lại `up` sau lần thất bại; cả hai hết sau `docker compose down` rồi `up -d --build`.
  * Deployment Guide tiếng Anh (`docs/deployment-guide.md`), README cập nhật theo thực tế.
  * Docker Compose chỉ gồm hai dịch vụ `app` và `db`. Giao diện React không chạy trong Compose, chạy riêng bằng `npm run dev` (ngoài phạm vi gói đóng gói BT3, vì API là phần kiểm chứng bằng Guide).

### TD-12: Chức năng thêm hồ sơ thiết bị cho khách mới
* **Phản hồi của GV:** Chưa có chức năng thêm hồ sơ thiết bị cho khách mới.
* **Nguồn của vấn đề:** Phiếu cần `device_id` (QT-03: thiết bị phải thuộc khách). Khách mới tạo qua `POST /api/customers` chưa có thiết bị nào, nên chưa thể tạo phiếu cho khách đó trừ khi chèn dữ liệu bằng SQL.
* **Quyết định:** **GIỮ**, ghi nhận là hạn chế đã biết
* **Lý do kỹ thuật:** Gói BT3 tập trung vào kiểm thử, đóng gói và tài liệu; thêm endpoint mới kéo theo validator, kiểm quyền theo trung tâm, test và cập nhật toàn bộ tài liệu, trong khi `docs/api-docs.md` phải mô tả đúng hệ thống đã kiểm chứng (15 endpoint). Hạn chế này không làm sai quy tắc nào đã hiện thực (QT-03 vẫn được bảo vệ). *Lưu ý khi chốt bài: mở `docs/srs.md` kiểm tra hồ sơ thiết bị có thuộc phạm vi UC/US của L2 không; nếu không có thì ghi thêm "không có trong SRS BT1, thêm vào cần bổ sung SRS".*
* **Ảnh hưởng & Hiện thực:** Ghi vào README và Deployment Guide mục "Known limitations": khách mới chưa có thiết bị thì chưa thể tạo phiếu; thiết bị hiện chỉ có trong dữ liệu mẫu (4 thiết bị). Hướng phát triển: thêm `POST /api/customers/{id}/devices` (body `device_name`, `serial_no`, `purchase_date`, `warranty_months`) kèm kiểm quyền theo trung tâm, test và cập nhật API docs lên 16 endpoint.

---

## THAY ĐỔI PHÁT SINH KHI HIỆN THỰC BÀI TẬP 3 (TD-13 → TD-15)

### TD-13: Lược đồ CSDL chỉ có một nguồn sự thật là `migrations/`
* **Nguồn phát sinh:** BUG-006. Tệp `db/schema.sql` có 7 bảng (thừa `service_center`), lệch với `migrations/` (6 bảng theo TD-02).
* **Quyết định:** **SỬA**
* **Lý do kỹ thuật:** Hai nguồn lược đồ khác nhau làm sai quyết định TD-02 và khiến người dựng lại hệ thống không biết dùng tệp nào.
* **Ảnh hưởng & Hiện thực:** Xóa `db/schema.sql`; thêm `tests/schema.consistency.test.js` (đỏ trước khi sửa, xanh sau khi sửa). Commit `47dafb0`.

### TD-14: Bổ sung kiểm thử tích hợp trên CSDL thật và kiểm thử nhất quán tài liệu
* **Nguồn phát sinh:** README BT2 ghi "kiểm thử Jest không cần CSDL"; BT3 yêu cầu test PASS bằng một lệnh và test case chạy thật.
* **Quyết định:** **SỬA (bổ sung)**
* **Lý do kỹ thuật:** Test dùng repository giả không chứng minh được trigger, giao dịch và seed. Cần test chạy trên PostgreSQL thật (`npm run test:integration`) và test chặn tài liệu mô tả sai hệ thống (`tests/docs.consistency.test.js`).
* **Ảnh hưởng & Hiện thực:** Trong container chạy 4 suite (35 test) vì `.dockerignore` loại test đọc README; trên máy chủ chạy 5 suite (37 test).

### TD-15: Phân quyền xem danh sách phiếu khác hợp đồng BT2
* **Nguồn phát sinh:** Hợp đồng BT2 ghi `GET /api/tickets` chỉ dành cho Quản lý; hệ thống thật cho phép `nv1` (Nhân viên) gọi `GET /api/tickets?page=1&size=2` và nhận 200 (`total` = 3).
* **Quyết định:** **SỬA hợp đồng cho khớp mã**
* **Lý do kỹ thuật:** Màn hình danh sách phiếu (TD-04, UC6/UC7) phục vụ cả Nhân viên tiếp nhận, nên chặn Nhân viên sẽ làm hỏng giao diện đã hiện thực. Phần chỉ dành cho Quản lý được giữ ở tham số `?warranty_verified=false` (phiếu chờ duyệt) và endpoint `status-log` (Nhân viên gọi trả 403 `FORBIDDEN`). Việc cách ly theo trung tâm (QT-14) vẫn do mã bảo đảm: Nhân viên trung tâm 2 gọi phiếu của trung tâm 1 nhận 403.
* **Ảnh hưởng & Hiện thực:** Sửa `docs/api-contract.md` và `docs/api-docs.md` (endpoint 8: staff và manager đều gọi được danh sách; `warranty_verified=false` chỉ Quản lý); không đổi mã nguồn. Minh chứng: `docs/screenshots/api-tickets-list.png`.

---

## TÁC ĐỘNG TỔNG THỂ KHI CHUYỂN SANG BÀI TẬP 2 (BT2)

Các thay đổi từ **TD-01** đến **TD-06** được áp dụng trực tiếp vào mã nguồn của **Bài tập 2** như sau:
1. **Migration & DDL:** Dựng đúng 6 bảng trong PostgreSQL (thư viện `pg`, xem TD-09), gắn Trigger `forbid_change()` để chặn lệnh `DELETE` vật lý và cấm chỉnh sửa `ticket_status_log` (Đáp ứng TD-01, TD-02).
2. **Business Logic trong Service Layer:**
   * Hàm `createTicket()` tự động tạo bản ghi `ticket` và ghi ngay bản ghi khởi tạo trạng thái `MOI` vào `ticket_status_log` trong cùng 1 Transaction (Đáp ứng TD-01, TD-03).
   * Kiểm tra điều kiện ngày mua: Nếu thiếu ngày mua $\rightarrow$ tự động gán `is_warranty = false` và `warranty_verified = false` (Đáp ứng TD-03).
3. **Unit Tests:** Xây dựng bộ Unit Tests kiểm thử tính đúng đắn của logic `QT-04` (tính hạn cam kết SLA) và `QT-05` (xác minh bảo hành).
4. **Giao diện Frontend:** Dựng 3 màn hình React/Vite chuẩn theo Wireframe ở TD-04, gọi API thực tế và xử lý đủ 3 trạng thái giao diện (Loading, Empty, Success/Error).

---

*(Ghi chú: Mọi thay đổi phát sinh tiếp theo sau phản hồi Bài tập 3 sẽ được bổ sung tiếp nối vào tệp này bắt đầu từ mã **TD-16**).*
