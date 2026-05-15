import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Flag, Plus, Trash2, Edit, ArrowLeft, Loader2, X, Check } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';

const AdminPartylists = () => {
    const [elections, setElections] = useState([]);
    const [selectedElection, setSelectedElection] = useState('');
    const [partylists, setPartylists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState(null);

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

    const fetchPartylists = async (electionId) => {
        if (!electionId) { setPartylists([]); return; }
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8000/api/partylists/?election=${electionId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPartylists(response.data);
        } catch (err) {
            console.error('Failed to fetch partylists', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPartylists(selectedElection);
    }, [selectedElection]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = { election: selectedElection, name, description };
            if (editingId) {
                await axios.put(`http://localhost:8000/api/partylists/${editingId}/`, data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('http://localhost:8000/api/partylists/', data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            resetForm();
            fetchPartylists(selectedElection);
        } catch (err) {
            alert(err.response?.data?.name?.[0] || 'Failed to save partylist');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (partylist) => {
        setEditingId(partylist.id);
        setName(partylist.name);
        setDescription(partylist.description);
        setIsCreating(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this partylist? Candidates linked to it will be unlinked.')) return;
        try {
            await axios.delete(`http://localhost:8000/api/partylists/${id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchPartylists(selectedElection);
        } catch (err) {
            alert('Failed to delete partylist');
        }
    };

    const resetForm = () => {
        setName('');
        setDescription('');
        setIsCreating(false);
        setEditingId(null);
    };

    return (
        <AdminLayout>
            <div className="fade-in" style={{ padding: '40px', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Partylist Management</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Create and manage election partylists</p>
                    </div>
                    {selectedElection && (
                        <button
                            className="btn-primary"
                            style={{ width: 'auto', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
                            onClick={() => isCreating ? resetForm() : setIsCreating(true)}
                        >
                            {isCreating ? <ArrowLeft size={18} /> : <Plus size={18} />}
                            {isCreating ? 'Back' : 'Add Partylist'}
                        </button>
                    )}
                </div>

                {/* Election Selector */}
                <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Select Election
                    </label>
                    <select
                        value={selectedElection}
                        onChange={(e) => { setSelectedElection(e.target.value); resetForm(); }}
                        style={{
                            width: '100%', padding: '12px 16px', background: 'var(--bg-dark)', color: 'white',
                            borderRadius: '12px', border: '1px solid var(--glass-border)', fontSize: '1rem',
                        }}
                    >
                        <option value="">-- Choose Election --</option>
                        {elections.map(el => <option key={el.id} value={el.id}>{el.title}</option>)}
                    </select>
                </div>

                {/* Create / Edit Form */}
                {isCreating && selectedElection && (
                    <div className="glass-card" style={{ padding: '32px', marginBottom: '24px' }}>
                        <h2 style={{ marginBottom: '24px' }}>
                            {editingId ? 'Edit Partylist' : 'New Partylist'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label>Partylist Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Unity Party"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Description (optional)</label>
                                <textarea
                                    placeholder="Brief description of the partylist..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    style={{
                                        width: '100%', background: 'rgba(15, 23, 42, 0.5)',
                                        border: '1px solid var(--glass-border)', borderRadius: '12px',
                                        padding: '12px 16px', color: 'white', outline: 'none', resize: 'vertical',
                                        fontFamily: 'inherit', fontSize: '1rem',
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin" /> : (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                                            <Check size={18} /> {editingId ? 'Update' : 'Create'}
                                        </span>
                                    )}
                                </button>
                                <button type="button" className="btn-primary"
                                    style={{ background: 'rgba(148,163,184,0.15)', color: 'var(--text-muted)' }}
                                    onClick={resetForm}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Partylists List */}
                {selectedElection && !isCreating && (
                    <>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '60px' }}>
                                <Loader2 className="animate-spin" size={40} color="var(--primary)" />
                            </div>
                        ) : partylists.length === 0 ? (
                            <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
                                <Flag size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
                                <h3>No partylists yet</h3>
                                <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Click "Add Partylist" to create one.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                                {partylists.map(pl => (
                                    <div key={pl.id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    width: '36px', height: '36px',
                                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                                    borderRadius: '10px',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    <Flag size={18} color="white" />
                                                </div>
                                                <h3 style={{ fontSize: '1.15rem' }}>{pl.name}</h3>
                                            </div>
                                        </div>
                                        {pl.description && (
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px', flex: 1 }}>
                                                {pl.description}
                                            </p>
                                        )}
                                        <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                                            <button
                                                className="btn-primary"
                                                style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', width: 'auto', padding: '8px 14px' }}
                                                onClick={() => handleEdit(pl)}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className="btn-primary"
                                                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', width: 'auto', padding: '8px 14px' }}
                                                onClick={() => handleDelete(pl.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {!selectedElection && (
                    <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
                        <Flag size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
                        <p style={{ color: 'var(--text-muted)' }}>Select an election above to manage partylists.</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminPartylists;
