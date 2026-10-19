# Khai báo sử dụng công cụ AI

*Phạm vi khai báo: Các phần thực hiện từ Bài tập 1 đến hết Bài tập 2 (Hiện thực hóa module cốt lõi, viết test và cấu trúc 3 tầng).*

| Công cụ | Dùng vào việc gì | Áp dụng ở phần nào | Em đã kiểm chứng thế nào |
| :--- | :--- | :--- | :--- |
| **Claude (Anthropic)** | Hỗ trợ soạn nháp User Story theo khuôn INVEST và phát biểu yêu cầu có ngưỡng đo được | Mục 3, 4 của SRS; US1–US8 | Đọc lại từng story, đối chiếu case study và tự chỉnh phạm vi thực tế. |
| **Claude (Anthropic)** | Hỗ trợ vẽ Use Case Diagram và soạn nháp đặc tả luồng chính/ngoại lệ UC2 | Mục Use Case của SRS | Đối chiếu Mục 6.1 và Hình 6.2 case study; tự kiểm các lỗi thường gặp của use case. |
| **Claude (Anthropic)** | Hỗ trợ soạn nháp API contract và cấu trúc tầng Route cho Express | `src/routes/ticket.routes.js`, `docs/api-contract.md` | Đối chiếu với bảng truy vết, từ điển dữ liệu case study và test thử bằng cURL/Postman. |
| **ChatGPT / Claude** | Hỗ trợ soạn khung logic Service (tính SLA QT-04, check bảo hành QT-05) và viết Unit Tests | `src/services/ticket.service.js`, `tests/ticket.service.test.js` | Chạy lệnh `npm test` xác nhận PASS toàn bộ 3 test cases; kiểm tra kỹ ranh giới lớp service không chứa mã HTTP. |
| **ChatGPT / Claude** | Hỗ trợ hoàn thiện SQL DDL skeleton cho 6 bảng và các trigger bảo mật NFR4 | `migrations/001_create_tables.sql` | Chạy thử migration trên CSDL PostgreSQL trống, kiểm tra bằng lệnh đếm dòng và thử thực thi câu lệnh `DELETE` vật lý. |

---

### Phần tự làm hoàn toàn, không dùng AI
* Quyết định chọn luồng nghiệp vụ L2 và lý do chọn, phạm vi loại trừ (WON'T).
* Tự thiết kế logic tầng Repository (`customer.repository.js`, `ticket.repository.js`), ràng buộc dữ liệu thực tế và viết code xử lý bắt lỗi ngoại lệ (`AppError.js`).
* Tự thực hiện phép thử "thư mục trống" (Clean environment test) để kiểm tra tính tái lập của file `README.md`.

---

**Tôi xác nhận đã đọc, hiểu và chịu trách nhiệm về toàn bộ nội dung nộp.**

* **Họ tên:** Đoàn Xuân Tiến
* **MSSV:** 2374802010493
* **Ngày:** 19/10/2026