import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RegisterForm from '../features/auth/RegisterForm';
import { APP_NAME } from '../lib/constants';
import { HiOutlineTrendingUp, HiOutlineBadgeCheck, HiOutlineSparkles } from 'react-icons/hi';

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  // If already logged in, go to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleRegister = async (fullName, email, password, confirmPassword) => {
    try {
      setError('');
      await register(fullName, email, password, confirmPassword);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(message);
      throw err;
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Left panel — branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900 via-primary-700 to-primary-600 relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-32 right-16 w-64 h-64 bg-primary-300/10 rounded-full blur-3xl" />
          <div className="absolute top-2/3 left-1/2 w-40 h-40 bg-indigo-400/10 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold">₹</span>
            </div>
            <span className="text-2xl font-bold">{APP_NAME}</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Build better
            <br />
            <span className="text-primary-200">money habits.</span>
          </h1>

          <p className="text-primary-100 text-lg mb-10 max-w-md">
            Join thousands of students taking control of their finances.
            Track spending, set budgets, and watch your savings grow.
          </p>

          {/* Benefits */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-primary-100">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <HiOutlineTrendingUp className="h-5 w-5" />
              </div>
              <span>Track every rupee — income & expenses</span>
            </div>
            <div className="flex items-center gap-3 text-primary-100">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <HiOutlineBadgeCheck className="h-5 w-5" />
              </div>
              <span>Unlock achievements as you improve</span>
            </div>
            <div className="flex items-center gap-3 text-primary-100">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <HiOutlineSparkles className="h-5 w-5" />
              </div>
              <span>Get smart tips tailored to your spending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — register form */}
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
              Create your account ✨
            </h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Start your journey to smarter spending — it&apos;s free.
            </p>
          </div>

          {/* Form */}
          <RegisterForm onSubmit={handleRegister} error={error} clearError={() => setError('')} />

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
