// src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const API_BASE = 'http://localhost:8080';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/users/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const text = await res.text();

      if (res.ok) {
        setMessage('✅ ' + text + ' Please check your inbox.');
        setEmail('');
      } else {
        setError('❌ ' + (text || 'Something went wrong.'));
      }
    } catch (err) {
      setError('❌ Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-[#0a0f1a] px-4">
      <div className="w-full max-w-md bg-[#11161f] p-8 rounded-2xl border border-gray-800 shadow-2xl">
        <h1 className="text-3xl text-center text-[#00e0ff] font-bold mb-2">Forgot Password</h1>
        <p className="text-gray-400 text-center text-sm mb-6">Enter your registered email — we'll send you a reset link.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full bg-[#1a202c] text-white px-4 py-3 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Link →'}
          </button>
        </form>

        {message && <div className="mt-4 text-green-400 text-center bg-green-900/20 p-3 rounded-xl">{message}</div>}
        {error && <div className="mt-4 text-red-400 text-center bg-red-900/20 p-3 rounded-xl">{error}</div>}

        <Link to="/" className="block text-center text-cyan-400 hover:underline mt-4 text-sm">
          ← Back to Login
        </Link>
      </div>
    </div>
  );
}