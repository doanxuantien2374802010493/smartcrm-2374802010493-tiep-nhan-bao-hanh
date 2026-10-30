# Khai báo sử dụng công cụ AI

*Phạm vi khai báo: Các phần thực hiện từ Bài tập 1 đến hết Bài tập 2 (Hiện thực hóa module cốt lõi, viết test và cấu trúc 3 tầng).*

| Công cụ | Dùng vào việc gì | Áp dụng ở phần nào | Em đã kiểm chứng thế nào |
| :--- | :--- | :--- | :--- |
| **Claude (Anthropic)** | Hỗ trợ soạn nháp User Story theo khuôn INVEST và phát biểu yêu cầu có ngưỡng đo được | Mục 3, 4 của SRS; US1–US8 | Đọc lại từng story, đối chiếu case study và tự chỉnh phạm vi thực tế. |
| **Claude (Anthropic)** | Hỗ trợ vẽ Use Case Diagram và soạn nháp đặc tả luồng chính/ngoại lệ UC2 | Mục Use Case của SRS | Đối chiếu Mục 6.1 và Hình 6.2 case study; tự kiểm các lỗi thường gặp của use case. |
| **Claude (Anthropic)** | Hỗ trợ soạn nháp API contract và cấu trúc tầng Route cho Express | `src/routes/ticket.routes.js`, `docs/api-contract.md` | Đối chiếu với bảng truy vết, từ điển dữ liệu case study và test thử bằng cURL/Postman. |
| **Claude (Anthropic)** | Viết lại backend để nối PostgreSQL thật theo API contract: repositories, services (QT-01 đến QT-06, QT-13 đến QT-15, FR5), validators, middleware lỗi, log, JWT | `src/services/`, `src/repositories/`, `src/routes/`, `src/validators/`, `src/middleware/`, `src/server.js` | Chạy `npm test` (33 test PASS); gọi API bằng curl trên PostgreSQL thật; đối chiếu từng quy tắc với `docs/srs.md`; đọc từng hàm để giải thích được khi vấn đáp. <!-- Tiến: chỉ giữ câu nào em thực sự đã làm --> |
| **Claude (Anthropic)** | Viết migration 002 (trigger, cột đăng nhập), seed dữ liệu mẫu và script `db:setup` | `migrations/002_triggers_and_auth.sql`, `seeds/001_seed_data.sql`, `scripts/db-setup.js` | Chạy `npm run db:setup` hai lần trên CSDL trống, đếm dòng không đổi; thử `DELETE` vật lý phiếu và `UPDATE` log, trigger chặn cả hai. |
| **Claude (Anthropic)** | Viết bộ kiểm thử Jest (TC01, TC02, TC03 và test cho quy tắc, lớp API) | `tests/` | Chạy `npm test` từ bản clone mới, không cần CSDL. |
| **Claude (Anthropic)** | Viết lại giao diện React theo API contract (đăng nhập, tiếp nhận, danh sách, chi tiết, ba trạng thái) | `src/frontend/src/` | Chạy giao diện với API thật, thử đủ ba trạng thái và vai trò Nhân viên, Quản lý. |
| **Claude (Anthropic)** | Soạn Dockerfile, docker-compose, bug log và cập nhật README, nhật ký thay đổi thiết kế | `Dockerfile`, `docker-compose.yml`, `docs/` | [Tiến điền: đã chạy `docker compose up --build` và kết quả] |
| **ChatGPT / Claude** | Hỗ trợ hoàn thiện SQL DDL skeleton cho 6 bảng | `migrations/001_create_tables.sql` | Chạy thử migration trên CSDL PostgreSQL trống, kiểm tra bằng lệnh đếm dòng. |

---

### Phần tự làm hoàn toàn, không dùng AI
* Quyết định chọn luồng nghiệp vụ L2 và lý do chọn, phạm vi loại trừ (WON'T).
* Lớp báo lỗi `src/errors/AppError.js`.
* [Tiến điền: các phần em thực sự tự làm, ví dụ chạy phép thử "thư mục trống" từ thư mục mới]

---

**Tôi xác nhận đã đọc, hiểu và chịu trách nhiệm về toàn bộ nội dung nộp.**

* **Họ tên:** Đoàn Xuân Tiến
* **MSSV:** 2374802010493
* **Ngày:** ..../..../2026