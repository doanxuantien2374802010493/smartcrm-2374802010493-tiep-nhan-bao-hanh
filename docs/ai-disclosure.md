# Khai báo sử dụng công cụ AI

*Phạm vi khai báo: các phần thực hiện từ Bài tập 1 đến hết Bài tập 3 (hiện thực hóa module cốt lõi, viết test, cấu trúc 3 tầng, kiểm thử, đóng gói và tài liệu kỹ thuật).*

## Giai đoạn 1–2 (Bài tập 1 và 2)

| Công cụ | Dùng vào việc gì | Áp dụng ở phần nào | Em đã kiểm chứng thế nào |
| :--- | :--- | :--- | :--- |
| **Claude (Anthropic)** | Hỗ trợ soạn nháp User Story theo khuôn INVEST và phát biểu yêu cầu có ngưỡng đo được | Mục 3, 4 của SRS; US1–US8 | Đọc lại từng story, đối chiếu case study và tự chỉnh phạm vi thực tế. |
| **Claude (Anthropic)** | Hỗ trợ vẽ Use Case Diagram và soạn nháp đặc tả luồng chính/ngoại lệ UC2 | Mục Use Case của SRS | Đối chiếu Mục 6.1 và Hình 6.2 case study; tự kiểm các lỗi thường gặp của use case. |
| **Claude (Anthropic)** | Hỗ trợ soạn nháp API contract và cấu trúc tầng Route cho Express | `src/routes/ticket.routes.js`, `docs/api-contract.md` | Đối chiếu với bảng truy vết, từ điển dữ liệu case study và test thử bằng cURL/Postman. |
| **Claude (Anthropic)** | Viết lại backend để nối PostgreSQL thật theo API contract: repositories, services (QT-01 đến QT-06, QT-13 đến QT-15, FR5), validators, middleware lỗi, log, JWT | `src/services/`, `src/repositories/`, `src/routes/`, `src/validators/`, `src/middleware/`, `src/server.js` | Chạy `npm test` (33 test PASS ở thời điểm Bài tập 2); gọi API bằng curl trên PostgreSQL thật; đối chiếu từng quy tắc với `docs/srs.md`; đọc từng hàm để giải thích được khi vấn đáp. |
| **Claude (Anthropic)** | Viết migration 002 (trigger, cột đăng nhập), seed dữ liệu mẫu và script `db:setup` | `migrations/002_triggers_and_auth.sql`, `seeds/001_seed_data.sql`, `scripts/db-setup.js` | Chạy `npm run db:setup` hai lần trên CSDL trống, đếm dòng không đổi (`docs/screenshots/seed-rerun-counts.png`); thử `DELETE` vật lý phiếu và `UPDATE` log, trigger chặn cả hai. |
| **Claude (Anthropic)** | Viết bộ kiểm thử Jest (TC01, TC02, TC03 và test cho quy tắc, lớp API) | `tests/` | Chạy `npm test` từ bản clone mới, không cần CSDL. |
| **Claude (Anthropic)** | Viết lại giao diện React theo API contract (đăng nhập, tiếp nhận, danh sách, chi tiết, ba trạng thái) | `src/frontend/src/` | Chạy giao diện với API thật, thử đủ ba trạng thái và vai trò Nhân viên, Quản lý. |
| **Claude (Anthropic)** | Soạn Dockerfile, docker-compose, bug log và cập nhật README, nhật ký thay đổi thiết kế | `Dockerfile`, `docker-compose.yml`, `docs/` | Chạy `docker compose up -d --build` trên máy, `docker compose ps` cho thấy các dịch vụ healthy (`docs/screenshots/compose-up-build.png`, `docs/screenshots/compose-ps-healthy.png`). |
| **ChatGPT / Claude** | Hỗ trợ hoàn thiện SQL DDL skeleton cho 6 bảng | `migrations/001_create_tables.sql` | Chạy thử migration trên CSDL PostgreSQL trống, kiểm tra bằng lệnh đếm dòng. |

## Giai đoạn 3 (Bài tập 3: kiểm thử, đóng gói và tài liệu)

