-- Tạo bảng Khách hàng (Customer)
CREATE TABLE customer (
  customer_id BIGSERIAL PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE
);

-- Tạo chỉ mục tra cứu nhanh cho SĐT khách hàng (Đáp ứng NFR1)
CREATE INDEX idx_customer_phone ON customer(phone);

-- Tạo bảng Phiếu bảo hành (Ticket)
CREATE TABLE ticket (
  ticket_id BIGSERIAL PRIMARY KEY,
  ticket_code VARCHAR(20) NOT NULL UNIQUE,
  customer_id BIGINT NOT NULL REFERENCES customer(customer_id),
  device_id BIGINT NOT NULL REFERENCES device(device_id),
  issue_desc TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'MOI',
  is_warranty BOOLEAN DEFAULT false,
  warranty_verified BOOLEAN DEFAULT false,
  due_date TIMESTAMP NOT NULL
);

-- Tạo các chỉ mục tối ưu truy vấn cho Tickets (Đáp ứng NFR1)
CREATE INDEX idx_ticket_status_due ON ticket(status, due_date);