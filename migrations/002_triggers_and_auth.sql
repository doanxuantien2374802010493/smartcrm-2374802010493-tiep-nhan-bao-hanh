-- TD-01 / NFR4: log chỉ ghi thêm (QT-06), không xóa vật lý phiếu (QT-13) - chặn ngay ở tầng CSDL.
-- Viết để CHẠY LẠI NHIỀU LẦN không lỗi: CREATE OR REPLACE + DROP TRIGGER IF EXISTS.
CREATE OR REPLACE FUNCTION forbid_change() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Khong duoc % tren bang % (QT-06, QT-13)', TG_OP, TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_append_only ON ticket_status_log;
CREATE TRIGGER trg_log_append_only
  BEFORE UPDATE OR DELETE ON ticket_status_log
  FOR EACH ROW EXECUTE FUNCTION forbid_change();

DROP TRIGGER IF EXISTS trg_ticket_no_delete ON ticket;
CREATE TRIGGER trg_ticket_no_delete
  BEFORE DELETE ON ticket
  FOR EACH ROW EXECUTE FUNCTION forbid_change();

-- Đăng nhập cơ bản (API contract mục 5): nhân viên cần tên đăng nhập + mật khẩu băm.
-- Không thêm bảng mới, ERD vẫn 6 bảng.
ALTER TABLE employee ADD COLUMN IF NOT EXISTS username VARCHAR(50);
ALTER TABLE employee ADD COLUMN IF NOT EXISTS password_hash VARCHAR(100);
CREATE UNIQUE INDEX IF NOT EXISTS ux_employee_username ON employee(username);
CREATE INDEX IF NOT EXISTS idx_ticket_unverified ON ticket(ticket_id) WHERE warranty_verified = false;
CREATE INDEX IF NOT EXISTS idx_log_ticket_time ON ticket_status_log(ticket_id, changed_at);
