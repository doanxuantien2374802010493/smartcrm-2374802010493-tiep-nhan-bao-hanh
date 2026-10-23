import { useState } from 'react';
import { useTickets } from '../hooks/useTickets';
import { DataState } from '../components/DataState';

export default function TicketListPage() {
  const [filters, setFilters] = useState({ trang: 1 });
  const { data, loading, error } = useTickets(filters);

  return (
    <section style={{ padding: '20px' }}>
      <h2>Danh sách phiếu bảo hành</h2>
      <button onClick={() => setFilters({ trang: 1 })} style={{ marginBottom: '15px', padding: '5px 10px' }}>Tải lại</button>
      
      <DataState 
        loading={loading} 
        error={error} 
        data={data}
        empty={{ message: 'Không có dữ liệu.', action: <button onClick={() => setFilters({ trang: 1 })}>Xoá lọc</button> }}
      >
        {(rows) => (
          <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#eee' }}>
                <th>Mã phiếu</th>
                <th>Khách hàng</th>
                <th>Hạn cam kết</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((ticket) => (
                <tr key={ticket.ticketId || ticket.id}>
                  <td>{ticket.ticketCode}</td>
                  <td>{ticket.tenKhach || ticket.customerName}</td>
                  <td>{ticket.hanCamKet || ticket.dueDate}</td>
                  <td>{ticket.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DataState>
    </section>
  );
}