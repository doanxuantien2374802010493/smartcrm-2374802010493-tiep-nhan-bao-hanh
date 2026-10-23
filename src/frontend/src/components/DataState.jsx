export function DataState({ loading, error, data, empty, children }) {
  if (loading) return <div className="skeleton" style={{ padding: '20px' }}>Đang tải dữ liệu...</div>;
  
  if (error) return (
    <div className="alert alert-error" style={{ color: 'red', padding: '20px' }}>
      <p>{error.message}</p>
      <button onClick={() => window.location.reload()}>Thử lại</button>
    </div>
  );

  const rong = !data || (Array.isArray(data) && data.length === 0);
  if (rong) return (
    <div className="empty-state" style={{ padding: '20px', fontStyle: 'italic' }}>
      <p>{empty?.message || 'Chưa có dữ liệu nào.'}</p>
      {empty?.action}
    </div>
  );

  return children(data);
}