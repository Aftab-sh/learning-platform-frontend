// src/pages/auth/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import config from '../../config/config';
const API_BASE = config.API_BASE;

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showResend, setShowResend] = useState(false);
  const [resendStatus, setResendStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setShowResend(false);
    setResendStatus('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message = data.message || 'Invalid email or password';
        setError(message);
        if (message.toLowerCase().includes('verify')) {
          setShowResend(true);
        }
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem(
        'user',
        JSON.stringify({
          id: data.id,
          email: data.email,
          role: data.role,
          name: data.name || data.email,
        })
      );

      const role = (data.role || '').toUpperCase();
      navigate(role === 'TEACHER' ? '/teacher-dashboard' : '/student-dashboard');
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    if (!email) {
      setResendStatus('Enter your email above first.');
      return;
    }
    setResendStatus('Sending...');
    try {
      const res = await fetch(
        `${API_BASE}/api/auth/resend-verification?email=${encodeURIComponent(email)}`,
        { method: 'POST' }
      );
      const data = await res.json().catch(() => ({}));
      setResendStatus(data.message || (res.ok ? 'Verification email sent.' : 'Failed to resend.'));
    } catch {
      setResendStatus('Unable to connect to server.');
    }
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-[#0a0f1a] px-4">
      <div className="w-full max-w-md bg-[#11161f] p-8 rounded-2xl border border-gray-800 shadow-2xl">
        <h1 className="text-4xl text-center text-[#00e0ff] font-bold mb-8">Learning Platform</h1>

        <form onSubmit={handleLogin} className="space-y-5" noValidate>
          <input
            type="email"
            placeholder="Email"
            className="w-full bg-[#1a202c] text-white px-4 py-3 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-[#1a202c] text-white px-4 py-3 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In →'
            )}
          </button>

          <div className="text-center">
            <Link to="/forgot-password" className="text-gray-400 hover:text-cyan-400 text-sm transition-colors">
              Forgot Password?
            </Link>
          </div>

          <div className="text-center text-gray-400 text-sm">
            New here?{' '}
            <Link to="/register" className="text-blue-400 font-bold hover:text-blue-300 transition-colors">
              Create Account
            </Link>
          </div>

          {error && (
            <div className="text-red-400 text-center bg-red-900/20 border border-red-900/40 p-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          {showResend && (
            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={resendVerification}
                className="text-yellow-400 underline text-sm hover:text-yellow-300 transition-colors"
              >
                Resend Verification Email
              </button>
              {resendStatus && (
                <p className="text-xs text-gray-400">{resendStatus}</p>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}