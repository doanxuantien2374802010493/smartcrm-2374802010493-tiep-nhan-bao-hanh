import { useState } from 'react';
import { authApi } from '../api/auth.api';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try { await authApi.dangNhap(form.username, form.password); } catch (err) { setError(err); } finally { setSubmitting(false); }
  };

  return (
    <section style={{ maxWidth: '360px', margin: '80px auto', background: '#fff', padding: '24px', borderRadius: '8px' }}>
      <h2 style={{ marginTop: 0 }}>Đăng nhập SmartCRM</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Tên đăng nhập" autoFocus style={{ padding: '8px' }} />
        {error?.fields?.username && <small style={{ color: '#a40e26' }}>{error.fields.username}</small>}
        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Mật khẩu" style={{ padding: '8px' }} />
        {error?.fields?.password && <small style={{ color: '#a40e26' }}>{error.fields.password}</small>}
        {error && !error.fields && <div role="alert" style={{ color: '#a40e26' }}>{error.message}</div>}
        <button type="submit" disabled={submitting} style={{ padding: '10px' }}>{submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}</button>
      </form>
    </section>
  );
}
