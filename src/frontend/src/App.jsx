import { useState } from 'react';
import TicketListPage from './pages/TicketListPage';
import ReceiveDevicePage from './pages/ReceiveDevicePage';
import TicketDetailPage from './pages/TicketDetailPage';

export default function App() {
  const [currentTab, setCurrentTab] = useState('list');

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', background: '#f4f7f6', minHeight: '100vh' }}>
      <header style={{ background: '#333', padding: '15px 20px', display: 'flex', gap: '15px' }}>
        <h3 style={{ color: '#fff', margin: '0 20px 0 0' }}>SmartCRM</h3>
        <button onClick={() => setCurrentTab('list')} style={btnStyle(currentTab === 'list')}>Danh sách phiếu</button>
        <button onClick={() => setCurrentTab('create')} style={btnStyle(currentTab === 'create')}>Tiếp nhận thiết bị</button>
        <button onClick={() => setCurrentTab('detail')} style={btnStyle(currentTab === 'detail')}>Chi tiết phiếu</button>
      </header>

      <main style={{ padding: '20px' }}>
        {currentTab === 'list' && <TicketListPage />}
        {currentTab === 'create' && <ReceiveDevicePage />}
        {currentTab === 'detail' && <TicketDetailPage ticketId={1} />}
      </main>
    </div>
  );
}

// Hàm hỗ trợ style cho nút bấm menu
const btnStyle = (isActive) => ({
  background: isActive ? '#007bff' : 'transparent',
  color: '#fff',
  border: '1px solid #555',
  padding: '8px 16px',
  cursor: 'pointer',
  borderRadius: '4px',
  fontWeight: isActive ? 'bold' : 'normal'
});