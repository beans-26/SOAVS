import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Plus, Trash2, ListChecks, ArrowLeft, Loader2, Edit, BarChart3, Printer, X, Trophy } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';

const ResultsModal = ({ election, onClose }) => {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('access_token');

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/elections/${election.id}/results/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setResults(response.data);
            } catch (err) {
                console.error('Failed to fetch results', err);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [election.id]);

    const handlePrint = () => {
        const printContent = document.getElementById('results-print-area');
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Election Results - ${results?.election?.title || ''}</title>
                <style>
                    body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1e293b; }
                    h1 { text-align: center; margin-bottom: 8px; font-size: 24px; }
                    .subtitle { text-align: center; color: #64748b; margin-bottom: 32px; font-size: 14px; }
                    .position-block { margin-bottom: 28px; }
                    .position-title { font-size: 16px; font-weight: 700; border-bottom: 2px solid #6366f1; padding-bottom: 6px; margin-bottom: 12px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
                    th, td { padding: 10px 16px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
                    th { background: #f1f5f9; font-weight: 600; color: #475569; }
                    .winner { background: #f0fdf4; }
                    .winner-badge { color: #16a34a; font-weight: 700; }
                    .total { text-align: right; font-size: 13px; color: #64748b; margin-top: 8px; }
                    @media print { body { padding: 20px; } }
                </style>
            </head>
            <body>
                <h1>${results?.election?.title || 'Election'} - Official Results</h1>
                <p class="subtitle">Total Voters: ${results?.total_voters || 0} | Status: ${results?.election?.status || ''}</p>
                ${printContent.innerHTML}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 250);
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px',
        }} onClick={onClose}>
            <div className="glass-card" style={{
                maxWidth: '900px', width: '100%', maxHeight: '90vh', overflow: 'auto',
                padding: '36px', position: 'relative',
            }} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>
                            <BarChart3 size={24} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
                            Election Results
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{election.title}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {results && (
                            <button className="btn-primary" style={{
                                width: 'auto', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px',
                                background: 'rgba(34,197,94,0.15)', color: '#22c55e',
                            }} onClick={handlePrint}>
                                <Printer size={18} /> Print
                            </button>
                        )}
                        <button onClick={onClose} style={{
                            background: 'rgba(148,163,184,0.1)', border: '1px solid rgba(148,163,184,0.2)',
                            borderRadius: '12px', padding: '10px', cursor: 'pointer', color: 'var(--text-muted)',
                        }}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px' }}>
                        <Loader2 className="animate-spin" size={40} color="var(--primary)" />
                    </div>
                ) : results ? (
                    <>
                        {/* Stats Bar */}
                        <div style={{
                            display: 'flex', gap: '20px', marginBottom: '28px', padding: '16px 20px',
                            background: 'rgba(99,102,241,0.08)', borderRadius: '14px', border: '1px solid rgba(99,102,241,0.15)',
                        }}>
                            <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Status</span>
                                <div style={{ fontWeight: '600' }}>{results.election.status}</div></div>
                            <div style={{ borderLeft: '1px solid rgba(148,163,184,0.2)', paddingLeft: '20px' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Total Voters</span>
                                <div style={{ fontWeight: '600' }}>{results.total_voters}</div></div>
                        </div>

                        {/* Results Content */}
                        <div id="results-print-area">
                            {results.results.map(position => {
                                const maxVotes = position.candidates.length > 0 ? position.candidates[0].votes : 0;
                                return (
                                    <div key={position.position_id} style={{ marginBottom: '28px' }}>
                                        <h3 style={{
                                            fontSize: '1.1rem', marginBottom: '14px', paddingBottom: '8px',
                                            borderBottom: '2px solid var(--primary)',
                                        }}>
                                            {position.position_name}
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {position.candidates.map((candidate, idx) => {
                                                const isWinner = candidate.votes > 0 && candidate.votes === maxVotes && idx < position.max_votes_allowed;
                                                const barWidth = maxVotes > 0 ? (candidate.votes / maxVotes) * 100 : 0;
                                                return (
                                                    <div key={candidate.id} style={{
                                                        padding: '14px 18px', borderRadius: '12px',
                                                        background: isWinner ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.03)',
                                                        border: isWinner ? '1px solid rgba(34,197,94,0.25)' : '1px solid rgba(148,163,184,0.08)',
                                                    }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                {isWinner && <Trophy size={18} color="#22c55e" />}
                                                                <span style={{ fontWeight: '600' }}>{candidate.name}</span>
                                                                {candidate.partylist && (
                                                                    <span style={{
                                                                        fontSize: '0.7rem', color: '#a5b4fc',
                                                                        background: 'rgba(99,102,241,0.1)', padding: '2px 8px',
                                                                        borderRadius: '10px',
                                                                    }}>
                                                                        {candidate.partylist}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span style={{
                                                                fontWeight: '700', fontSize: '1.1rem',
                                                                color: isWinner ? '#22c55e' : 'var(--text-main)',
                                                            }}>
                                                                {candidate.votes}
                                                            </span>
                                                        </div>
                                                        {/* Vote bar */}
                                                        <div style={{
                                                            height: '6px', borderRadius: '3px',
                                                            background: 'rgba(148,163,184,0.1)', overflow: 'hidden',
                                                        }}>
                                                            <div style={{
                                                                height: '100%', borderRadius: '3px',
                                                                width: `${barWidth}%`,
                                                                background: isWinner
                                                                    ? 'linear-gradient(90deg, #22c55e, #10b981)'
                                                                    : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                                                                transition: 'width 0.6s ease',
                                                            }} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {position.candidates.length === 0 && (
                                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No candidates.</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <p style={{ color: 'var(--text-muted)' }}>Failed to load results.</p>
                )}
            </div>
        </div>
    );
};

const AdminElections = () => {
    const navigate = useNavigate();
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [editingElection, setEditingElection] = useState(null);
    const [error, setError] = useState('');
    const [resultsElection, setResultsElection] = useState(null);

    const token = localStorage.getItem('access_token');

    const fetchElections = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/elections/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setElections(response.data);
        } catch (err) {
            console.error('Failed to fetch elections', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchElections();

        // Auto-refresh every 10 seconds to update statuses automatically
        const interval = setInterval(fetchElections, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleCreateElection = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = {
                title,
                start_date: startDate,
                end_date: endDate,
                status: editingElection ? editingElection.status : 'DRAFT'
            };

            if (editingElection) {
                await axios.put(`http://localhost:8000/api/elections/${editingElection.id}/`, data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('http://localhost:8000/api/elections/', data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            setTitle('');
            setStartDate('');
            setEndDate('');
            setIsCreating(false);
            setEditingElection(null);
            fetchElections();
        } catch (err) {
            setError(`Failed to ${editingElection ? 'update' : 'create'} election. Ensure dates are valid.`);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (election) => {
        setEditingElection(election);
        setTitle(election.title);

        // Format dates for datetime-local input
        const formatDate = (dateString) => {
            const date = new Date(dateString);
            const pad = (n) => n < 10 ? '0' + n : n;
            return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
        };

        setStartDate(formatDate(election.start_date));
        setEndDate(formatDate(election.end_date));
        setIsCreating(true);
    };

    const handleCancel = () => {
        setIsCreating(false);
        setEditingElection(null);
        setTitle('');
        setStartDate('');
        setEndDate('');
        setError('');
    };

    const deleteElection = async (id) => {
        if (!window.confirm('Are you sure you want to delete this election?')) return;
        try {
            await axios.delete(`http://localhost:8000/api/elections/${id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchElections();
        } catch (err) {
            alert('Failed to delete election');
        }
    };

    const publishElection = async (id) => {
        if (!window.confirm('Once published, this election will automatically open and close based on the scheduled dates. Proceed?')) return;
        try {
            await axios.patch(`http://localhost:8000/api/elections/${id}/`, {
                status: 'ACTIVE'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchElections();
        } catch (err) {
            alert('Failed to publish election');
        }
    };

    return (
        <AdminLayout>
            <div className="fade-in" style={{ padding: '40px', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Election Management</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Create and manage school elections</p>
                    </div>
                    <button
                        className="btn-primary"
                        style={{ width: 'auto', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
                        onClick={() => isCreating ? handleCancel() : setIsCreating(true)}
                    >
                        {isCreating ? <ArrowLeft size={18} /> : <Plus size={18} />}
                        {isCreating ? 'Back to List' : 'Create New Election'}
                    </button>
                </div>

                {isCreating ? (
                    <div className="glass-card" style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
                        <h2 style={{ marginBottom: '25px', textAlign: 'center' }}>
                            {editingElection ? 'Edit Election' : 'New Election'}
                        </h2>
                        <form onSubmit={handleCreateElection}>
                            <div className="input-group">
                                <label>Election Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. SSG General Election 2024"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="input-group">
                                    <label><Calendar size={14} style={{ marginRight: '8px' }} /> Start Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label><Clock size={14} style={{ marginRight: '8px' }} /> End Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            {error && <div className="error-msg" style={{ marginBottom: '15px' }}>{error}</div>}
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" /> : (editingElection ? 'Update Election' : 'Create Election')}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
                        {loading ? (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>
                                <Loader2 className="animate-spin" size={40} color="var(--primary)" />
                            </div>
                        ) : elections.length === 0 ? (
                            <div className="glass-card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px' }}>
                                <ListChecks size={48} color="var(--text-muted)" style={{ marginBottom: '20px' }} />
                                <h3>No elections found</h3>
                                <p style={{ color: 'var(--text-muted)' }}>Click the button above to create your first election.</p>
                            </div>
                        ) : (
                            elections.map((election) => (
                                <div key={election.id} className="glass-card" style={{ padding: '25px', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                        <h3 style={{ fontSize: '1.25rem' }}>{election.title}</h3>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            background: election.calculated_status === 'ACTIVE'
                                                ? 'var(--success)'
                                                : election.calculated_status === 'UPCOMING'
                                                    ? 'rgba(59, 130, 246, 0.2)'
                                                    : election.calculated_status === 'COMPLETED'
                                                        ? 'rgba(239, 68, 68, 0.2)'
                                                        : 'rgba(148, 163, 184, 0.2)',
                                            color: election.calculated_status === 'ACTIVE' ? '#fff' : 'inherit',
                                            fontWeight: '600'
                                        }}>
                                            {election.calculated_status}
                                        </span>
                                    </div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                            <Calendar size={14} />
                                            <span style={{ fontWeight: '500', color: 'var(--text)' }}>Starts:</span>
                                            {new Date(election.start_date).toLocaleString()}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Clock size={14} />
                                            <span style={{ fontWeight: '500', color: 'var(--text)' }}>Ends:</span>
                                            {new Date(election.end_date).toLocaleString()}
                                        </div>
                                    </div>
                                    <div style={{ marginTop: 'auto', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                        <button
                                            className="btn-primary"
                                            style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', width: 'auto', padding: '8px' }}
                                            onClick={() => handleEditClick(election)}
                                            title="Edit Election"
                                        >
                                            <Edit size={18} />
                                        </button>

                                        <button
                                            className="btn-primary"
                                            style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', width: 'auto', padding: '8px' }}
                                            onClick={() => deleteElection(election.id)}
                                            title="Delete Election"
                                        >
                                            <Trash2 size={18} />
                                        </button>

                                        <button
                                            className="btn-primary"
                                            style={{ background: 'rgba(168,85,247,0.1)', color: '#a855f7', width: 'auto', padding: '8px 16px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                                            onClick={() => setResultsElection(election)}
                                            title="View Results"
                                        >
                                            <BarChart3 size={16} /> Results
                                        </button>

                                        {election.status === 'DRAFT' && (
                                            <button
                                                className="btn-primary"
                                                style={{ background: 'var(--success)', width: 'auto', padding: '8px 16px', fontSize: '0.9rem' }}
                                                onClick={() => publishElection(election.id)}
                                            >
                                                Publish
                                            </button>
                                        )}

                                        <button
                                            className="btn-primary"
                                            style={{ textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}
                                            onClick={() => navigate(`/admin/candidates?election=${election.id}`)}
                                        >
                                            Manage Candidates
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Results Modal */}
            {resultsElection && (
                <ResultsModal
                    election={resultsElection}
                    onClose={() => setResultsElection(null)}
                />
            )}
        </AdminLayout>
    );
};

export default AdminElections;
