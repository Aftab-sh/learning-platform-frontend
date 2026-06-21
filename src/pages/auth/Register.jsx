// src/pages/auth/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          role: 'STUDENT'
        })
      });

      // ✅ Always try to parse JSON, even on error
      let data = {};
      try {
        data = await res.json();
      } catch {
        data = { message: await res.text() };
      }

      if (res.ok) {
        setSuccess('✅ Account created successfully! Please check your email to verify.');
        setName('');
        setEmail('');
        setPassword('');
        setTimeout(() => navigate('/'), 3000);
      } else {
        // ✅ Extract meaningful error message
        let errorMsg = data.message || 'Registration failed.';
        // If backend returns "Full authentication required", it means endpoint is not public
        if (errorMsg.toLowerCase().includes('full authentication')) {
          errorMsg = 'Registration endpoint is not accessible. Please contact admin.';
        }
        setError('❌ ' + errorMsg);
      }
    } catch (err) {
      setError('❌ Unable to connect to server. Is backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-[#0a0f1a] px-4">
      <div className="w-full max-w-md bg-[#11161f] p-8 rounded-2xl border border-gray-800 shadow-2xl">
        <h1 className="text-4xl text-center text-[#00e0ff] font-bold mb-8">&lt;CodeLearn/&gt;</h1>

        <div className="flex border-b border-gray-700 mb-6">
          <Link to="/" className="flex-1 text-center pb-3 text-gray-400 hover:text-white">
            Sign In
          </Link>
          <button className="flex-1 text-center pb-3 border-b-2 border-cyan-400 text-cyan-400 font-bold">
            Create Account
          </button>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <input
            type="text"
            placeholder="Full name"
            className="w-full bg-[#1a202c] text-white px-4 py-3 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full bg-[#1a202c] text-white px-4 py-3 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password (min 6)"
            className="w-full bg-[#1a202c] text-white px-4 py-3 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Account →'}
          </button>
        </form>

        {error && <div className="mt-4 text-red-400 text-center bg-red-900/20 p-3 rounded-xl">{error}</div>}
        {success && <div className="mt-4 text-green-400 text-center bg-green-900/20 p-3 rounded-xl">{success}</div>}
      </div>
    </div>
  );
}