import { useEffect, useState } from 'react';
import { authStore } from './api/client';
import LoginPage from './pages/LoginPage';
import TicketListPage from './pages/TicketListPage';
import ReceiveDevicePage from './pages/ReceiveDevicePage';
import TicketDetailPage from './pages/TicketDetailPage';

export default function App() {
  const [user, setUser] = useState(authStore.user());
  const [tab, setTab] = useState('list');
  const [ticketId, setTicketId] = useState(null);

  // Đăng nhập/đăng xuất (kể cả khi phiên hết hạn) cập nhật lại màn hình
  useEffect(() => {
    const cap = () => { setUser(authStore.user()); setTab('list'); };
    window.addEventListener('auth-changed', cap);
    return () => window.removeEventListener('auth-changed', cap);
  }, []);

  if (!user) return <div style={{ fontFamily: 'Arial, sans-serif', background: '#f4f7f6', minHeight: '100vh' }}><LoginPage /></div>;

  const moChiTiet = (id) => { setTicketId(id); setTab('detail'); };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', background: '#f4f7f6', minHeight: '100vh' }}>
      <header style={{ background: '#333', padding: '15px 20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
        <h3 style={{ color: '#fff', margin: '0 20px 0 0' }}>SmartCRM</h3>
        <button onClick={() => setTab('list')} style={btnStyle(tab === 'list')}>Danh sách phiếu</button>
        <button onClick={() => setTab('create')} style={btnStyle(tab === 'create')}>Tiếp nhận thiết bị</button>
        <span style={{ marginLeft: 'auto', color: '#ddd' }}>{user.full_name} · trung tâm {user.center_id}</span>
        <button onClick={() => authStore.clear()} style={btnStyle(false)}>Đăng xuất</button>
      </header>

      <main style={{ padding: '20px' }}>
        {tab === 'list' && <TicketListPage onOpen={moChiTiet} onCreate={() => setTab('create')} />}
        {tab === 'create' && <ReceiveDevicePage onOpen={moChiTiet} />}
        {tab === 'detail' && <TicketDetailPage ticketId={ticketId} onBack={() => setTab('list')} />}
      </main>
    </div>
  );
}

const btnStyle = (isActive) => ({
  background: isActive ? '#007bff' : 'transparent',
  color: '#fff',
  border: '1px solid #555',
  padding: '8px 16px',
  cursor: 'pointer',
  borderRadius: '4px',
  fontWeight: isActive ? 'bold' : 'normal',
});
