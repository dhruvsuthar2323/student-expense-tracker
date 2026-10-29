import { HiOutlineMenuAlt2, HiOutlineLogout } from 'react-icons/hi';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

export default function Topbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch {
      toast.error('Failed to log out');
    }
  };

  // Get user initials for avatar
  const initials = user?.fullName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  // Real gamification data from user object
  const gamification = user?.gamification;
  const streak = user?.currentStreak || 0;
  const level = gamification?.level || 1;
  const icon = gamification?.icon || '🌱';
  const title = gamification?.title || 'Beginner';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {/* Left side */}
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <HiOutlineMenuAlt2 className="h-5 w-5" />
        </button>

        {/* Streak indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full text-sm font-medium">
          <span>🔥</span>
          <span>{streak > 0 ? `${streak} Day Streak` : 'Start your streak!'}</span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Level indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 rounded-full text-sm">
          <span>{icon}</span>
          <span className="font-medium text-primary-700 dark:text-primary-300">Level {level}</span>
        </div>

        {/* User info */}
        <div className="flex items-center gap-3">
          <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
            {user?.fullName}
          </span>

          {/* Avatar */}
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-white text-sm font-semibold">{initials}</span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
            aria-label="Log out"
            title="Log out"
          >
            <HiOutlineLogout className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