| Công cụ | Dùng vào việc gì | Áp dụng ở phần nào | Em đã kiểm chứng thế nào |
| :--- | :--- | :--- | :--- |
| **Claude (Anthropic)** | Đối chiếu repo và tài liệu với bảng tiêu chí C1–C9 của buổi 16, nêu việc còn thiếu trước khi nộp | `docs/`, quy trình tag `v1.0` | Tự mở lại từng tài liệu, chạy lại các lệnh kiểm tra (`git log`, `git ls-files`, `npm run test:all`) và sửa theo kết quả thật. |
| **Claude (Anthropic)** | Gợi ý các lệnh PowerShell rà soát tĩnh (catch rỗng, `console.*`, `.env` trong repo và lịch sử, `node_modules` trong repo) | Mục "Rà soát trước khi nộp" của `docs/bug-log.md` | Chạy các lệnh trên máy, loại `node_modules` khỏi phạm vi quét, chụp ảnh (`docs/screenshots/static-checks-env-history.png`, `static-checks-filtered.png`), ghi đúng kết quả lệnh in ra. |
| **Claude (Anthropic)** | Soạn bản `docs/api-docs.md` (15 endpoint, mỗi endpoint đủ bảy mục) từ kết quả lần chạy API thật | `docs/api-docs.md` | Chạy `scripts/api-run.ps1` trên hệ thống thật bằng `nv1` và `ql1`; ví dụ request và response chép từ kết quả chạy; kiểm `/api/health` (200, không cần token) và `/api/issue-categories` (401 khi không có token); `npm test` vẫn PASS (có `docs.consistency`). |
| **Claude (Anthropic)** | Chẩn đoán lỗi `password authentication failed` khi chạy `npm run test:all` và hướng dẫn tạo CSDL `smartcrm_test` | `.env` (không commit), CSDL `smartcrm_test` | Sửa `.env` trên máy, chạy `npm run test:all` trên `smartcrm_test`: 10 suite, 70 test PASS (`docs/screenshots/test-all-pass.png`). |
| **Claude (Anthropic)** | Hướng dẫn kiểm tra nhánh `main` và `dev` trước khi tag | Quản lý nhánh và tag `v1.0` | Chạy `git branch -a`, `git log main..origin/dev` (kết quả trống), `git merge origin/dev` ("Already up to date"), `git status -sb` sau khi `git push origin main`. |
| **Claude (Anthropic)** | Đối chiếu body endpoint `POST /api/tickets` với `src/validators/` và `scripts/api-run.ps1`, sửa ví dụ request trong `docs/api-docs.md`; đối chiếu số route trong mã với số endpoint trong tài liệu (15) | `docs/api-docs.md` | Chạy `Select-String` đếm route ra 15, so từng route với tiêu đề tài liệu; đọc `src/validators/ticket.validator.js` và `scripts/api-run.ps1`; `npm test` PASS gồm `docs.consistency`. |
| **Claude (Anthropic)** | Hướng dẫn chụp ảnh minh chứng cho 12 test case và rà Test Report, Bug Log (mức độ, link commit, thứ tự commit) | `docs/test-report.md`, `docs/bug-log.md`, `docs/screenshots/` | Tự chạy từng lệnh trên máy, chụp ảnh `tc-*.png`; chạy `git show --stat`, `git merge-base --is-ancestor`, `git branch -r --contains` cho mọi mã commit trong Bug Log. |
---

### Phần tự làm hoàn toàn, không dùng AI

* Quyết định chọn luồng nghiệp vụ L2 và lý do chọn, phạm vi loại trừ (WON'T).
* Lớp báo lỗi `src/errors/AppError.js`.
* Chạy các phép thử trên máy thật và chụp ảnh minh chứng (`docs/screenshots/`), đọc và đối chiếu kết quả với tài liệu trước khi nộp.
* Cấu hình môi trường trên máy của em: mật khẩu PostgreSQL trong `.env`, tạo CSDL `smartcrm_test`.

---

**Tôi xác nhận đã đọc, hiểu và chịu trách nhiệm về toàn bộ nội dung nộp.**

* **Họ tên:** Đoàn Xuân Tiến
* **MSSV:** 2374802010493
* **Ngày:** 14/11/2026
