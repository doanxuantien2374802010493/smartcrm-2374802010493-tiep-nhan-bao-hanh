// Ba trạng thái bắt buộc: đang tải · rỗng · lỗi (có nút Thử lại). Không bao giờ để màn hình trắng.
export function DataState({ loading, error, data, empty, onRetry, children }) {
  if (loading) return <div className="skeleton" role="status" style={{ padding: '20px' }}>Đang tải dữ liệu...</div>;

  if (error) return (
    <div className="alert alert-error" role="alert" style={{ color: '#a40e26', background: '#fde2e2', padding: '16px', borderRadius: '6px' }}>
      <p style={{ marginTop: 0 }}>{error.message}</p>
      {onRetry && <button onClick={onRetry}>Thử lại</button>}
    </div>
  );

  const rong = !data || (Array.isArray(data) && data.length === 0);
  if (rong) return (
    <div className="empty-state" style={{ padding: '24px', textAlign: 'center', color: '#555' }}>
      <p>{empty?.message || 'Chưa có dữ liệu nào.'}</p>
      {empty?.action}
    </div>
  );

  return children(data);
}
