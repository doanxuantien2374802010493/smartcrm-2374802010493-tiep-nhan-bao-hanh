# Bản đặc tả yêu cầu rút gọn và Use Case
**Luồng L2: Tiếp nhận và phân loại yêu cầu bảo hành**

---

# PHẦN 1: BẢN SRS RÚT GỌN

## 1. Giới thiệu và phạm vi

- Bối cảnh: Mekong Mobile hiện ghi nhận yêu cầu bảo hành trên phiếu giấy, không quản lý được trạng thái, tiến độ xử lý và hạn cam kết (vấn đề V2, V8).
- Phạm vi chọn: Quản lý tiếp nhận và phân loại yêu cầu bảo hành. Nhân viên tiếp nhận tra cứu khách hàng, ghi nhận thiết bị và mô tả lỗi; hệ thống tự động xác định tình trạng bảo hành, phân loại nhóm sự cố, sinh hạn cam kết và theo dõi lịch sử trạng thái.
- Chủ ý KHÔNG làm (WON'T): phân công kỹ thuật viên (L4), quản lý kho linh kiện (L5), báo cáo tổng hợp đa chiều cấp công ty (L6); chuyển trạng thái xử lý và đóng phiếu (hệ thống chỉ ghi nhận và hiển thị lịch sử trạng thái từ lúc tạo phiếu); tạo/sửa hồ sơ thiết bị (giả định thiết bị đã có sẵn trong hệ thống từ dữ liệu bán hàng).

**Bảng thuật ngữ:**

| **Thuật ngữ**     | **Định nghĩa**                                                                               | **Tên kỹ thuật**                           |
|-------------------|----------------------------------------------------------------------------------------------|--------------------------------------------|
| Khách hàng        | Cá nhân đã mua SP/DV của Mekong Mobile                                                       | `customer`                                 |
| Thiết bị          | Một máy cụ thể khách sở hữu (serial/IMEI)                                                    | `device`                                   |
| Đơn hàng          | Một lần mua hàng tại một cửa hàng, gồm một hoặc nhiều sản phẩm.                              | `order` / `order_item`                     |
| Phiếu bảo hành    | Yêu cầu bảo hành được ghi nhận                                                               | `ticket`                                   |
| Trạng thái phiếu  | Vị trí trong vòng đời (Hình 6.2 case study): MOI, DA_PHAN_CONG, DANG_XU_LY...                | `ticket.status`; lịch sử ở `ticket_status_log` |
| Hạn cam kết (SLA) | Thời điểm chậm nhất phải hoàn tất phiếu                                                      | `due_date`                                 |
| Nhóm sự cố        | Phân loại nguyên nhân bảo hành: màn hình, pin, sạc...                                                 | `issue_category`                           |
| Mức ưu tiên       | Mức khẩn: CAO / TRUNG_BINH / THAP                                                            | `priority`                                 |
| Miễn phí bảo hành | Phiếu được miễn phí (true) hay có tính phí (false)                                           | `is_warranty`                              |
| Xác minh bảo hành | Đã xác định được ngày mua để kết luận bảo hành hay chưa; chưa xác minh thì cần Quản lý duyệt | `warranty_verified`                        |

*(Ghi chú: `is_warranty` và `due_date` là các giá trị tính toán được chốt cố định tại thời điểm tạo phiếu).*

## 2. Các bên liên quan và vai trò

| **Vai trò**         | **Được làm**                                                                                            | **Không được làm**                                                     |
|---------------------|---------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------|
| Nhân viên tiếp nhận | Tra cứu khách, tạo phiếu, phân loại, xem phiếu đã tạo                                                   | Không xem dữ liệu trung tâm khác (QT-14); không thấy đủ SĐT (QT-15)    |
| Quản lý trung tâm   | Phê duyệt phiếu chưa xác minh bảo hành, xem lịch sử trạng thái và dữ liệu toàn trung tâm mình phụ trách | Không sửa hoặc xóa lịch sử log (QT-06); không xóa vật lý phiếu (QT-13) |

## 3. Yêu cầu chức năng

| **Mã** | **Yêu cầu chức năng**                                                 | **User Story** | **MoSCoW** |
|--------|-----------------------------------------------------------------------|----------------|------------|
| FR1    | Tra cứu khách hàng theo SĐT và tự điền thông tin.                     | US1            | SHOULD     |
| FR2    | Tạo khách hàng mới khi SĐT chưa tồn tại.                              | US2            | SHOULD     |
| FR3    | Tạo phiếu bảo hành mới với thông tin bắt buộc.                        | US3            | MUST       |
| FR4    | Tự động xác định tình trạng bảo hành của thiết bị.                    | US4            | MUST       |
| FR5    | Đề xuất nhóm sự cố và mức ưu tiên theo mô tả lỗi.                     | US5            | SHOULD     |
| FR6    | Tự động sinh hạn cam kết xử lý theo mức ưu tiên.                      | US6            | MUST       |
| FR7    | Ghi lại và hiển thị lịch sử chuyển trạng thái phiếu.                  | US7            | SHOULD     |
| FR8    | Cảnh báo khi SĐT đã tồn tại nhưng tên khách hàng nhập vào không khớp. | US8            | COULD      |

### Danh sách User Story và Tiêu chí chấp nhận (AC)

**US1 (SHOULD):** Là nhân viên tiếp nhận, tôi muốn tra cứu khách hàng theo SĐT để không phải nhập lại thông tin đã có.
- AC1: GIVEN SĐT đã có, WHEN nhập tìm, THEN tự điền tên, địa chỉ, danh sách thiết bị.
- AC2: GIVEN SĐT chưa có, WHEN nhập tìm, THEN báo không thấy và đề nghị tạo mới.

**US2 (SHOULD):** Là nhân viên tiếp nhận, tôi muốn tạo khách hàng mới khi SĐT chưa tồn tại để vẫn ghi nhận được yêu cầu của khách lần đầu đến trung tâm.
- AC1: GIVEN SĐT chưa có, WHEN nhập đủ tên và Lưu, THEN tạo mới thành công.
- AC2: GIVEN SĐT có khoảng trắng hoặc dạng +84/84, WHEN lưu, THEN tự động chuẩn hóa về dạng 0xxxxxxxxx.

**US3 (MUST):** Là nhân viên tiếp nhận, tôi muốn tạo phiếu bảo hành mới để mọi yêu cầu của khách được ghi nhận chính thức và theo dõi được tiến độ xử lý.
- AC1: GIVEN đã chọn khách & thiết bị, WHEN nhập mô tả lỗi và Lưu, THEN tạo phiếu MOI.
- AC2: GIVEN chưa nhập mô tả lỗi, WHEN Lưu, THEN từ chối và báo lỗi, giữ nguyên dữ liệu.

**US4 (MUST):** Là nhân viên tiếp nhận, tôi muốn hệ thống tự xác định bảo hành để biết ngay thiết bị còn hay hết bảo hành mà không phải tra giấy tờ thủ công.
- AC1: GIVEN thiết bị có ngày mua, WHEN tạo phiếu, THEN tính theo QT-05 và đặt is_warranty tương ứng, warranty_verified = true.
- AC2: GIVEN thiết bị thiếu ngày mua, WHEN tạo phiếu, THEN vẫn tạo phiếu ở trạng thái MOI, đặt warranty_verified = false và chuyển Quản lý phê duyệt.

**US5 (SHOULD):** Là nhân viên tiếp nhận, tôi muốn hệ thống tự phân loại nhóm sự cố để phiếu được gán đúng nhóm và mức ưu tiên, giảm sai sót khi phân loại bằng tay.
- AC1: GIVEN mô tả chứa từ khóa "sạc", WHEN phân loại, THEN chọn nhóm SAC.
- AC2: GIVEN mô tả chung chung, WHEN phân loại, THEN chọn nhóm KHAC và cho phép sửa thủ công.

**US6 (MUST):** Là nhân viên tiếp nhận, tôi muốn sinh hạn cam kết tự động để mỗi phiếu có thời hạn xử lý rõ ràng và trung tâm giữ đúng cam kết với khách.
- AC1: GIVEN phiếu CAO, WHEN tạo sáng Thứ Ba, THEN hạn là sáng Thứ Tư (24h).
- AC2: GIVEN phiếu THAP (120h), WHEN tạo chiều Thứ Bảy, THEN hạn là chiều Thứ Sáu tuần sau (không tính Chủ Nhật).

**US7 (SHOULD):** Là quản lý trung tâm, tôi muốn xem lịch sử chuyển trạng thái của phiếu để kiểm soát tiến độ và truy vết khi có khiếu nại.
- AC1: GIVEN phiếu thuộc trung tâm của tôi đã có lần chuyển trạng thái, WHEN mở lịch sử, THEN hiển thị theo thời gian: trạng thái trước/sau, thời điểm, người thực hiện.
- AC2: GIVEN phiếu thuộc trung tâm khác, WHEN mở lịch sử, THEN từ chối truy cập (QT-14).

**US8 (COULD):** Là nhân viên tiếp nhận, tôi muốn được cảnh báo khi SĐT có nhưng sai tên khách hàng để tránh gắn nhầm phiếu cho khách khác.
- AC1: GIVEN SĐT đã có hồ sơ tên "Nguyen Van A", WHEN nhập tên khác hẳn, THEN hiển thị cảnh báo và cho xác nhận hoặc sửa lại.
- AC2: GIVEN tên chỉ khác hoa/thường hoặc khoảng trắng thừa, WHEN lưu, THEN không cảnh báo.

## 4. Yêu cầu phi chức năng

| **Mã** | **Yêu cầu phi chức năng (có ngưỡng)**                                                                                                       | **Loại NFR**   |
|--------|---------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| NFR1   | Tra cứu khách hàng theo SĐT trả kết quả dưới 1 giây trên tập dữ liệu khoảng 65.000 khách hàng.                                              | Hiệu năng      |
| NFR2   | Với 100% màn hình và phản hồi API dành cho vai trò khác Quản lý (và Ban giám đốc), SĐT phải che 4 chữ số giữa (dạng 090\*\*\*\*567); chỉ Quản lý thấy đủ 10 chữ số (QT-15). | Bảo mật        |
| NFR3   | Nhân viên mới (kiểm thử với ít nhất 3 người) tạo phiếu đúng trong dưới 3 phút, không cần hỗ trợ.                                            | Khả dụng       |
| NFR4   | 100% phiếu không bị xóa vật lý và 100% lần chuyển trạng thái đều có một bản ghi trong ticket_status_log.                                    | Toàn vẹn dữ liệu|

## 5. Ràng buộc và quy tắc nghiệp vụ

- **QT-01, QT-02:** Chuẩn hóa SĐT về 10 chữ số bắt đầu bằng 0, SĐT là duy nhất.
- **QT-03:** Thiết bị xác định duy nhất bằng serial/IMEI; 1 thiết bị thuộc 1 khách tại một thời điểm.
- **QT-04:** Hạn cam kết: CAO = 24h, TRUNG_BINH = 72h, THAP = 120h; chỉ tính ngày làm việc T2–T7.
- **QT-05:** Xác định còn bảo hành qua ngày mua. Dùng device.purchase_date, nếu rỗng thì dùng provided_purchase_date. Nếu thiếu ngày mua -> `warranty_verified = false`, chờ Quản lý duyệt.
- **QT-06:** Phiếu chuyển trạng thái đúng vòng đời (Hình 6.2), không lùi trạng thái. Mọi lần chuyển đều ghi vào `ticket_status_log`; log chỉ được ghi thêm, không sửa hoặc xóa.
- **QT-13:** Không xóa vật lý phiếu bảo hành, đơn hàng hay hồ sơ khách hàng; chỉ đánh dấu ngừng sử dụng (soft delete) và giữ nguyên lịch sử.
- **QT-14:** Nhân viên chỉ xem được dữ liệu của trung tâm mình làm việc. Quản lý xem được toàn bộ đơn vị mình phụ trách. Ban giám đốc xem toàn công ty.
- **QT-15:** SĐT hiển thị dạng che (ví dụ 090\*\*\*\*567) với mọi vai trò trừ Quản lý và Ban giám đốc.

## 6. Bảng truy vết yêu cầu

| **FR** | **User Story** | **Use Case** | **MoSCoW** | **Test case (BT3)**                              |
|--------|----------------|--------------|------------|--------------------------------------------------|
| FR1    | US1            | UC1          | SHOULD     | TC01, TC02                                       |
| FR2    | US2            | UC3          | SHOULD     | TC03                                             |
| FR3    | US3            | UC2          | MUST       | TC04, TC05                                       |
| FR4    | US4            | UC4, UC7     | MUST       | TC06, TC07                                       |
| FR5    | US5            | UC5          | SHOULD     | TC08                                             |
| FR6    | US6            | UC5          | MUST       | TC09                                             |
| FR7    | US7            | UC6          | SHOULD     | TC10, NFR4                                       |
| FR8    | US8            | UC1          | COULD      | TC11, TC12 (dự kiến hoàn thiện Buổi 5)           |

**Truy vết quy tắc nghiệp vụ:**

| **Quy tắc**  | **Thể hiện ở**                                                |
|--------------|---------------------------------------------------------------|
| QT-01, QT-02 | FR1, FR2 (US1-AC2, US2-AC2); API: GET/POST /api/customers     |
| QT-03        | FR3; validation device_id thuộc customer_id                   |
| QT-04        | FR6 (US6-AC1, AC2); due_date trong response POST /api/tickets |
| QT-05        | FR4 (US4-AC1, AC2); luồng 5a của UC2; PATCH approve-warranty  |
| QT-06        | FR7 (US7); ticket_status_log; mã lỗi 409 của approve-warranty |
| QT-13        | Mọi dữ liệu; sử dụng cờ is_deleted                            |
| QT-14        | US7-AC2; mục 5 API contract (403)                             |
| QT-15        | NFR2; xử lý ẩn (masking) tại tầng Service (file `api-contract.md` đính kèm) |

---

# PHẦN 2: PHÂN TÍCH USE CASE

## 1. Sơ đồ Use Case

<img src="export/usecase.png" title="Use Case Diagram L2" alt="Use case diagram luồng L2 với 2 actor và 7 use case" width="700"/>

*Hình 1 — Use Case Diagram luồng L2 (2 actor, 7 use case, có ranh giới hệ thống và chú thích). File gốc: `docs/usecase.drawio`.*

## 2. Đặc tả Use Case chi tiết: UC2 — Tạo phiếu bảo hành mới

- **Actor chính:** Nhân viên tiếp nhận 
- **Liên quan:** US1, US3, US4, US5, US6 
- **Mức:** MUST

**Điều kiện trước:** Đã đăng nhập và có quyền tại trung tâm; thiết bị của khách đã có trong hệ thống.

**Điều kiện sau:** Một phiếu được lưu, có mã, ở trạng thái MOI kèm hạn cam kết. Nếu thiếu ngày mua (luồng 5a), phiếu vẫn ở trạng thái MOI nhưng `warranty_verified = false` và chờ Quản lý phê duyệt.

**Luồng chính:**
1. Chọn chức năng "Tạo phiếu bảo hành mới".
2. Nhập số điện thoại khách hàng.
3. Hệ thống tra cứu thông tin và danh sách thiết bị. [include UC1]
4. Chọn thiết bị của khách trong danh sách.
5. Hệ thống xác định tình trạng bảo hành. [include UC4]
6. Nhập mô tả lỗi.
7. Hệ thống đề xuất nhóm sự cố, ưu tiên và hạn cam kết. [include UC5]
8. Xác nhận và bấm Lưu.
9. Hệ thống sinh mã phiếu, lưu trạng thái MOI và ghi dòng đầu tiên vào lịch sử trạng thái.

**Luồng ngoại lệ:**
- **3a.** Khách chưa tồn tại → Mở form tạo khách mới. [extend UC3]
- **5a.** Không có ngày mua → Đánh dấu chưa xác minh bảo hành (`warranty_verified = false`), gửi Quản lý phê duyệt. [extend UC7]
- **8a.** Thiếu mô tả lỗi → Từ chối lưu, báo lỗi, không mất dữ liệu.