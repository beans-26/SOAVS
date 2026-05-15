import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, Users, Vote, ListChecks, Loader2, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AdminLayout from '../components/AdminLayout';

const StatCard = ({ icon, label, value, color, gradient }) => (
    <div className="glass-card" style={{
        padding: '28px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'default',
    }}
        onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = `0 20px 40px -15px ${color}33`;
        }}
        onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0,0,0,0.5)';
        }}
    >
        <div style={{
            width: '56px', height: '56px',
            background: gradient,
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
        }}>
            {icon}
        </div>
        <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: '500' }}>
                {label}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', letterSpacing: '-0.5px' }}>
                {value}
            </div>
        </div>
    </div>
);

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '12px',
                padding: '12px 16px',
                backdropFilter: 'blur(12px)',
            }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>{label}</p>
                <p style={{ color: '#818cf8', fontWeight: '600', fontSize: '1.1rem' }}>
                    {payload[0].value} votes
                </p>
            </div>
        );
    }
    return null;
};

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('access_token');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/dashboard-stats/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(response.data);
            } catch (err) {
                console.error('Failed to fetch dashboard stats', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
        const interval = setInterval(fetchStats, 15000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <AdminLayout>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <Loader2 className="animate-spin" size={48} color="var(--primary)" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="fade-in" style={{ padding: '40px', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ marginBottom: '36px' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Overview of your voting system</p>
                </div>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '36px' }}>
                    <StatCard
                        icon={<ListChecks size={26} color="white" />}
                        label="Active Elections"
                        value={stats?.active_elections ?? 0}
                        color="#6366f1"
                        gradient="linear-gradient(135deg, #6366f1, #8b5cf6)"
                    />
                    <StatCard
                        icon={<Users size={26} color="white" />}
                        label="Total Candidates"
                        value={stats?.total_candidates ?? 0}
                        color="#3b82f6"
                        gradient="linear-gradient(135deg, #3b82f6, #06b6d4)"
                    />
                    <StatCard
                        icon={<Vote size={26} color="white" />}
                        label="Total Voters"
                        value={stats?.total_voters ?? 0}
                        color="#22c55e"
                        gradient="linear-gradient(135deg, #22c55e, #10b981)"
                    />
                    <StatCard
                        icon={<TrendingUp size={26} color="white" />}
                        label="Votes Cast"
                        value={stats?.total_votes ?? 0}
                        color="#f59e0b"
                        gradient="linear-gradient(135deg, #f59e0b, #ef4444)"
                    />
                </div>

                {/* Turnout Chart */}
                <div className="glass-card" style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                        <BarChart3 size={24} color="var(--primary)" />
                        <h2 style={{ fontSize: '1.3rem' }}>Turnout Progression</h2>
                    </div>
                    {stats?.turnout_progression?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={320}>
                            <AreaChart data={stats.turnout_progression}>
                                <defs>
                                    <linearGradient id="colorVotes" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    axisLine={{ stroke: 'rgba(148,163,184,0.1)' }}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    axisLine={{ stroke: 'rgba(148,163,184,0.1)' }}
                                    tickLine={false}
                                    allowDecimals={false}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="votes"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorVotes)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                            <BarChart3 size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                            <p>No voting activity recorded yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
