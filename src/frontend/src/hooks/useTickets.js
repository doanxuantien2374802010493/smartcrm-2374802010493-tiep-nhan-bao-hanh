import { useCallback, useEffect, useState } from 'react';
import { ticketsApi } from '../api/tickets.api';

// Tải danh sách phiếu theo bộ lọc; reload() để thử lại khi lỗi
export function useTickets(filters) {
  const [state, setState] = useState({ rows: null, total: 0, loading: true, error: null });
  const [lan, setLan] = useState(0);

  useEffect(() => {
    let huy = false;
    setState({ rows: null, total: 0, loading: true, error: null });
    ticketsApi.danhSach(filters)
      .then((res) => { if (!huy) setState({ rows: res.data, total: res.total, loading: false, error: null }); })
      .catch((error) => { if (!huy) setState({ rows: null, total: 0, loading: false, error }); });
    return () => { huy = true; };
  }, [JSON.stringify(filters), lan]);

  const reload = useCallback(() => setLan((n) => n + 1), []);
  return { ...state, reload };
}
