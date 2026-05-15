import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ListChecks, Users, LogOut, Flag, UserCheck } from 'lucide-react';
import axios from 'axios';

const navItems = [
    { to: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/admin/elections', icon: <ListChecks size={20} />, label: 'Elections' },
    { to: '/admin/candidates', icon: <Users size={20} />, label: 'Candidates' },
    { to: '/admin/partylists', icon: <Flag size={20} />, label: 'Partylists' },
    { to: '/admin/users', icon: <UserCheck size={20} />, label: 'Users' },
];

const AdminLayout = ({ children }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (token) {
                await axios.post('http://localhost:8000/api/accounts/logout/', {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
        } catch (err) {
            console.error('Logout failed on backend', err);
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            navigate('/login');
        }
    };

    return (
        <div style={{ display: 'flex', width: '100%', minHeight: '100vh' }}>
            {/* Sidebar */}
            <aside style={{
                width: '240px',
                minHeight: '100vh',
                background: 'rgba(15, 23, 42, 0.95)',
                borderRight: '1px solid rgba(148, 163, 184, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                padding: '30px 0',
                flexShrink: 0,
                backdropFilter: 'blur(20px)',
                position: 'sticky',
                top: 0,
                height: '100vh',
            }}>
                {/* Logo */}
                <div style={{ padding: '0 24px 30px', borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '40px', height: '40px',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            borderRadius: '12px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <LayoutDashboard size={20} color="white" />
                        </div>
                        <div>
                            <div style={{ fontWeight: '700', fontSize: '1rem', letterSpacing: '0.5px' }}>SOAVS</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Admin Panel</div>
                        </div>
                    </div>
                </div>

                {/* Nav Links */}
                <nav style={{ flex: 1, padding: '20px 12px' }}>
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                marginBottom: '6px',
                                textDecoration: 'none',
                                fontWeight: '500',
                                fontSize: '0.95rem',
                                transition: 'all 0.2s ease',
                                background: isActive
                                    ? 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.15))'
                                    : 'transparent',
                                color: isActive ? '#a5b4fc' : 'var(--text-muted)',
                                border: isActive ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                            })}
                        >
                            {item.icon}
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div style={{ padding: '20px 12px', borderTop: '1px solid rgba(148,163,184,0.1)' }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            background: 'rgba(239, 68, 68, 0.08)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            color: '#f87171',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '0.95rem',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(239,68,68,0.18)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
                        }}
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, overflowY: 'auto', minHeight: '100vh' }}>
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
