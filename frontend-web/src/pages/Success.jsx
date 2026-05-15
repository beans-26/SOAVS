import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleCheck, ArrowLeft, Download, Info } from 'lucide-react';
import VoterLayout from '../components/VoterLayout';

const Success = () => {
    const navigate = useNavigate();
    const [receipt, setReceipt] = useState([]);
    const [voterName, setVoterName] = useState('');

    useEffect(() => {
        const receiptStr = localStorage.getItem('vote_receipt');
        if (receiptStr) {
            setReceipt(JSON.parse(receiptStr));
        }
        
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setVoterName(JSON.parse(userStr).username);
        }
    }, []);

    return (
        <VoterLayout voterName={voterName}>
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingBottom: '40px' }}>
                <div style={{ position: 'relative', marginBottom: '40px' }}>
                    <div style={{
                        position: 'absolute',
                        top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '180px', height: '180px',
                        background: 'rgba(34, 197, 94, 0.1)',
                        borderRadius: '50%',
                        zIndex: -1
                    }}></div>
                    <CircleCheck size={120} color="var(--success)" strokeWidth={1.5} />
                </div>

                <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '15px' }}>Vote Cast Successfully!</h2>
                <p style={{ color: 'var(--text-muted)', maxWidth: '600px', lineHeight: '1.6', fontSize: '1.1rem', marginBottom: '40px' }}>
                    Your ballot has been securely encrypted and recorded in the system. Thank you for participating in the democratic process.
                </p>

                {receipt.length > 0 ? (
                    <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '30px', textAlign: 'left', marginBottom: '40px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div>
                                <h3 style={{ color: 'var(--success)', fontWeight: '700', fontSize: '1.1rem' }}>Vote Receipt</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Transaction confirmed on digital ballot</p>
                            </div>
                            <Info size={20} color="var(--text-muted)" />
                        </div>

                        <div style={{ display: 'grid', gap: '15px' }}>
                            {receipt.map((item, index) => (
                                <div key={index} style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <h4 style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        {item.position}
                                    </h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {item.candidates.map((cand, cIdx) => (
                                            <span key={cIdx} style={{ fontSize: '1rem', fontWeight: '500' }}>
                                                • {cand}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <p style={{ marginTop: '20px', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
                            This receipt is for your personal records.
                        </p>
                    </div>
                ) : (
                    <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '30px', marginBottom: '40px' }}>
                         <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '10px' }}>What's Next?</h3>
                         <p style={{ color: 'var(--text-muted)', lineHeight: '1.5' }}>
                            You have now been marked as "Voted" for this election. You can view the results once the administrator concludes the voting period.
                         </p>
                    </div>
                )}

                <button 
                    className="btn-primary" 
                    onClick={() => navigate('/voter/dashboard')}
                    style={{ 
                        width: 'auto', 
                        padding: '0 30px', 
                        height: '56px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--glass-border)'
                    }}
                >
                    <ArrowLeft size={20} /> Return to Dashboard
                </button>
            </div>
        </VoterLayout>
    );
};

export default Success;
