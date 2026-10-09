# Hệ thống Tiếp nhận và phân loại yêu cầu bảo hành
Sinh viên: Đoàn Xuân Tiến - 2374802010493
Học phần: Chuyên đề Tốt nghiệp 1, HK1 2026-2027
Track: SE
Luồng nghiệp vụ: L2 - Tiếp nhận và phân loại yêu cầu bảo hành

## 1. Mục tiêu
Hệ thống giúp số hóa quy trình tiếp nhận bảo hành, tra cứu khách hàng, phân loại sự cố tự động và sinh hạn cam kết (SLA) nhằm giải quyết tình trạng trễ hạn và thất lạc phiếu.

## 2. Yêu cầu môi trường
Node.js 20 LTS
PostgreSQL 16
Biến môi trường: xem file `.env.example`

## 3. Hướng dẫn chạy
cp .env.example .env và điền giá trị
npm install
npm run db:migrate
npm run dev (mở http://localhost:3000/health)

## 4. Cấu trúc thư mục
- `docs/`: Chứa tài liệu SRS, ERD, Sơ đồ kiến trúc và Wireframe.
- `src/`: Mã nguồn (Backend, Frontend).
- `tests/`: Kịch bản kiểm thử.

## 5. Kiểm thử
npm test

## 6. Trạng thái hiện tại
- [x] Khởi tạo project, smoke test chạy được (buổi 2)
- [x] Nộp hồ sơ phân tích thiết kế BT1 (buổi 6)
- [ ] Module tiếp nhận yêu cầu (buổi 8-10)