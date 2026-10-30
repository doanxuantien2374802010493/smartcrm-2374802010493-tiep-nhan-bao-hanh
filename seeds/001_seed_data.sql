-- Dữ liệu mẫu. CHẠY LẠI KHÔNG NHÂN ĐÔI: mỗi dòng dùng khóa nghiệp vụ + ON CONFLICT / WHERE NOT EXISTS.
-- Tài khoản mẫu (chỉ để phát triển): ql1, nv1 (trung tâm 1), nv2 (trung tâm 2); mật khẩu chung Mekong@123

INSERT INTO issue_category (category_name, default_priority) VALUES
  ('MAN_HINH', 'CAO'), ('PIN', 'TRUNG_BINH'), ('SAC', 'TRUNG_BINH'),
  ('PHAN_MEM', 'THAP'), ('NUOC_VAO', 'CAO'), ('KHAC', 'THAP')
ON CONFLICT (category_name) DO NOTHING;

INSERT INTO employee (username, password_hash, full_name, role, center_id) VALUES
  ('ql1', '$2b$10$asdbPZ4gUuIImvvRtd2QFeBxcKN0KCaSue0lKnEVxfyZ0rMAP4u3u', 'Trần Thị Mai', 'QUAN_LY', 1),
  ('nv1', '$2b$10$asdbPZ4gUuIImvvRtd2QFeBxcKN0KCaSue0lKnEVxfyZ0rMAP4u3u', 'Lê Văn Bình', 'NHAN_VIEN_TIEP_NHAN', 1),
  ('nv2', '$2b$10$asdbPZ4gUuIImvvRtd2QFeBxcKN0KCaSue0lKnEVxfyZ0rMAP4u3u', 'Phạm Thu Hà', 'NHAN_VIEN_TIEP_NHAN', 2)
ON CONFLICT (username) DO NOTHING;

INSERT INTO customer (full_name, phone, email) VALUES
  ('Nguyễn Văn An', '0901234567', 'an@example.com'),
  ('Trần Thị Bích', '0912345678', NULL),
  ('Lê Hoàng Cường', '0987654321', 'cuong@example.com')
ON CONFLICT (phone) DO NOTHING;

-- Thiết bị: còn bảo hành / hết bảo hành / thiếu ngày mua (luồng 5a)
INSERT INTO device (customer_id, device_name, serial_no, purchase_date, warranty_months)
SELECT c.customer_id, v.device_name, v.serial_no, v.purchase_date::date, 12
  FROM (VALUES
    (1, '0901234567', 'iPhone 13',            'SN-AN-0001',    '2026-03-01'),
    (2, '0901234567', 'Samsung Galaxy A54',   'SN-AN-0002',    '2024-01-15'),
    (3, '0912345678', 'Xiaomi Redmi Note 12', 'SN-BICH-0001',  NULL),
    (4, '0987654321', 'OPPO Reno 8',          'SN-CUONG-0001', '2026-06-20')
  ) AS v(ord, phone, device_name, serial_no, purchase_date)
  JOIN customer c ON c.phone = v.phone
 ORDER BY v.ord
ON CONFLICT (serial_no) DO NOTHING;

-- 3 phiếu mẫu cho trung tâm 1 (mỗi phiếu kèm dòng log đầu tiên), chỉ tạo khi chưa có
WITH v(code, serial_no, cat, descr, prio, is_w, verified, recv, due) AS (VALUES
  ('BH-000001/2026', 'SN-AN-0001',   'MAN_HINH', 'Màn hình bị sọc ngang',  'CAO',        true,  true,  '2026-10-12 02:00', '2026-10-13 02:00'),
  ('BH-000002/2026', 'SN-AN-0002',   'PHAN_MEM', 'Máy hay treo khi mở camera', 'THAP',   false, true,  '2026-10-14 03:00', '2026-10-20 03:00'),
  ('BH-000003/2026', 'SN-BICH-0001', 'PIN',      'Pin tụt nhanh, sạc không đầy', 'TRUNG_BINH', false, false, '2026-10-15 04:00', '2026-10-19 04:00')),
moi AS (
  INSERT INTO ticket (ticket_code, device_id, category_id, center_id, issue_desc, priority,
                      is_warranty, warranty_verified, received_at, due_date)
  SELECT v.code, d.device_id, ic.category_id, 1, v.descr, v.prio, v.is_w, v.verified,
         v.recv::timestamp, v.due::timestamp
    FROM v
    JOIN device d ON d.serial_no = v.serial_no
    JOIN issue_category ic ON ic.category_name = v.cat
   WHERE NOT EXISTS (SELECT 1 FROM ticket t WHERE t.ticket_code = v.code)
   ORDER BY v.code
  RETURNING ticket_id, received_at)
INSERT INTO ticket_status_log (ticket_id, from_status, to_status, changed_by, changed_at)
SELECT m.ticket_id, NULL, 'MOI', (SELECT employee_id FROM employee WHERE username = 'nv1'), m.received_at
  FROM moi m;
