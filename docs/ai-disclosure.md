# Khai báo sử dụng công cụ AI

| **Công cụ**        | **Dùng vào việc gì**                                                                     | **Áp dụng ở phần nào**    | **Đã kiểm chứng thế nào**                                     |
|--------------------|------------------------------------------------------------------------------------------|---------------------------|---------------------------------------------------------------|
| Claude (Anthropic) | Hỗ trợ soạn nháp User Story theo khuôn INVEST; gợi ý phát biểu yêu cầu có ngưỡng đo được | Mục 3, 4 của SRS; US1–US8 | Đọc lại từng story, tự đối chiếu case study, tự chỉnh phạm vi |
| Claude (Anthropic) | Hỗ trợ vẽ Use Case Diagram và soạn nháp đặc tả luồng chính/ngoại lệ UC2                  | Mục 2 — Use Case          | Tự đối chiếu với Mục 6.1 case study; tự kiểm 7 lỗi thường gặp |
| Claude (Anthropic) | Gợi ý kiến trúc phân lớp và soạn nháp 3 câu lập luận theo khuôn NFR                      | Mục 3 — Kiến trúc         | Tự đối chiếu mã NFR, kiểm tra có đánh đổi                     |
| Claude (Anthropic) | Hỗ trợ thiết kế ERD và viết SQL DDL skeleton                                             | Mục 4 — Mô hình dữ liệu   | Tự kiểm khóa chính, ≥2 khóa ngoại, không bảng cô lập          |
| Claude (Anthropic) | Hỗ trợ soạn nháp API contract theo mẫu buổi 3                                            | api-contract.md           | Tự đối chiếu với bảng truy vết và ERD                         |
| Claude (Anthropic) | Hỗ trợ rà soát chính tả, định dạng bảng Markdown                                         | srs.md, api-contract.md   | Đọc lại toàn bộ sau khi định dạng                             |

Phần tự làm hoàn toàn, không dùng AI: quyết định chọn luồng nghiệp vụ L2 và lý do chọn; quyết định phạm vi loại trừ (WON'T); quyết định cuối cùng về mức MoSCoW; quyết định stack công nghệ (Node.js, Express, Prisma, PostgreSQL, React); thực hiện cài đặt môi trường và chạy smoke test trên máy cá nhân.

**Tôi xác nhận đã đọc, hiểu và chịu trách nhiệm về toàn bộ nội dung nộp.**

Họ tên: Đoàn Xuân Tiến

MSSV: 2374802010493

Ngày: 10/2/2026
