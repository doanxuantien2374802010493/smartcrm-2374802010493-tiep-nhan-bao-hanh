import { useState } from 'react';
import { useTickets } from '../hooks/useTickets';
import { DataState } from '../components/DataState';
import { authStore } from '../api/client';
import { gio, nhanBaoHanh, quaHan } from '../utils/format';

// Màn hình 1: danh sách phiếu của trung tâm mình (số liệu lấy từ API thật, SĐT đã che theo QT-15)
export default function TicketListPage({ onOpen, onCreate }) {
  const laQuanLy = authStore.user()?.role === 'QUAN_LY';
  const [chuaXacMinh, setChuaXacMinh] = useState(false);
  const { rows, total, loading, error, reload } = useTickets({ page: 1, size: 20, chuaXacMinh });

  // Rỗng có hai nghĩa khác nhau: "chưa có dữ liệu" và "bộ lọc không ra kết quả"
  const empty = chuaXacMinh
    ? { message: 'Không có phiếu nào đang chờ xác minh bảo hành.', action: <button onClick={() => setChuaXacMinh(false)}>Xóa bộ lọc</button> }
    : { message: 'Trung tâm của bạn chưa có phiếu bảo hành nào.', action: <button onClick={onCreate}>Tiếp nhận thiết bị đầu tiên</button> };

  return (
    <section style={{ padding: '20px' }}>
      <h2>Danh sách phiếu bảo hành</h2>
      <div style={{ marginBottom: '15px', display: 'flex', gap: '15px', alignItems: 'center' }}>
        <button onClick={reload}>Tải lại</button>
        {laQuanLy && (
          <label><input type="checkbox" checked={chuaXacMinh} onChange={(e) => setChuaXacMinh(e.target.checked)} /> Chỉ phiếu chờ xác minh bảo hành</label>
        )}
      </div>

      <DataState loading={loading} error={error} data={rows} empty={empty} onRetry={reload}>
        {(list) => {
          const choDuyet = list.filter((t) => !t.warranty_verified).length;
          return (
            <>
              <p style={{ color: '#555' }}>
                Hiển thị {list.length}/{total} phiếu · chờ xác minh: {choDuyet}/{list.length} · quá hạn: {list.filter(quaHan).length}/{list.length}
              </p>
              <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
                <thead>
                  <tr style={{ background: '#eee' }}>
                    <th>Mã phiếu</th><th>Khách hàng</th><th>SĐT</th><th>Thiết bị</th><th>Ưu tiên</th><th>Hạn cam kết</th><th>Trạng thái</th><th>Bảo hành</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((t) => {
                    const bh = nhanBaoHanh(t);
                    return (
                      <tr key={t.ticket_id}>
                        <td><a href="#chi-tiet" onClick={(e) => { e.preventDefault(); onOpen(t.ticket_id); }}>{t.ticket_code}</a></td>
                        <td>{t.customer_name}</td><td>{t.customer_phone}</td><td>{t.device_name}</td><td>{t.priority}</td>
                        <td style={quaHan(t) ? { color: '#a40e26', fontWeight: 'bold' } : undefined}>{gio(t.due_date)}{quaHan(t) ? ' (quá hạn)' : ''}</td>
                        <td>{t.status}</td>
                        <td><span style={{ background: bh.bg, color: bh.color, padding: '2px 8px', borderRadius: '10px' }}>{bh.text}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          );
        }}
      </DataState>
    </section>
  );
}
