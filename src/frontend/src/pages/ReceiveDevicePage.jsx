import { useState } from 'react';
import { ticketsApi } from '../api/tickets.api';

export default function ReceiveDevicePage() {
  const [form, setForm] = useState({ phone: '', serialNo: '', issueDesc: '', priority: 'TRUNG_BINH' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await ticketsApi.tiepNhan(form);
      setMessage({ type: 'success', text: `Tiếp nhận thành công! Mã phiếu: ${res?.ticketCode || 'Đã tạo'}` });
      setForm({ phone: '', serialNo: '', issueDesc: '', priority: 'TRUNG_BINH' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Tiếp nhận thiết bị</h2>
      {message && (
        <div style={{ padding: '10px', marginBottom: '15px', color: message.type === 'success' ? 'green' : 'red', border: '1px solid' }}>
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required placeholder="Số điện thoại" style={{ padding: '8px' }} />
        <input type="text" value={form.serialNo} onChange={e => setForm({...form, serialNo: e.target.value})} required placeholder="Serial thiết bị" style={{ padding: '8px' }} />
        <textarea value={form.issueDesc} onChange={e => setForm({...form, issueDesc: e.target.value})} required rows="4" placeholder="Mô tả lỗi" style={{ padding: '8px' }} />
        <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} style={{ padding: '8px' }}>
          <option value="CAO">CAO</option>
          <option value="TRUNG_BINH">TRUNG BÌNH</option>
          <option value="THAP">THẤP</option>
        </select>
        <button type="submit" disabled={submitting} style={{ padding: '10px', cursor: 'pointer' }}>
          {submitting ? 'Đang xử lý...' : 'Tạo phiếu'}
        </button>
      </form>
    </section>
  );
}