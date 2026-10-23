import { useState, useEffect } from 'react';
import { ticketsApi } from '../api/tickets.api';
import { DataState } from '../components/DataState';

export default function TicketDetailPage({ ticketId = 1 }) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  useEffect(() => {
    let isMounted = true;
    setState({ data: null, loading: true, error: null });

    ticketsApi.chiTiet(ticketId)
      .then(data => { if (isMounted) setState({ data, loading: false, error: null }); })
      .catch(err => { if (isMounted) setState({ data: null, loading: false, error: err }); });

    return () => { isMounted = false; };
  }, [ticketId]);

  return (
    <section style={{ padding: '20px' }}>
      <h2>Chi tiết phiếu bảo hành</h2>
      <DataState loading={state.loading} error={state.error} data={state.data} empty={{ message: 'Không tìm thấy phiếu.' }}>
        {(ticket) => (
          <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '5px' }}>
            <p><strong>Mã phiếu:</strong> {ticket.ticketCode}</p>
            <p><strong>Khách hàng:</strong> {ticket.customerName || ticket.tenKhach}</p>
            <p><strong>Thiết bị:</strong> {ticket.serialNo || ticket.deviceName}</p>
            <p><strong>Mô tả lỗi:</strong> {ticket.issueDesc}</p>
            <p><strong>Trạng thái:</strong> {ticket.status}</p>
          </div>
        )}
      </DataState>
    </section>
  );
}