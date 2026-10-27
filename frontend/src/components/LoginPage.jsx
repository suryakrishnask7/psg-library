import React, { useState } from 'react';
import {
  BookOpen,
  GraduationCap,
  ShieldCheck,
  User,
  KeyRound,
  ArrowRight,
  Sparkles,
  Building2,
  Mail,
  Hash,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import { authAPI } from '../services/api';

const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Artificial Intelligence & Data Science',
  'Electronics & Comm',
  'Mechanical Eng',
  'Electrical & Electronics',
  'Civil Eng',
  'Management Studies (MBA)',
  'Applied Science & Humanities',
];

export default function LoginPage({ onLoginSuccess, onToast }) {
  const [portal, setPortal] = useState('student'); // 'student' | 'librarian'
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Register form state
  const [regData, setRegData] = useState({
    name: '',
    identifier: '',
    email: '',
    password: '',
    role: 'student',
    department: 'Computer Science',
    phone: '',
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      if (onToast) onToast('Please enter your ID/Roll No and Password', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await authAPI.login({
        identifier: identifier.trim(),
        password,
        portal,
      });

      if (res.data.success) {
        localStorage.setItem('psg_token', res.data.token);
        localStorage.setItem('psg_user', JSON.stringify(res.data.user));
        if (onToast) onToast(`Welcome back, ${res.data.user.name}!`, 'success');
        onLoginSuccess(res.data.user);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials. Please try again.';
      if (onToast) onToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regData.name || !regData.identifier || !regData.email || !regData.password) {
      if (onToast) onToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await authAPI.register(regData);
      if (res.data.success) {
        localStorage.setItem('psg_token', res.data.token);
        localStorage.setItem('psg_user', JSON.stringify(res.data.user));
        if (onToast) onToast(`Account created! Welcome, ${res.data.user.name}!`, 'success');
        onLoginSuccess(res.data.user);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      if (onToast) onToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center items-center px-4 py-12">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 mx-auto mb-3">
          <BookOpen className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          PSG <span className="text-blue-600">Library</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-sm mx-auto">
          PSG College of Technology • Central Digital Library & Circulation System
        </p>
      </div>

      {/* Main Glassmorphic Card */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200/90 shadow-xl overflow-hidden transition-all duration-300">
        {/* Portal Switcher (Google Material 3 Segmented Buttons) */}
        {!isRegister && (
          <div className="p-2 bg-gray-100/80 border-b border-gray-200/70 flex gap-1">
            <button
              type="button"
              onClick={() => {
                setPortal('student');
                setIdentifier('');
                setPassword('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                portal === 'student'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student & Faculty</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPortal('librarian');
                setIdentifier('');
                setPassword('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                portal === 'librarian'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Librarian Portal</span>
            </button>
          </div>
        )}

        <div className="p-6 sm:p-8">
          {/* Header text based on mode */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">
              {isRegister
                ? 'Create Member Account'
                : portal === 'student'
                ? 'Student & Faculty Sign In'
                : 'Librarian Administrative Access'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {isRegister
                ? 'Register to browse stacks and borrow books self-service'
                : portal === 'student'
                ? 'Check book availability & borrow books directly to your account'
                : 'Secure portal for librarians to catalog, manage & issue records'}
            </p>
          </div>

          {/* Form */}
          {!isRegister ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  {portal === 'student' ? 'Roll Number / Staff ID / Email' : 'Librarian ID or Email'}
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={portal === 'student' ? 'e.g. 23MX105 or FAC-CSE-42' : 'e.g. LIB-PSG-01'}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-gray-400" />
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-full text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                <span>{loading ? 'Authenticating...' : `Sign in to ${portal === 'student' ? 'Student Portal' : 'Librarian Desk'}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={regData.name}
                  onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                  placeholder="e.g. Aravind Swaminathan"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">
                    Roll No / Staff ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={regData.identifier}
                    onChange={(e) => setRegData({ ...regData, identifier: e.target.value.toUpperCase() })}
                    placeholder="24CS101"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-mono text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">
                    Role
                  </label>
                  <select
                    value={regData.role}
                    onChange={(e) => setRegData({ ...regData, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty Member</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={regData.department}
                  onChange={(e) => setRegData({ ...regData, department: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">
                    PSG Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={regData.email}
                    onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                    placeholder="student@psgtech.ac.in"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={regData.password}
                    onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                    placeholder="Min 4 characters"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                <span>{loading ? 'Creating...' : 'Register Account'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Toggle between Register & Login */}
          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            {isRegister ? (
              <p className="text-xs text-gray-500">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  className="font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  Sign in here
                </button>
              </p>
            ) : portal === 'student' ? (
              <p className="text-xs text-gray-500">
                New student or faculty?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  className="font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  Register an account
                </button>
              </p>
            ) : (
              <p className="text-xs text-gray-400">
                Authorized PSG College Library Staff Access Only
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

