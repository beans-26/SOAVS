import React, { useState } from 'react';
import axios from 'axios';
import { UserPlus, Mail, Lock, User, Loader2 } from 'lucide-react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('register'); // 'register' or 'verify'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await axios.post('http://localhost:8000/api/accounts/register/', {
        username,
        email,
        password
      });
      
      setStep('verify');
    } catch (err) {
      const errorData = err.response?.data;
      let errorMessage = 'Registration failed. Please try again.';
      if (errorData) {
        if (typeof errorData === 'object') {
          errorMessage = Object.values(errorData).flat().join(' ');
        } else {
          errorMessage = errorData;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await axios.post('http://localhost:8000/api/accounts/verify-otp/', {
        email,
        otp
      });
      
      setSuccess('Account verified successfully! Redirecting to login...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', justifyContent: 'center', width: '100%', padding: '20px' }}>
      <div className="glass-card" style={{ padding: '40px', width: '100%', maxWidth: '450px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ 
            background: 'var(--primary)', 
            width: '60px', 
            height: '60px', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 20px' 
          }}>
            {step === 'register' ? <UserPlus size={32} color="white" /> : <Lock size={32} color="white" />}
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>
            {step === 'register' ? 'Create Account' : 'Verify Email'}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {step === 'register' ? 'Join SOAVS and make your voice heard' : `We've sent a 6-digit code to ${email}`}
          </p>
        </div>

        {success ? (
          <div style={{ 
            background: 'rgba(34, 197, 94, 0.1)', 
            color: '#22c55e', 
            padding: '15px', 
            borderRadius: '12px', 
            textAlign: 'center',
            marginBottom: '20px',
            border: '1px solid rgba(34, 197, 94, 0.2)'
          }}>
            {success}
          </div>
        ) : (
          <>
            {step === 'register' ? (
              <form onSubmit={handleRegister}>
                <div className="input-group">
                  <label><User size={14} style={{ marginRight: '8px' }} /> Username</label>
                  <input 
                    type="text" 
                    placeholder="johndoe" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label><Mail size={14} style={{ marginRight: '8px' }} /> Email Address</label>
                  <input 
                    type="email" 
                    placeholder="name@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label><Lock size={14} style={{ marginRight: '8px' }} /> Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {error && <div className="error-msg">{error}</div>}

                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={loading}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '10px' }}
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign Up'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP}>
                <div className="input-group">
                  <label><Lock size={14} style={{ marginRight: '8px' }} /> Verification Code</label>
                  <input 
                    type="text" 
                    placeholder="123456" 
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '8px' }}
                  />
                </div>

                {error && <div className="error-msg">{error}</div>}

                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={loading}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '10px' }}
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'Verify Account'}
                </button>
                
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <button 
                    type="button" 
                    onClick={() => setStep('register')}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.9rem' }}
                  >
                    Back to registration
                  </button>
                </div>
              </form>
            )}
          </>
        )}


        <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account? <a href="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Login here</a>
        </div>
      </div>
    </div>
  );
};

export default Register;
