import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../features/auth/LoginForm';
import { APP_NAME } from '../lib/constants';
import { HiOutlineChartBar, HiOutlineLightningBolt, HiOutlineShieldCheck } from 'react-icons/hi';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  // If already logged in, go to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (email, password) => {
    try {
      setError('');
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(message);
      throw err; // Re-throw so the form knows submission failed
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Left panel — branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-900 relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-indigo-300/10 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold">₹</span>
            </div>
            <span className="text-2xl font-bold">{APP_NAME}</span>
          </div>

          {/* Tagline */}
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Track it.
            <br />
            Understand it.
            <br />
            <span className="text-primary-200">Improve it.</span>
          </h1>

          <p className="text-primary-100 text-lg mb-10 max-w-md">
            Your personal finance companion designed for students.
            Build better money habits, one transaction at a time.
          </p>

          {/* Feature pills */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-primary-100">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <HiOutlineChartBar className="h-5 w-5" />
              </div>
              <span>Smart analytics & spending insights</span>
            </div>
            <div className="flex items-center gap-3 text-primary-100">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <HiOutlineLightningBolt className="h-5 w-5" />
              </div>
              <span>Earn XP & level up your finances</span>
            </div>
            <div className="flex items-center gap-3 text-primary-100">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <HiOutlineShieldCheck className="h-5 w-5" />
              </div>
              <span>Secure & private — your data, your control</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-11 h-11 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">₹</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">{APP_NAME}</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back 👋
            </h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Sign in to continue managing your finances.
            </p>
          </div>

          {/* Form */}
          <LoginForm onSubmit={handleLogin} error={error} clearError={() => setError('')} />

          {/* Back to home */}
          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              ← Back to home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
