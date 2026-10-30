import { useCallback, useEffect, useState } from 'react';
import { ticketsApi } from '../api/tickets.api';
import { authStore } from '../api/client';
import { DataState } from '../components/DataState';
import { gio, nhanBaoHanh } from '../utils/format';

// Màn hình 3: chi tiết phiếu. Quản lý thấy thêm lịch sử trạng thái (US7) và nút phê duyệt bảo hành (US4).
export default function TicketDetailPage({ ticketId, onBack }) {
  const laQuanLy = authStore.user()?.role === 'QUAN_LY';
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [lichSu, setLichSu] = useState([]);
  const [dang, setDang] = useState(false);
  const [loiHanhDong, setLoiHanhDong] = useState(null);

  const tai = useCallback(() => {
    setState({ data: null, loading: true, error: null });
    ticketsApi.chiTiet(ticketId)
      .then(async (data) => {
        setState({ data, loading: false, error: null });
        if (laQuanLy) setLichSu((await ticketsApi.lichSu(ticketId)).data);
      })
      .catch((error) => setState({ data: null, loading: false, error }));
  }, [ticketId, laQuanLy]);

  useEffect(() => { tai(); }, [tai]);

  const pheDuyet = async (isWarranty) => {
    setDang(true); setLoiHanhDong(null);
    try { await ticketsApi.pheDuyet(ticketId, isWarranty); tai(); } catch (err) { setLoiHanhDong(err); } finally { setDang(false); }
  };

  return (
    <section style={{ padding: '20px' }}>
      <button onClick={onBack}>← Danh sách</button>
      <h2>Chi tiết phiếu bảo hành</h2>
      <DataState loading={state.loading} error={state.error} data={state.data} empty={{ message: 'Không tìm thấy phiếu.' }} onRetry={tai}>
        {(t) => {
          const bh = nhanBaoHanh(t);
          return (
            <div style={{ background: '#fff', padding: '16px', borderRadius: '6px' }}>
              <p><strong>Mã phiếu:</strong> {t.ticket_code} · <strong>Trạng thái:</strong> {t.status}</p>
              <p><strong>Khách hàng:</strong> {t.customer_name} ({t.customer_phone})</p>
              <p><strong>Thiết bị:</strong> {t.device_name} · {t.serial_no}</p>
              <p><strong>Mô tả lỗi:</strong> {t.issue_desc}</p>
              <p><strong>Nhóm sự cố:</strong> {t.category_name || 'Chưa phân loại'} · <strong>Ưu tiên:</strong> {t.priority}</p>
              <p><strong>Tiếp nhận:</strong> {gio(t.received_at)} · <strong>Hạn cam kết:</strong> {gio(t.due_date)}</p>
              <p><strong>Bảo hành:</strong> <span style={{ background: bh.bg, color: bh.color, padding: '2px 8px', borderRadius: '10px' }}>{bh.text}</span></p>

              {laQuanLy && !t.warranty_verified && (
                <div style={{ background: '#fff4d6', padding: '12px', margin: '12px 0' }}>
                  <p style={{ marginTop: 0 }}>Phiếu chưa xác minh bảo hành (thiếu ngày mua). Quản lý quyết định:</p>
                  <button disabled={dang} onClick={() => pheDuyet(true)}>Duyệt: còn bảo hành</button>{' '}
                  <button disabled={dang} onClick={() => pheDuyet(false)}>Duyệt: hết bảo hành</button>
                  {loiHanhDong && <p role="alert" style={{ color: '#a40e26' }}>{loiHanhDong.message}</p>}
                </div>
              )}

              {laQuanLy && (
                <>
                  <h3>Lịch sử trạng thái</h3>
                  {lichSu.length === 0 ? <p style={{ color: '#555' }}>Chưa có bản ghi lịch sử.</p> : (
                    <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
                      <thead><tr style={{ background: '#eee' }}><th>Lúc</th><th>Từ</th><th>Sang</th><th>Người đổi</th></tr></thead>
                      <tbody>{lichSu.map((l) => (
                        <tr key={l.log_id}><td>{gio(l.changed_at)}</td><td>{l.from_status || '—'}</td><td>{l.to_status}</td><td>{l.changed_by_name}</td></tr>
                      ))}</tbody>
                    </table>
                  )}
                </>
              )}
            </div>
          );
        }}
      </DataState>
    </section>
  );
}
