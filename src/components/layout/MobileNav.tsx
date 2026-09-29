import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, MessageSquare, Sparkles, User } from 'lucide-react';
import { useAI } from '../../context/AIContext';

export const MobileNav: React.FC = () => {
  const location = useLocation();
  const { toggleAi } = useAI();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-3 py-1 flex items-center justify-around shadow-lg">
      <Link
        to="/"
        className={`flex flex-col items-center py-1 px-2 rounded-lg text-xs font-medium transition-colors ${
          isActive('/') ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Home className="w-5 h-5 mb-0.5" />
        <span>Home</span>
      </Link>

      <Link
        to="/bookings"
        className={`flex flex-col items-center py-1 px-2 rounded-lg text-xs font-medium transition-colors ${
          isActive('/bookings') ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Calendar className="w-5 h-5 mb-0.5" />
        <span>Bookings</span>
      </Link>

      <button
        onClick={toggleAi}
        className="flex flex-col items-center py-1 px-3 -mt-4 rounded-full bg-blue-600 text-white shadow-md shadow-blue-500/30 text-xs font-medium"
      >
        <div className="w-7 h-7 flex items-center justify-center">
          <Sparkles className="w-5 h-5 animate-pulse text-amber-300" />
        </div>
        <span className="text-[10px]">AI Help</span>
      </button>

      <Link
        to="/messages"
        className={`flex flex-col items-center py-1 px-2 rounded-lg text-xs font-medium transition-colors ${
          isActive('/messages') ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <MessageSquare className="w-5 h-5 mb-0.5" />
        <span>Messages</span>
      </Link>

      <Link
        to="/profile"
        className={`flex flex-col items-center py-1 px-2 rounded-lg text-xs font-medium transition-colors ${
          isActive('/profile') ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <User className="w-5 h-5 mb-0.5" />
        <span>Profile</span>
      </Link>
    </div>
  );
};
