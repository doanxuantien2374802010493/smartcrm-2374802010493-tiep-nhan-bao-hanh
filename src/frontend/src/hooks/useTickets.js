import { useEffect, useState } from 'react';
import { ticketsApi } from '../api/tickets.api';

export function useTickets(filters) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  useEffect(() => {
    let huy = false;
    setState({ data: null, loading: true, error: null });
    
    ticketsApi.danhSach(filters)
      .then(data => { 
        if (!huy) setState({ data, loading: false, error: null }); 
      })
      .catch(err => { 
        if (!huy) setState({ data: null, loading: false, error: err }); 
      });

    return () => { huy = true; };
  }, [JSON.stringify(filters)]);

  return state;
}