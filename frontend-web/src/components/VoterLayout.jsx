import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Vote, RefreshCw } from 'lucide-react';
import axios from 'axios';

const VoterLayout = ({ children, voterName, onRefresh, loading }) => {
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
            console.error('Logout failed', err);
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    return (
        <div style={{ width: '100%', minHeight: '100vh', padding: '20px 0' }}>
            <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
                <header style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '40px'
                }}>
                    <div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Welcome back,</p>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{voterName || 'Voter'}</h1>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {onRefresh && (
                            <button 
                                onClick={onRefresh}
                                disabled={loading}
                                style={{
                                    padding: '10px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '12px',
                                    color: 'var(--primary)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                            </button>
                        )}
                        <button 
                            onClick={handleLogout}
                            style={{
                                padding: '10px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                borderRadius: '12px',
                                color: '#f87171',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </header>

                <main>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default VoterLayout;
