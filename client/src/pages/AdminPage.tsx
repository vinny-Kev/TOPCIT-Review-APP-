import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../hooks/useAuth';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

const AdminPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'USER' as 'USER' | 'ADMIN' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'ADMIN') {
      navigate('/');
      return;
    }
    const load = async () => {
      try {
        const { data } = await api.get('/admin/users');
        setUsers(data.users);
      } catch (err) {
        setError('Unable to load users');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, navigate]);

  const handleCreateUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const { data } = await api.post('/admin/users', form);
      setUsers((prev) => [data.user, ...prev]);
      setForm({ name: '', email: '', password: '', role: 'USER' });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to create account');
    }
  };

  const handleRoleChange = async (id: number, role: 'USER' | 'ADMIN') => {
    try {
      const { data } = await api.patch(`/admin/users/${id}/role`, { role });
      setUsers((prev) => prev.map((entry) => (entry.id === id ? data.user : entry)));
    } catch (err) {
      setError('Failed to update role');
    }
  };

  const handleDelete = async (id: number) => {
    if (id === user?.id) return;
    await api.delete(`/admin/users/${id}`);
    setUsers((prev) => prev.filter((entry) => entry.id !== id));
  };

  if (!user) {
    return null;
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div>
          <h1>Admin Control Room</h1>
          <p>Manage accounts, seed demo users, and keep the database in check.</p>
        </div>
        <div className="admin-actions">
          <button className="ghost" onClick={() => navigate('/')}>Return to app</button>
          <button className="ghost" onClick={logout}>Logout</button>
        </div>
      </header>

      {error && <p className="auth-error">{error}</p>}

      <div className="admin-grid">
        <section className="admin-card">
          <h2>Create test account</h2>
          <form className="note-form" onSubmit={handleCreateUser}>
            <label>
              <span>Name</span>
              <input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} required />
            </label>
            <label>
              <span>Email</span>
              <input type="email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} required />
            </label>
            <label>
              <span>Password</span>
              <input type="password" value={form.password} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} required />
            </label>
            <label>
              <span>Role</span>
              <select value={form.role} onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value as 'USER' | 'ADMIN' }))}>
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </label>
            <button type="submit" className="primary">Create</button>
          </form>
        </section>

        <section className="admin-card">
          <h2>Accounts overview</h2>
          {loading ? (
            <p>Loading users…</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.name}</td>
                    <td>{entry.email}</td>
                    <td>
                      <select value={entry.role} onChange={(event) => handleRoleChange(entry.id, event.target.value as 'USER' | 'ADMIN')} disabled={entry.id === user.id}>
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td>
                      <button className="ghost" disabled={entry.id === user.id} onClick={() => handleDelete(entry.id)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminPage;
