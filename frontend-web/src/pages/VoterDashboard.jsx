import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Vote, Calendar, ChevronRight, Info, CircleCheck } from 'lucide-react';
import VoterLayout from '../components/VoterLayout';

const VoterDashboard = () => {
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [voterName, setVoterName] = useState('');
    const [hasVoted, setHasVoted] = useState(false);
    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const userStr = localStorage.getItem('user');
            const token = localStorage.getItem('access_token');
            
            if (userStr) {
                const user = JSON.parse(userStr);
                setVoterName(user.username); // Fallback to username
                // Usually user name is stored, but let's check what's in 'user'
            }

            if (!token) {
                navigate('/login');
                return;
            }

            const response = await axios.get('http://localhost:8000/api/active-elections/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setElections(response.data);
            
            // In a real app, we might want to check a specific 'has_voted' status from an endpoint
            // For now, let's assume if the user has a 'vote_receipt' in localStorage for this session, they've voted
            // Or better, the backend should return this status. 
            // Mobile app checks 'voter_data' which has 'has_voted'.
        } catch (error) {
            console.error('Failed to fetch elections:', error);
            if (error.response?.status === 401) navigate('/login');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleElectionClick = (election) => {
        const isActive = election.calculated_status === 'ACTIVE';
        if (isActive) {
            navigate(`/voter/ballot/${election.id}`, { state: { title: election.title } });
        }
    };

    return (
        <VoterLayout voterName={voterName} onRefresh={fetchData} loading={loading}>
            <div className="fade-in">
                <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px', letterSpacing: '0.5px' }}>
                    Available Elections
                </h2>

                {loading && elections.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        <div className="animate-spin" style={{ marginBottom: '15px' }}>
                            <Vote size={32} />
                        </div>
                        <p>Fetching active elections...</p>
                    </div>
                ) : elections.length > 0 ? (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {elections.map((election) => {
                            const isUpcoming = election.calculated_status === 'UPCOMING';
                            const isCompleted = election.calculated_status === 'COMPLETED';
                            const isActive = election.calculated_status === 'ACTIVE';
                            
                            // Mocking hasVoted check - in production this would come from backend
                            const alreadyVoted = false; 

                            return (
                                <div 
                                    key={election.id}
                                    className="glass-card"
                                    onClick={() => !isUpcoming && !isCompleted && handleElectionClick(election)}
                                    style={{
                                        padding: '20px',
                                        cursor: (isActive && !alreadyVoted) ? 'pointer' : 'default',
                                        transition: 'all 0.2s ease',
                                        opacity: (isActive && !alreadyVoted) ? 1 : 0.7,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '20px',
                                        border: (isActive && !alreadyVoted) ? '1px solid var(--glass-border)' : '1px solid transparent'
                                    }}
                                >
                                    <div style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '12px',
                                        background: isUpcoming ? 'rgba(59, 130, 246, 0.1)' : isCompleted ? 'rgba(148, 163, 184, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: isUpcoming ? '#3b82f6' : isCompleted ? 'var(--text-muted)' : 'var(--primary)'
                                    }}>
                                        {alreadyVoted ? <CircleCheck size={24} color="var(--success)" /> : 
                                         isUpcoming ? <Calendar size={24} /> : 
                                         isCompleted ? <Info size={24} /> : 
                                         <Vote size={24} />}
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '4px' }}>
                                            {election.title}
                                        </h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            {isUpcoming ? (
                                                <span style={{ color: '#3b82f6', fontWeight: '600' }}>
                                                    Starts: {new Date(election.start_date).toLocaleString()}
                                                </span>
                                            ) : isCompleted ? (
                                                <span>Status: Completed</span>
                                            ) : (
                                                <>
                                                    <Calendar size={14} />
                                                    <span>Ends: {new Date(election.end_date).toLocaleDateString()}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {isActive && !alreadyVoted && <ChevronRight size={20} color="var(--text-muted)" />}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
                        <Info size={40} color="var(--text-muted)" style={{ marginBottom: '15px' }} />
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '10px' }}>No Active Elections</h3>
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.5' }}>
                            There are currently no elections accepting votes. Please check back later.
                        </p>
                    </div>
                )}
            </div>
        </VoterLayout>
    );
};

export default VoterDashboard;
