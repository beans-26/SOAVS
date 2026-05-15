import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserPlus, Trash2, Award, Briefcase, ArrowLeft, Loader2, Plus } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';

const AdminCandidates = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const initialElectionId = queryParams.get('election');

    const [elections, setElections] = useState([]);
    const [selectedElection, setSelectedElection] = useState(initialElectionId || '');
    const [positions, setPositions] = useState([]);
    const [selectedPosition, setSelectedPosition] = useState('');
    const [candidateName, setCandidateName] = useState('');
    const [platformStatement, setPlatformStatement] = useState('');
    const [courseAndYear, setCourseAndYear] = useState('');
    const [selectedPartylist, setSelectedPartylist] = useState('');
    const [partylists, setPartylists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newPositionName, setNewPositionName] = useState('');
    const [newPositionOrder, setNewPositionOrder] = useState(0);
    const [isAddingPosition, setIsAddingPosition] = useState(false);

    const token = localStorage.getItem('access_token');

    useEffect(() => {
        const fetchElections = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/elections/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setElections(response.data);
            } catch (err) {
                console.error('Failed to fetch elections', err);
            }
        };
        fetchElections();
    }, []);

    useEffect(() => {
        if (selectedElection) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const [posRes, plRes] = await Promise.all([
                        axios.get(`http://localhost:8000/api/positions/?election=${selectedElection}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        }),
                        axios.get(`http://localhost:8000/api/partylists/?election=${selectedElection}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        }),
                    ]);
                    setPositions(posRes.data);
                    setPartylists(plRes.data);
                    if (posRes.data.length > 0) setSelectedPosition(posRes.data[0].id);
                } catch (err) {
                    console.error('Failed to fetch data', err);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        } else {
            setPositions([]);
            setPartylists([]);
            setSelectedPosition('');
        }
    }, [selectedElection]);

    const handleAddPosition = async (e) => {
        e.preventDefault();
        if (!selectedElection) return;
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:8000/api/positions/', {
                election: selectedElection,
                name: newPositionName,
                hierarchy_order: newPositionOrder,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPositions([...positions, response.data]);
            setSelectedPosition(response.data.id);
            setNewPositionName('');
            setNewPositionOrder(0);
            setIsAddingPosition(false);
        } catch (err) {
            alert('Failed to add position');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCandidate = async (e) => {
        e.preventDefault();
        if (!selectedPosition) return;
        setLoading(true);
        try {
            const data = {
                position: selectedPosition,
                name: candidateName,
                platform_statement: platformStatement,
                course_and_year: courseAndYear,
            };
            if (selectedPartylist) data.partylist = selectedPartylist;

            await axios.post('http://localhost:8000/api/candidates/', data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCandidateName('');
            setPlatformStatement('');
            setCourseAndYear('');
            setSelectedPartylist('');
            // Refresh positions to show new candidate
            const response = await axios.get(`http://localhost:8000/api/positions/?election=${selectedElection}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPositions(response.data);
        } catch (err) {
            alert('Failed to add candidate');
        } finally {
            setLoading(false);
        }
    };

    const deleteCandidate = async (id) => {
        if (!window.confirm('Delete this candidate?')) return;
        try {
            await axios.delete(`http://localhost:8000/api/candidates/${id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Refresh
            const response = await axios.get(`http://localhost:8000/api/positions/?election=${selectedElection}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPositions(response.data);
        } catch (err) {
            alert('Failed to delete');
        }
    };

    return (
        <AdminLayout>
            <div className="fade-in" style={{ padding: '40px', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
                    <button
                        onClick={() => navigate('/admin/elections')}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 style={{ fontSize: '2.5rem' }}>Candidate Manager</h1>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
                    {/* Left Column: Selection & Forms */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="glass-card" style={{ padding: '25px' }}>
                            <h3 style={{ marginBottom: '15px' }}>Step 1: Select Election</h3>
                            <div className="input-group">
                                <select
                                    value={selectedElection}
                                    onChange={(e) => setSelectedElection(e.target.value)}
                                    style={{ width: '100%', padding: '12px', background: 'var(--bg-dark)', color: 'white', borderRadius: '12px', border: '1px solid var(--glass-border)' }}
                                >
                                    <option value="">-- Choose Election --</option>
                                    {elections.map(el => <option key={el.id} value={el.id}>{el.title}</option>)}
                                </select>
                            </div>

                            {selectedElection && (
                                <>
                                    <h3 style={{ marginBottom: '15px', marginTop: '20px' }}>Step 2: Position</h3>
                                    {!isAddingPosition ? (
                                        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                                            <select
                                                value={selectedPosition}
                                                onChange={(e) => setSelectedPosition(e.target.value)}
                                                style={{ flex: 1, padding: '12px', background: 'var(--bg-dark)', color: 'white', borderRadius: '12px', border: '1px solid var(--glass-border)' }}
                                            >
                                                <option value="">-- Choose Position --</option>
                                                {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                            <button className="btn-primary" style={{ width: 'auto' }} onClick={() => setIsAddingPosition(true)}><Plus size={18} /></button>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleAddPosition} style={{ marginBottom: '20px' }}>
                                            <div className="input-group">
                                                <input
                                                    placeholder="New Position Name (e.g. President)"
                                                    value={newPositionName}
                                                    onChange={(e) => setNewPositionName(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="input-group">
                                                <label>Order (lower = higher rank)</label>
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    value={newPositionOrder}
                                                    onChange={(e) => setNewPositionOrder(parseInt(e.target.value) || 0)}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button type="submit" className="btn-primary">Add</button>
                                                <button type="button" className="btn-primary" style={{ background: 'var(--text-muted)' }} onClick={() => setIsAddingPosition(false)}>Cancel</button>
                                            </div>
                                        </form>
                                    )}

                                    {selectedPosition && (
                                        <>
                                            <h3 style={{ marginBottom: '15px' }}>Step 3: Add Candidate</h3>
                                            <form onSubmit={handleAddCandidate}>
                                                <div className="input-group">
                                                    <label>Full Name</label>
                                                    <input
                                                        placeholder="Candidate Full Name"
                                                        value={candidateName}
                                                        onChange={(e) => setCandidateName(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="input-group">
                                                    <label>Course & Year</label>
                                                    <input
                                                        placeholder="e.g. BSIT - 3rd Year"
                                                        value={courseAndYear}
                                                        onChange={(e) => setCourseAndYear(e.target.value)}
                                                    />
                                                </div>
                                                <div className="input-group">
                                                    <label>Partylist</label>
                                                    <select
                                                        value={selectedPartylist}
                                                        onChange={(e) => setSelectedPartylist(e.target.value)}
                                                        style={{ width: '100%', padding: '12px', background: 'var(--bg-dark)', color: 'white', borderRadius: '12px', border: '1px solid var(--glass-border)' }}
                                                    >
                                                        <option value="">-- Independent --</option>
                                                        {partylists.map(pl => <option key={pl.id} value={pl.id}>{pl.name}</option>)}
                                                    </select>
                                                </div>
                                                <div className="input-group">
                                                    <label>Platform Statement</label>
                                                    <textarea
                                                        placeholder="Candidate's platform..."
                                                        value={platformStatement}
                                                        onChange={(e) => setPlatformStatement(e.target.value)}
                                                        rows={3}
                                                        style={{
                                                            width: '100%', background: 'rgba(15,23,42,0.5)',
                                                            border: '1px solid var(--glass-border)', borderRadius: '12px',
                                                            padding: '12px 16px', color: 'white', outline: 'none',
                                                            resize: 'vertical', fontFamily: 'inherit', fontSize: '1rem',
                                                        }}
                                                    />
                                                </div>
                                                <button type="submit" className="btn-primary" disabled={loading}>
                                                    {loading ? <Loader2 className="animate-spin" /> : <><UserPlus size={18} style={{ marginRight: '8px' }} /> Add Candidate</>}
                                                </button>
                                            </form>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Display */}
                    <div className="glass-card" style={{ padding: '30px' }}>
                        <h2 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Award color="var(--primary)" /> Candidates List
                        </h2>

                        {!selectedElection ? (
                            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                                <Briefcase size={48} style={{ marginBottom: '15px' }} />
                                <p>Select an election to view candidates</p>
                            </div>
                        ) : loading ? (
                            <div style={{ textAlign: 'center', padding: '60px' }}>
                                <Loader2 className="animate-spin" size={40} />
                            </div>
                        ) : positions.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                                <p>No positions created for this election yet.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                                {positions.map(position => (
                                    <div key={position.id} style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '20px' }}>
                                        <h4 style={{ color: 'var(--primary)', marginBottom: '15px', fontSize: '1.2rem', display: 'flex', justifyContent: 'space-between' }}>
                                            {position.name}
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{position.candidates.length} candidates</span>
                                        </h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '15px' }}>
                                            {position.candidates.map(candidate => (
                                                <div key={candidate.id} className="glass-card" style={{
                                                    padding: '18px', background: 'rgba(255,255,255,0.05)',
                                                    display: 'flex', flexDirection: 'column', gap: '8px',
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontWeight: '600', fontSize: '1rem' }}>{candidate.name}</span>
                                                        <button
                                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                                            onClick={() => deleteCandidate(candidate.id)}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                    {candidate.course_and_year && (
                                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                            {candidate.course_and_year}
                                                        </span>
                                                    )}
                                                    {candidate.partylist_name && (
                                                        <span style={{
                                                            fontSize: '0.75rem', color: '#a5b4fc',
                                                            background: 'rgba(99,102,241,0.1)', padding: '3px 10px',
                                                            borderRadius: '20px', width: 'fit-content',
                                                        }}>
                                                            {candidate.partylist_name}
                                                        </span>
                                                    )}
                                                    {candidate.platform_statement && (
                                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.4' }}>
                                                            {candidate.platform_statement.length > 80
                                                                ? candidate.platform_statement.substring(0, 80) + '...'
                                                                : candidate.platform_statement}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                            {position.candidates.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No candidates yet.</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminCandidates;
