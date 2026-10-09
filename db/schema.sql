-- =====================================================================
-- SmartCRM - Luong L2: Tiep nhan va phan loai yeu cau bao hanh (PostgreSQL)
-- 7 bang: 5 bang loi + 2 bang phu tro toi thieu (service_center, employee)
-- Thu tu tao bang: bang khong phu thuoc truoc, bang co khoa ngoai sau.
-- =====================================================================

-- 1. Trung tam bao hanh (bang phu tro, phuc vu QT-14)
CREATE TABLE service_center (
  center_id   BIGSERIAL PRIMARY KEY,
  center_name VARCHAR(120) NOT NULL UNIQUE
);

-- 2. Nhan vien (bang phu tro, phuc vu QT-14, QT-15, QT-06 - changed_by)
CREATE TABLE employee (
  employee_id BIGSERIAL PRIMARY KEY,
  full_name   VARCHAR(120) NOT NULL,
  role        VARCHAR(20)  NOT NULL
              CHECK (role IN ('NHAN_VIEN_TIEP_NHAN', 'QUAN_LY')),
  center_id   BIGINT       NOT NULL REFERENCES service_center(center_id)
);
CREATE INDEX idx_employee_center ON employee(center_id);

-- 3. Khach hang (QT-01, QT-02, QT-13)
CREATE TABLE customer (
  customer_id BIGSERIAL PRIMARY KEY,
  full_name   VARCHAR(120) NOT NULL,
  phone       VARCHAR(20)  NOT NULL UNIQUE          -- UNIQUE da tu tao index (NFR1)
              CHECK (phone ~ '^0[0-9]{9}$'),        -- QT-02: 10 chu so, bat dau bang 0
  email       VARCHAR(120),
  is_deleted  BOOLEAN      NOT NULL DEFAULT false   -- QT-13: xoa mem
);

-- 4. Thiet bi (QT-03, QT-05, QT-13)
CREATE TABLE device (
  device_id       BIGSERIAL PRIMARY KEY,
  customer_id     BIGINT       NOT NULL REFERENCES customer(customer_id),
  device_name     VARCHAR(120) NOT NULL,            -- vd: iPhone 13 (hien thi tren wireframe)
  serial_no       VARCHAR(50)  NOT NULL UNIQUE,     -- QT-03: serial/IMEI
  purchase_date   DATE,                             -- NULL duoc (QT-05)
  warranty_months SMALLINT     NOT NULL DEFAULT 12,
  is_deleted      BOOLEAN      NOT NULL DEFAULT false
);
CREATE INDEX idx_device_customer ON device(customer_id);   -- JOIN khach hang -> thiet bi (FR1)

-- 5. Nhom su co (FR5)
CREATE TABLE issue_category (
  category_id      SERIAL PRIMARY KEY,
  category_name    VARCHAR(60) NOT NULL UNIQUE,     -- MAN_HINH / PIN / SAC / PHAN_MEM / NUOC_VAO / KHAC
  default_priority VARCHAR(10) NOT NULL
                   CHECK (default_priority IN ('CAO', 'TRUNG_BINH', 'THAP')),
  is_active        BOOLEAN     NOT NULL DEFAULT true
);

-- 6. Phieu bao hanh
-- Khong luu customer_id: khach hang suy ra qua device.customer_id (3NF).
-- provided_purchase_date: ngay mua nhan vien nhap khi tao phieu, de khong sua de ho so thiet bi
--   (WON'T: tao/sua ho so thiet bi). QT-05 dung device.purchase_date, neu rong thi dung gia tri nay.
-- is_warranty, due_date: gia tri chot tai thoi diem tao phieu (QT-04, QT-05).
CREATE TABLE ticket (
  ticket_id              BIGSERIAL PRIMARY KEY,
  ticket_code            VARCHAR(20) NOT NULL UNIQUE,            -- dang BH-000123/2026
  device_id              BIGINT      NOT NULL REFERENCES device(device_id),
  category_id            INT         REFERENCES issue_category(category_id),
  center_id              BIGINT      NOT NULL REFERENCES service_center(center_id),
  issue_desc             TEXT        NOT NULL,                   -- 8a: thieu mo ta -> tu choi luu
  priority               VARCHAR(10) NOT NULL
                         CHECK (priority IN ('CAO', 'TRUNG_BINH', 'THAP')),
  status                 VARCHAR(20) NOT NULL DEFAULT 'MOI'
                         CHECK (status IN ('MOI', 'DA_PHAN_CONG', 'DANG_XU_LY',
                                           'CHO_LINH_KIEN', 'HOAN_TAT', 'DA_DONG', 'DA_HUY')),
  provided_purchase_date DATE,
  is_warranty            BOOLEAN     NOT NULL DEFAULT false,
  warranty_verified      BOOLEAN     NOT NULL DEFAULT false,
  received_at            TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  due_date               TIMESTAMP   NOT NULL,
  closed_at              TIMESTAMP,
  is_deleted             BOOLEAN     NOT NULL DEFAULT false
);
CREATE INDEX idx_ticket_device ON ticket(device_id);
-- Man hinh 1: moi nhan vien chi xem trung tam minh (QT-14), loc theo trang thai, sap theo han cam ket
CREATE INDEX idx_ticket_center_status_due ON ticket(center_id, status, due_date);
-- Bo loc "Chi phieu chua xac minh bao hanh" (index tung phan, nho gon)
CREATE INDEX idx_ticket_unverified ON ticket(ticket_id) WHERE warranty_verified = false;

-- 7. Lich su chuyen trang thai (QT-06: chi ghi them)
CREATE TABLE ticket_status_log (
  log_id      BIGSERIAL PRIMARY KEY,
  ticket_id   BIGINT      NOT NULL REFERENCES ticket(ticket_id),
  from_status VARCHAR(20),                                       -- NULL o lan dau
  to_status   VARCHAR(20) NOT NULL,
  changed_by  BIGINT      NOT NULL REFERENCES employee(employee_id),
  changed_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_log_ticket_time ON ticket_status_log(ticket_id, changed_at);

-- ---------------------------------------------------------------------
-- Chan o tang CSDL (bo sung cho viec "khong co ham xoa / endpoint DELETE" o tang ung dung)
-- ---------------------------------------------------------------------
CREATE FUNCTION forbid_change() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Khong duoc % tren bang % (QT-06, QT-13)', TG_OP, TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_append_only
  BEFORE UPDATE OR DELETE ON ticket_status_log
  FOR EACH ROW EXECUTE FUNCTION forbid_change();

CREATE TRIGGER trg_ticket_no_delete
  BEFORE DELETE ON ticket
  FOR EACH ROW EXECUTE FUNCTION forbid_change();