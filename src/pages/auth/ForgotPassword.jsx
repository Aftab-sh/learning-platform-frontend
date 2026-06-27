import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import config from '../../config/config';



const API_BASE = config.API_BASE;

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      // ✅ Body mein email bhejo, query param mein nahi
      const res = await fetch(`${API_BASE}/api/users/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setMessage('✅ If an account exists, a password reset link has been dispatched.');
        setEmail('');
      } else {
        setError(data.message || data.error || 'Failed to request password reset link.');
      }
    } catch (err) {
      setError('Connection to server failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[#0a0f1a] px-4 font-sans">
      <div className="w-full max-w-md bg-[#11161f] p-8 rounded-2xl border border-gray-800 text-center shadow-xl">
        <h1 className="text-2xl font-bold text-[#00e0ff] mb-2">🔒 Forgot Password</h1>
        <p className="text-sm text-gray-400 mb-6">Enter your email address and we'll forward a link to restore access.</p>
        
        <form onSubmit={handleResetRequest} className="flex flex-col gap-5 text-left">
          <div className="w-full flex flex-col items-start">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
            <input 
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com"
              className="w-full bg-[#1a202c] border border-gray-700/80 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00e0ff]"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all cursor-pointer"
          >
            {loading ? 'Sending...' : 'Send Recovery Link →'}
          </button>
        </form>

        {error && <div className="mt-4 p-3 bg-red-950/20 border border-red-900/50 rounded-xl text-[#ff4d6d] text-sm font-semibold">{error}</div>}
        {message && <div className="mt-4 p-3 bg-green-950/20 border border-green-900/50 rounded-xl text-green-400 text-sm font-semibold">{message}</div>}

        <div className="mt-6">
          <Link to="/" className="text-sm text-blue-400 hover:underline font-semibold">
            &larr; Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}