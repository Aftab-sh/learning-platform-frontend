import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import config from '../../config/config';

const API_BASE = config.API_BASE;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    if (!t) setTokenValid(false);
    else setToken(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('❌ Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('❌ Password must be at least 6 characters.');
      return;
    }

    setMessage('');
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/users/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });

      // ✅ Safe parsing – JSON or plain text
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (response.ok) {
        setMessage('✅ ' + (data.message || 'Password reset successfully!'));
        setTimeout(() => navigate('/'), 2000);
      } else {
        const errorMsg = data.message || data.error || data || 'Something went wrong.';
        setError('❌ ' + errorMsg);
        if (response.status === 400 && errorMsg.toLowerCase().includes('expired')) {
          setTokenValid(false);
        }
      }
    } catch (err) {
      setError('❌ Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center bg-[#0a0f1a] px-4">
        <div className="w-full max-w-md bg-[#11161f] p-8 rounded-2xl border border-gray-800 text-center shadow-2xl">
          <h1 className="text-2xl text-red-400 font-bold mb-4">❌ Invalid or Expired Link</h1>
          <p className="text-gray-400 mb-6">The password reset link is invalid or has expired.</p>
          <Link to="/forgot-password" className="text-cyan-400 hover:underline">Request a new one</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-[#0a0f1a] px-4">
      <div className="w-full max-w-md bg-[#11161f] p-8 rounded-2xl border border-gray-800 shadow-2xl">
        <h1 className="text-3xl text-center text-[#00e0ff] font-bold mb-2">Reset Password</h1>
        <p className="text-gray-400 text-center text-sm mb-6">Enter your new password below.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="New password"
            className="w-full bg-[#1a202c] text-white px-4 py-3 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={6}
            required
          />
          <p className="text-xs text-gray-500 -mt-2">Minimum 6 characters</p>

          <input
            type="password"
            placeholder="Confirm new password"
            className="w-full bg-[#1a202c] text-white px-4 py-3 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset Password →'}
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