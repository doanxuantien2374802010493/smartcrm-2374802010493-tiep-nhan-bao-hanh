  # Test Plan – Luồng L2: Tiếp nhận thiết bị bảo hành (track SE)

  Sinh viên: Đoàn Xuân Tiến · MSSV 2374802010493 · Hệ thống: SmartCRM, Node.js + Express + PostgreSQL.

  ## 1. Phạm vi

  **Kiểm:**
  - Tiếp nhận phiếu: chuẩn hóa SĐT (QT-01/02), thiết bị thuộc khách (QT-03), đề xuất nhóm sự cố và ưu tiên (FR5), hạn cam kết (QT-04), kiểm tra bảo hành và luồng 5a (QT-05).
  - Ghi log trạng thái cùng transaction (QT-06), xóa mềm và trigger chặn DELETE (QT-13).
  - Phân quyền theo trung tâm (QT-14), che SĐT theo vai trò (QT-15), phê duyệt bảo hành một lần (409).
  - Xác thực JWT; chất lượng bảo mật mức nhận biết với năm mục OWASP Top 10:2025: A01, A02, A04, A05, A07.
  - Tính tái lập của `npm run db:setup`; hồi quy các bug đã sửa trong Bug Log.

  **Cố ý không kiểm:**
  - Giao diện React: không có kiểm thử tự động, chỉ kiểm tay ba trạng thái (đang tải, rỗng, lỗi) ở BT2.
  - Hiệu năng và tải: thuộc Chuyên đề tốt nghiệp 2.
  - Chuyển trạng thái xử lý, linh kiện, báo cáo: ngoài phạm vi theo BT1.
  - Thêm hồ sơ thiết bị cho khách mới: tính năng chưa có.
  - Docker Compose: chưa kiểm chứng trên máy (chưa cài Docker), không có trong bản nộp.
  - Các mục OWASP khác (A03, A06, A08, A09, A10): rà soát bảo mật đầy đủ thuộc CĐTN2.

  ## 2. Loại test và số lượng

  Test Report gồm **12 test case chính**, đủ 5 loại của BT3:

  | Loại | Số lượng | Mã |
  |---|---|---|
  | Luồng đúng | 4 | TC-01, TC-02, TC-03, TC-04 |
  | Giá trị biên (hai bên một ranh giới) | 2 | TC-05, TC-06 |
  | Dữ liệu sai | 2 | TC-07, TC-08 |
  | Bảo mật | 2 | TC-09 (A01, QT-14), TC-10 (A07) |
  | Tính tái lập | 1 | TC-11 |
  | Hồi quy bug đã sửa | 1 | TC-12 (BUG-004) |

  Theo tầng: 4 unit (service dùng repository giả) · 3 tích hợp (service và PostgreSQL thử) · 5 API (Supertest qua toàn bộ routes và CSDL thử).

  Ngoài 12 test case chính, toàn bộ bộ test gồm:
  - 33 test unit và route (`npm test`, không cần CSDL), phủ thêm QT-01, QT-03, QT-04 qua Chủ nhật, QT-05 luồng 5a, QT-13, QT-14, QT-15, FR5.
  - 33 test tích hợp và API (`npm run test:integration`), gồm thêm A02, A04, A05, A07, độ bền đầu vào bất thường và hồi quy BUG-003.

  **Kỹ thuật chọn dữ liệu thử:**
  - Phân vùng tương đương: độ dài `issue_desc` có ba vùng (dưới 10, 10–2000, trên 2000).
  - Giá trị biên: 9, 10, 2000, 2001 ký tự; QT-05 thử ngày cuối còn bảo hành và ngày đầu hết hạn (test unit).

  ## 3. Tiêu chí thành công (đặt trước khi chạy)

  1. 12/12 test case có kết quả thực tế ghi bằng lời cụ thể và có ảnh chụp lệnh đã chạy.
  2. `npm test` và `npm run test:integration` đều chạy xanh bằng một lệnh; kết quả ghi đúng số test thực tế.
  3. Mỗi quy tắc nghiệp vụ đã hiện thực (QT-01 đến QT-06, QT-13 đến QT-15, FR5, luồng 5a) có ít nhất một test, trong 12 test case chính hoặc trong bộ test bổ sung.
  4. Không còn bug Critical đang mở; bug Major còn lại có lý do và hướng xử lý.
  5. Test có khả năng thất bại: ít nhất hai test (TC-09 và TC-12) đã được chứng minh chuyển sang FAIL khi cố ý làm sai mã hoặc dữ liệu, rồi hoàn lại.
  6. `npm audit --omit=dev` báo 0 lỗ hổng.

  ## 4. Môi trường và dữ liệu thử

  - **Môi trường:** Node.js (README yêu cầu 20 LTS), PostgreSQL 16, Windows (PowerShell). CSDL thử riêng `smartcrm_test`; `tests/helpers/db.js` từ chối chạy nếu tên CSDL không chứa chữ "test", để không chạm CSDL dev.
  - **Dựng dữ liệu:** `createdb -U postgres smartcrm_test`, rồi `$env:DB_NAME="smartcrm_test"; npm run db:setup` chạy migration 001, 002 và `seeds/001_seed_data.sql` (3 phiếu, 3 khách, tài khoản `ql1`, `nv1`, `nv2`, mật khẩu mẫu theo README).
  - **Tiền điều kiện dựng bằng mã:** test unit dùng repository giả trong bộ nhớ và đồng hồ được tiêm vào (`now`); test tích hợp tự tạo phiếu qua API ngay trong test, không phụ thuộc dữ liệu có sẵn ngoài seed.
  - **Dọn dữ liệu:** các test tích hợp thêm phiếu vào `smartcrm_test` sau mỗi lần chạy. Mọi kiểm đếm so sánh số dòng trước và sau trong cùng một test, nên không phụ thuộc số phiếu tích lũy.
  - **Lệnh chạy:**
    - `npm test` (unit, không cần CSDL).
    - `$env:DB_NAME="smartcrm_test"; npm run test:integration` (cần PostgreSQL thử).
    - Chạy riêng một test: `npx jest <tệp> -t "<tên test>" --testPathIgnorePatterns=/node_modules/`.
  - **Chưa có CI** (GitHub Actions): phép thử máy trắng làm thủ công bằng `git clone --branch v1.0` vào thư mục trống.
