import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { APP_NAME } from '../lib/constants';
import { HiOutlineChartPie, HiOutlineCash, HiOutlineLightningBolt, HiOutlineArrowRight } from 'react-icons/hi';

/**
 * Public landing page — simplified version for Phase 2.
 * Will be fully designed in Phase 11.
 */
export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-lg font-bold">₹</span>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">{APP_NAME}</span>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-all duration-200"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 text-sm font-medium transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-all duration-200"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20 text-center">
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium mb-6">
            <HiOutlineLightningBolt className="h-4 w-4" />
            Smart finance tracking for students
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
            Your money,
            <br />
            your goals,
            <br />
            <span className="text-primary-600 dark:text-primary-400">your progress.</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10">
            Track expenses, set budgets, earn achievements, and build smarter financial habits — all in one beautiful dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              Start tracking free
              <HiOutlineArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-200"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Features preview */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              icon: HiOutlineCash,
              title: 'Track Everything',
              desc: 'Record income & expenses with simple categorization.',
            },
            {
              icon: HiOutlineChartPie,
              title: 'Smart Analytics',
              desc: 'Understand your spending with beautiful charts & insights.',
            },
            {
              icon: HiOutlineLightningBolt,
              title: 'Level Up',
              desc: 'Earn XP, unlock badges, and build better money habits.',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
