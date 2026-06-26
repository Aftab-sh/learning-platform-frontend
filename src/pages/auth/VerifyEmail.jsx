// src/pages/auth/VerifyEmail.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const API_BASE = 'http://localhost:8080';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState({ type: 'loading', msg: 'Verifying your email...' });
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus({ type: 'error', msg: '❌ Invalid verification link. No token found.' });
      return;
    }

    const doVerification = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/verify-email?token=${token}`);
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setStatus({ type: 'success', msg: data.message || '✅ Email verified successfully!' });
        } else {
          setStatus({ type: 'error', msg: data.error || 'Verification failed.' });
        }
      } catch (err) {
        setStatus({ type: 'error', msg: 'Error connecting to server.' });
      }
    };
    doVerification();
  }, [token]);

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[#0a0f1a] px-4 font-sans">
      <div className="w-full max-w-md bg-[#11161f] p-8 rounded-2xl border border-gray-800 text-center shadow-xl">
        <h1 className="text-2xl font-bold text-[#00e0ff] mb-4">🔐 Email Verification</h1>
        <div className={`text-base my-6 font-semibold ${
          status.type === 'loading' ? 'text-amber-400' : status.type === 'success' ? 'text-green-400' : 'text-[#ff4d6d]'
        }`}>
          {status.msg}
        </div>
        <Link to="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition">
          {status.type === 'success' ? 'Login Now' : 'Go to Login'}
        </Link>
      </div>
    </div>
  );
}