import { useState } from 'react';
import { customersApi } from '../api/customers.api';
import { ticketsApi } from '../api/tickets.api';
import { gio, nhanBaoHanh } from '../utils/format';

const loiTruong = (err, ten) => err?.fields?.[ten] && <small style={{ color: '#a40e26' }}>{err.fields[ten]}</small>;

// Màn hình 2 (UC1-UC5): tra cứu khách theo SĐT -> (tạo khách mới nếu chưa có) -> chọn thiết bị -> mô tả lỗi -> tạo phiếu
export default function ReceiveDevicePage({ onOpen }) {
  const [tim, setTim] = useState({ phone: '', name: '' });
  const [khach, setKhach] = useState(null); // { customer, devices, warning }
  const [khachMoi, setKhachMoi] = useState(null);
  const [form, setForm] = useState({ device_id: '', issue_desc: '', provided_purchase_date: '' });
  const [dang, setDang] = useState(false);
  const [loi, setLoi] = useState(null);
  const [ketQua, setKetQua] = useState(null);

  const chay = async (fn) => {
    setDang(true); setLoi(null);
    try { await fn(); } catch (err) { setLoi(err); } finally { setDang(false); }
  };

  const traCuu = (e) => {
    e.preventDefault();
    setKhach(null); setKhachMoi(null);
    chay(async () => {
      try {
        setKhach(await customersApi.traCuu(tim.phone, tim.name));
      } catch (err) {
        if (err.code !== 'CUSTOMER_NOT_FOUND') throw err;
        setKhachMoi({ full_name: tim.name, phone: tim.phone, email: '' }); // luồng 3a: SĐT chưa có -> tạo mới
      }
    });
  };

  const taoKhach = (e) => {
    e.preventDefault();
    chay(async () => {
      try {
        const customer = await customersApi.tao({ ...khachMoi, email: khachMoi.email || undefined });
        setKhach({ customer, devices: [], warning: null });
        setKhachMoi(null);
      } catch (err) {
        if (err.code === 'PHONE_EXISTS') { // đã tồn tại -> dùng lại hồ sơ có sẵn
          setKhach({ customer: err.details.existing_customer, devices: [], warning: null });
          setKhachMoi(null);
        } else throw err;
      }
    });
  };

  const taoPhieu = (e) => {
    e.preventDefault();
    chay(async () => {
      setKetQua(await ticketsApi.tiepNhan({
        customer_id: khach.customer.customer_id,
        device_id: Number(form.device_id) || undefined,
        issue_desc: form.issue_desc,
        ...(form.provided_purchase_date ? { provided_purchase_date: form.provided_purchase_date } : {}),
      }));
    });
  };

  if (ketQua) {
    const bh = nhanBaoHanh(ketQua);
    return (
      <section style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', background: '#fff', borderRadius: '8px' }}>
        <h2 style={{ marginTop: 0 }}>Đã tạo phiếu {ketQua.ticket_code}</h2>
        <p>Mức ưu tiên: <strong>{ketQua.priority}</strong> · Hạn cam kết: <strong>{gio(ketQua.due_date)}</strong></p>
        <p><span style={{ background: bh.bg, color: bh.color, padding: '2px 8px', borderRadius: '10px' }}>{bh.text}</span></p>
        {ketQua.message && <p style={{ background: '#fff4d6', padding: '10px' }}>{ketQua.message}</p>}
        <button onClick={() => onOpen(ketQua.ticket_id)}>Xem chi tiết phiếu</button>
      </section>
    );
  }

  const thietBi = khach?.devices.find((d) => String(d.device_id) === String(form.device_id));
  const box = { padding: '16px', background: '#fff', borderRadius: '8px', marginBottom: '16px' };

  return (
    <section style={{ padding: '20px', maxWidth: '640px', margin: '0 auto' }}>
      <h2>Tiếp nhận thiết bị</h2>

      <form onSubmit={traCuu} style={{ ...box, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <strong>1. Tra cứu khách hàng</strong>
        <input value={tim.phone} onChange={(e) => setTim({ ...tim, phone: e.target.value })} placeholder="Số điện thoại (vd. 0901234567 hoặc +84901234567)" style={{ padding: '8px' }} />
        {!khach && !khachMoi && loiTruong(loi, 'phone')}
        <input value={tim.name} onChange={(e) => setTim({ ...tim, name: e.target.value })} placeholder="Họ tên khách (để đối chiếu, không bắt buộc)" style={{ padding: '8px' }} />
        <button disabled={dang}>{dang && !khach ? 'Đang tra cứu...' : 'Tra cứu'}</button>
      </form>

      {loi && !loi.fields && <div role="alert" style={{ ...box, background: '#fde2e2', color: '#a40e26' }}>{loi.message} <button onClick={() => setLoi(null)}>Đóng</button></div>}

      {khachMoi && (
        <form onSubmit={taoKhach} style={{ ...box, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <strong>Chưa có khách hàng với số này, tạo mới</strong>
          <input value={khachMoi.full_name} onChange={(e) => setKhachMoi({ ...khachMoi, full_name: e.target.value })} placeholder="Họ tên" style={{ padding: '8px' }} />
          {loiTruong(loi, 'full_name')}
          <input value={khachMoi.phone} onChange={(e) => setKhachMoi({ ...khachMoi, phone: e.target.value })} placeholder="Số điện thoại" style={{ padding: '8px' }} />
          {loiTruong(loi, 'phone')}
          <input value={khachMoi.email} onChange={(e) => setKhachMoi({ ...khachMoi, email: e.target.value })} placeholder="Email (không bắt buộc)" style={{ padding: '8px' }} />
          {loiTruong(loi, 'email')}
          <button disabled={dang}>Tạo khách hàng</button>
        </form>
      )}

      {khach && (
        <form onSubmit={taoPhieu} style={{ ...box, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <strong>2. Thiết bị và lỗi: {khach.customer.full_name} ({khach.customer.phone})</strong>
          {khach.warning && <div style={{ background: '#fff4d6', padding: '8px' }}>{khach.warning}</div>}
          {khach.devices.length === 0 ? (
            <p style={{ color: '#555' }}>Khách này chưa có thiết bị trong hồ sơ. Việc thêm hồ sơ thiết bị nằm ngoài phạm vi chức năng này.</p>
          ) : (
            <>
              <select value={form.device_id} onChange={(e) => setForm({ ...form, device_id: e.target.value })} style={{ padding: '8px' }}>
                <option value="">— chọn thiết bị —</option>
                {khach.devices.map((d) => <option key={d.device_id} value={d.device_id}>{d.device_name} · {d.serial_no}</option>)}
              </select>
              {loiTruong(loi, 'device_id')}
              {thietBi && !thietBi.purchase_date && (
                <label>Hồ sơ chưa có ngày mua. Nhập nếu khách nhớ, để trống thì phiếu chờ Quản lý duyệt:
                  <input type="date" value={form.provided_purchase_date} onChange={(e) => setForm({ ...form, provided_purchase_date: e.target.value })} style={{ padding: '8px', display: 'block', marginTop: '4px' }} />
                </label>
              )}
              {loiTruong(loi, 'provided_purchase_date')}
              <textarea value={form.issue_desc} onChange={(e) => setForm({ ...form, issue_desc: e.target.value })} rows="4" placeholder="Mô tả lỗi (10 đến 2000 ký tự)" style={{ padding: '8px' }} />
              <small style={{ color: '#555' }}>{form.issue_desc.trim().length}/2000 ký tự. Nhóm sự cố và mức ưu tiên được đề xuất tự động từ mô tả.</small>
              {loiTruong(loi, 'issue_desc')}
              <button disabled={dang}>{dang ? 'Đang lưu...' : 'Tạo phiếu'}</button>
            </>
          )}
        </form>
      )}
    </section>
  );
}
