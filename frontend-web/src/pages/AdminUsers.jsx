import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { UserCheck, Trash2, Upload, Search, Loader2, AlertCircle, CheckCircle, X } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [importResult, setImportResult] = useState(null);
    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef(null);

    const token = localStorage.getItem('access_token');

    const fetchUsers = async (query = '') => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8000/api/accounts/users/?search=${query}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
        } catch (err) {
            console.error('Failed to fetch users', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => fetchUsers(search), 300);
        return () => clearTimeout(timer);
    }, [search]);

    const deleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await axios.delete(`http://localhost:8000/api/accounts/users/${id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsers(search);
        } catch (err) {
            alert('Failed to delete user');
        }
    };

    const handleCSVImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImporting(true);
        setImportResult(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:8000/api/accounts/users/csv_import/', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });
            setImportResult(response.data);
            fetchUsers(search);
        } catch (err) {
            setImportResult({ error: err.response?.data?.error || 'Import failed' });
        } finally {
            setImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <AdminLayout>
            <div className="fade-in" style={{ padding: '40px', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>User Management</h1>
                        <p style={{ color: 'var(--text-muted)' }}>View, manage, and import voters</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <input type="file" ref={fileInputRef} accept=".csv" onChange={handleCSVImport} style={{ display: 'none' }} />
                        <button
                            className="btn-primary"
                            style={{ width: 'auto', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
                            onClick={() => fileInputRef.current?.click()}
                            disabled={importing}
                        >
                            {importing ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                            {importing ? 'Importing...' : 'Import CSV'}
                        </button>
                    </div>
                </div>

                {/* Import Result Banner */}
                {importResult && (
                    <div className="glass-card" style={{
                        padding: '20px 24px',
                        marginBottom: '24px',
                        borderLeft: `4px solid ${importResult.error ? '#ef4444' : '#22c55e'}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                    }}>
                        <div>
                            {importResult.error ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444' }}>
                                    <AlertCircle size={20} />
                                    <span style={{ fontWeight: '600' }}>{importResult.error}</span>
                                </div>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#22c55e', marginBottom: '8px' }}>
                                        <CheckCircle size={20} />
                                        <span style={{ fontWeight: '600' }}>{importResult.created} user(s) imported successfully</span>
                                    </div>
                                    {importResult.errors?.length > 0 && (
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            {importResult.errors.map((err, i) => (
                                                <div key={i} style={{ marginBottom: '2px' }}>⚠ {err}</div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        <button
                            onClick={() => setImportResult(null)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}

                {/* Search */}
                <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Search size={20} color="var(--text-muted)" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or student ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            flex: 1, background: 'transparent', border: 'none', color: 'white',
                            outline: 'none', fontSize: '1rem',
                        }}
                    />
                </div>

                {/* Users Table */}
                <div className="glass-card" style={{ overflow: 'hidden' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px' }}>
                            <Loader2 className="animate-spin" size={40} color="var(--primary)" />
                        </div>
                    ) : users.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                            <UserCheck size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                            <p>No users found.</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(148,163,184,0.15)' }}>
                                        {['Student ID', 'Username', 'Email', 'Course', 'Year', 'Verified', 'Joined', ''].map(h => (
                                            <th key={h} style={{
                                                padding: '16px 20px', textAlign: 'left', fontSize: '0.8rem',
                                                color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                            }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id} style={{
                                            borderBottom: '1px solid rgba(148,163,184,0.08)',
                                            transition: 'background 0.15s',
                                        }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ padding: '14px 20px', fontSize: '0.9rem', fontWeight: '500' }}>
                                                {user.student_id || '—'}
                                            </td>
                                            <td style={{ padding: '14px 20px', fontSize: '0.9rem' }}>{user.username}</td>
                                            <td style={{ padding: '14px 20px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{user.email}</td>
                                            <td style={{ padding: '14px 20px', fontSize: '0.9rem' }}>{user.course || '—'}</td>
                                            <td style={{ padding: '14px 20px', fontSize: '0.9rem' }}>{user.year_level || '—'}</td>
                                            <td style={{ padding: '14px 20px' }}>
                                                <span style={{
                                                    padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600',
                                                    background: user.is_verified ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                                                    color: user.is_verified ? '#22c55e' : '#ef4444',
                                                }}>
                                                    {user.is_verified ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '14px 20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                {new Date(user.date_joined).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '14px 20px' }}>
                                                <button
                                                    onClick={() => deleteUser(user.id)}
                                                    style={{
                                                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                                                        color: '#f87171', cursor: 'pointer', padding: '8px', borderRadius: '10px',
                                                        transition: 'all 0.2s',
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.25)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                                                    title="Delete user"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* CSV Format Help */}
                <div className="glass-card" style={{ padding: '24px', marginTop: '24px' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '12px', color: 'var(--text-muted)' }}>CSV Import Format</h3>
                    <code style={{
                        display: 'block', background: 'rgba(15,23,42,0.6)', padding: '16px', borderRadius: '12px',
                        fontSize: '0.85rem', color: '#a5b4fc', lineHeight: '1.6',
                    }}>
                        student_id,email,name,course,year_level<br />
                        2024-0001,john@school.edu,John Doe,BSIT,1st Year<br />
                        2024-0002,jane@school.edu,Jane Doe,BSCS,2nd Year<br />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>(Optional: username, password. If missing, name/email is used for username and student_id for password)</span>
                    </code>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminUsers;
