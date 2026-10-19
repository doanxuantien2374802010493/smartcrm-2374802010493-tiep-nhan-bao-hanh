-- DDL 6 Bảng chuẩn BT1 (Đã có IF NOT EXISTS để chạy lại không lỗi)
CREATE TABLE IF NOT EXISTS employee (
  employee_id BIGSERIAL PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('NHAN_VIEN_TIEP_NHAN', 'QUAN_LY')),
  center_id BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS customer (
  customer_id BIGSERIAL PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE CHECK (phone ~ '^0[0-9]{9}$'),
  email VARCHAR(120),
  is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS device (
  device_id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL REFERENCES customer(customer_id),
  device_name VARCHAR(120) NOT NULL,
  serial_no VARCHAR(50) NOT NULL UNIQUE,
  purchase_date DATE,
  warranty_months SMALLINT NOT NULL DEFAULT 12,
  is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS issue_category (
  category_id SERIAL PRIMARY KEY,
  category_name VARCHAR(60) NOT NULL UNIQUE,
  default_priority VARCHAR(10) NOT NULL CHECK (default_priority IN ('CAO', 'TRUNG_BINH', 'THAP')),
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS ticket (
  ticket_id BIGSERIAL PRIMARY KEY,
  ticket_code VARCHAR(20) NOT NULL UNIQUE,
  device_id BIGINT NOT NULL REFERENCES device(device_id),
  category_id INT REFERENCES issue_category(category_id),
  center_id BIGINT NOT NULL,
  issue_desc TEXT NOT NULL,
  priority VARCHAR(10) NOT NULL CHECK (priority IN ('CAO', 'TRUNG_BINH', 'THAP')),
  status VARCHAR(20) NOT NULL DEFAULT 'MOI' CHECK (status IN ('MOI', 'DA_PHAN_CONG', 'DANG_XU_LY', 'CHO_LINH_KIEN', 'HOAN_TAT', 'DA_DONG', 'DA_HUY')),
  provided_purchase_date DATE,
  is_warranty BOOLEAN NOT NULL DEFAULT false,
  warranty_verified BOOLEAN NOT NULL DEFAULT false,
  received_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  due_date TIMESTAMP NOT NULL,
  closed_at TIMESTAMP,
  is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS ticket_status_log (
  log_id BIGSERIAL PRIMARY KEY,
  ticket_id BIGINT NOT NULL REFERENCES ticket(ticket_id),
  from_status VARCHAR(20),
  to_status VARCHAR(20) NOT NULL,
  changed_by BIGINT NOT NULL REFERENCES employee(employee_id),
  changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index hỗ trợ NFR1
CREATE INDEX IF NOT EXISTS idx_device_customer ON device(customer_id);
CREATE INDEX IF NOT EXISTS idx_ticket_device ON ticket(device_id);
CREATE INDEX IF NOT EXISTS idx_ticket_center_status_due ON ticket(center_id, status, due_date);