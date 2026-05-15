import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { CircleCheck, Circle, Send, ArrowLeft, Info, Loader2 } from 'lucide-react';
import VoterLayout from '../components/VoterLayout';

const Ballot = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const electionTitle = location.state?.title || 'Election Ballot';

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [positions, setPositions] = useState([]);
    const [selections, setSelections] = useState({});
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBallot = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const response = await axios.get(`http://localhost:8000/api/active-elections/${id}/ballot/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPositions(response.data);
            } catch (err) {
                console.error('Failed to fetch ballot:', err);
                setError('Unable to load ballot details.');
            } finally {
                setLoading(false);
            }
        };
        fetchBallot();
    }, [id]);

    const toggleSelection = (positionId, candidateId, maxAllowed) => {
        const currentSelected = selections[positionId] || [];
        const limit = Number(maxAllowed);

        if (currentSelected.includes(candidateId)) {
            setSelections({
                ...selections,
                [positionId]: currentSelected.filter(cid => cid !== candidateId)
            });
        } else {
            if (limit === 1) {
                setSelections({
                    ...selections,
                    [positionId]: [candidateId]
                });
            } else if (limit <= 0 || currentSelected.length < limit) {
                setSelections({
                    ...selections,
                    [positionId]: [...currentSelected, candidateId]
                });
            } else {
                alert(`You can only select up to ${limit} candidates for this position.`);
            }
        }
    };

    const handleSubmit = () => {
        const selectedCandidateIds = Object.values(selections).flat();
        if (selectedCandidateIds.length === 0) {
            alert('Please select at least one candidate before submitting.');
            return;
        }
        setShowConfirmModal(true);
    };

    const processSubmission = async () => {
        setSubmitting(true);
        setError('');
        try {
            const token = localStorage.getItem('access_token');
            const selectedCandidateIds = Object.values(selections).flat();
            
            await axios.post('http://localhost:8000/api/voter/submit-vote/', {
                election_id: id,
                selections: selectedCandidateIds,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Generate receipt for success page
            const receiptData = positions.map(p => {
                const selectedIds = selections[p.id] || [];
                const selectedCands = p.candidates.filter(c => selectedIds.includes(c.id));
                return {
                    position: p.name,
                    candidates: selectedCands.map(c => c.name)
                };
            }).filter(item => item.candidates.length > 0);

            localStorage.setItem('vote_receipt', JSON.stringify(receiptData));
            navigate('/voter/success');
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to submit ballot.';
            setError(msg);
            setShowConfirmModal(false);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <VoterLayout>
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <Loader2 className="animate-spin" size={48} color="var(--primary)" style={{ margin: '0 auto 20px' }} />
                    <p style={{ color: 'var(--text-muted)' }}>Preparing digital ballot...</p>
                </div>
            </VoterLayout>
        );
    }

    return (
        <VoterLayout voterName={localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).username : 'Voter'}>
            <div className="fade-in">
                <div style={{ marginBottom: '30px' }}>
                    <button 
                        onClick={() => navigate('/voter/dashboard')}
                        style={{ 
                            background: 'transparent', 
                            border: 'none', 
                            color: 'var(--text-muted)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            cursor: 'pointer',
                            marginBottom: '15px',
                            padding: '0'
                        }}
                    >
                        <ArrowLeft size={16} /> Back to Dashboard
                    </button>
                    <span style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '2px', display: 'block', marginBottom: '5px' }}>
                        ELECTION BALLOT
                    </span>
                    <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '15px' }}>{electionTitle}</h2>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px', 
                        background: 'rgba(34, 197, 94, 0.1)', 
                        padding: '12px 16px', 
                        borderRadius: '12px',
                        color: 'var(--success)',
                        fontSize: '0.9rem'
                    }}>
                        <Info size={18} />
                        <span>Select your preferred candidates for each position.</span>
                    </div>
                </div>

                {error && (
                    <div className="glass-card" style={{ padding: '15px', marginBottom: '25px', borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)', color: '#f87171', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                {positions.map((position) => (
                    <div key={position.id} style={{ marginBottom: '40px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '15px' }}>
                            <h3 style={{ fontSize: '1.3rem', fontWeight: '700' }}>{position.name}</h3>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                {position.max_votes_allowed <= 0 
                                    ? 'Select as many as you want'
                                    : position.max_votes_allowed > 1 
                                        ? `Select up to ${position.max_votes_allowed}` 
                                        : 'Select 1 candidate'}
                            </span>
                        </div>

                        <div style={{ display: 'grid', gap: '12px' }}>
                            {position.candidates.map((candidate) => {
                                const isSelected = (selections[position.id] || []).includes(candidate.id);
                                return (
                                    <div 
                                        key={candidate.id}
                                        className="glass-card"
                                        onClick={() => toggleSelection(position.id, candidate.id, position.max_votes_allowed)}
                                        style={{
                                            padding: '16px 20px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            borderColor: isSelected ? 'var(--success)' : 'var(--glass-border)',
                                            background: isSelected ? 'rgba(34, 197, 94, 0.05)' : 'var(--glass-bg)'
                                        }}
                                    >
                                        <div>
                                            <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '2px' }}>{candidate.name}</h4>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                {candidate.partylist_name || 'Independent'}
                                            </p>
                                        </div>
                                        {isSelected ? (
                                            <CircleCheck size={28} color="var(--success)" />
                                        ) : (
                                            <Circle size={28} color="var(--glass-border)" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                <button 
                    className="btn-primary" 
                    onClick={handleSubmit}
                    style={{ 
                        height: '64px', 
                        fontSize: '1.2rem', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '12px',
                        marginTop: '20px',
                        background: 'var(--success)'
                    }}
                >
                    Cast Final Ballot <Send size={20} />
                </button>

                {/* Confirmation Modal */}
                {showConfirmModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(2, 6, 23, 0.85)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '20px'
                    }}>
                        <div className="glass-card fade-in" style={{ maxWidth: '450px', width: '100%', padding: '30px', textAlign: 'center' }}>
                            <div style={{ 
                                width: '64px', height: '64px', 
                                background: 'rgba(99, 102, 241, 0.1)', 
                                borderRadius: '20px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                margin: '0 auto 20px',
                                color: 'var(--primary)'
                            }}>
                                <Info size={32} />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '15px' }}>Confirm Your Vote</h3>
                            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '30px' }}>
                                Are you sure you want to cast your final ballot? This action is permanent and cannot be reversed.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <button 
                                    onClick={() => setShowConfirmModal(false)}
                                    style={{
                                        padding: '12px',
                                        borderRadius: '12px',
                                        border: '1px solid var(--glass-border)',
                                        background: 'transparent',
                                        color: 'white',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={processSubmission}
                                    disabled={submitting}
                                    style={{
                                        padding: '12px',
                                        borderRadius: '12px',
                                        border: 'none',
                                        background: 'var(--success)',
                                        color: 'white',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Submit Vote'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </VoterLayout>
    );
};

export default Ballot;
