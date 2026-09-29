import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Wrench,
  Sparkles,
  Bell,
  User,
  Shield,
  Briefcase,
  ChevronDown,
  LogOut,
  Calendar,
  MessageSquare,
  Search,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useAI } from '../../context/AIContext';
import { UserRole } from '../../types';

export const Navbar: React.FC = () => {
  const { user, logout, switchDemoRole } = useAuth();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const { toggleAi } = useAI();
  const location = useLocation();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleRoleSelect = (role: UserRole) => {
    switchDemoRole(role);
    setShowRoleMenu(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition-colors">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900">FixMate</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  AI Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block leading-none">Trusted help right when you need it</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
            <Link
              to="/services"
              className={`px-3 py-2 rounded-lg transition-colors ${
                isActive('/services') ? 'bg-slate-100 text-blue-600 font-semibold' : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Services
            </Link>
            <Link
              to="/bookings"
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                isActive('/bookings') ? 'bg-slate-100 text-blue-600 font-semibold' : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Bookings
            </Link>
            <Link
              to="/messages"
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                isActive('/messages') ? 'bg-slate-100 text-blue-600 font-semibold' : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Messages
            </Link>
            {user?.role === 'PROVIDER' && (
              <Link
                to="/provider/dashboard"
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                  isActive('/provider/dashboard') ? 'bg-blue-50 text-blue-600 font-semibold' : 'hover:bg-blue-50 text-blue-700'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                Provider Portal
              </Link>
            )}
            {user?.role === 'ADMIN' && (
              <Link
                to="/admin/dashboard"
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                  isActive('/admin/dashboard') ? 'bg-purple-50 text-purple-600 font-semibold' : 'hover:bg-purple-50 text-purple-700'
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin Dashboard
              </Link>
            )}
          </nav>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* FixMate AI Trigger Button */}
          <button
            onClick={toggleAi}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-medium shadow-sm transition-all hover:shadow"
            title="Ask FixMate AI"
          >
            <Sparkles className="w-4 h-4 animate-pulse text-amber-300" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>

          {/* Role Switcher Dropdown (Demo Helper) */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              title="Switch demo role"
            >
              <span className={`w-2 h-2 rounded-full ${user?.role === 'ADMIN' ? 'bg-purple-500' : user?.role === 'PROVIDER' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
              <span className="font-semibold">{user?.role || 'CUSTOMER'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50 text-xs">
                <div className="px-3 py-1.5 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-100">
                  Switch Demo Persona
                </div>
                <button
                  onClick={() => handleRoleSelect('CUSTOMER')}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                    user?.role === 'CUSTOMER' ? 'font-semibold text-blue-600 bg-blue-50/50' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <div>
                      <div>Customer</div>
                      <div className="text-[10px] text-slate-400">John Doe (Bookings & Search)</div>
                    </div>
                  </div>
                  {user?.role === 'CUSTOMER' && <span className="text-blue-600 font-bold">✓</span>}
                </button>
                <button
                  onClick={() => handleRoleSelect('PROVIDER')}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                    user?.role === 'PROVIDER' ? 'font-semibold text-emerald-600 bg-emerald-50/50' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div>Service Provider</div>
                      <div className="text-[10px] text-slate-400">Rajesh Kumar (Jobs & Earnings)</div>
                    </div>
                  </div>
                  {user?.role === 'PROVIDER' && <span className="text-emerald-600 font-bold">✓</span>}
                </button>
                <button
                  onClick={() => handleRoleSelect('ADMIN')}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                    user?.role === 'ADMIN' ? 'font-semibold text-purple-600 bg-purple-50/50' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-600" />
                    <div>
                      <div>Administrator</div>
                      <div className="text-[10px] text-slate-400">Full platform verification & stats</div>
                    </div>
                  </div>
                  {user?.role === 'ADMIN' && <span className="text-purple-600 font-bold">✓</span>}
                </button>
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifMenu(!showNotifMenu);
                if (!showNotifMenu && unreadCount > 0) markAllAsRead();
              }}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50 text-xs">
                <div className="px-4 py-2 flex items-center justify-between border-b border-slate-100">
                  <span className="font-semibold text-slate-800">Notifications</span>
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-blue-600 hover:underline"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-slate-400">No notifications yet.</div>
                  ) : (
                    notifications.slice(0, 5).map(n => (
                      <div key={n._id} className={`p-3 transition-colors ${n.read ? 'bg-white' : 'bg-blue-50/40'}`}>
                        <div className="font-semibold text-slate-800">{n.title}</div>
                        <div className="text-slate-600 mt-0.5">{n.message}</div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-blue-100 transition-all"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                  <User className="w-4 h-4" />
                </div>
              )}
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50 text-xs">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="font-semibold text-slate-900 truncate">{user?.name || 'Guest User'}</p>
                  <p className="text-slate-500 text-[11px] truncate">{user?.email || 'Sign in to access features'}</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="w-full text-left px-4 py-2 flex items-center gap-2 text-slate-700 hover:bg-slate-50"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  My Profile & Addresses
                </Link>
                <Link
                  to="/bookings"
                  onClick={() => setShowUserMenu(false)}
                  className="w-full text-left px-4 py-2 flex items-center gap-2 text-slate-700 hover:bg-slate-50"
                >
                  <Calendar className="w-4 h-4 text-slate-400" />
                  My Bookings
                </Link>
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 flex items-center gap-2 text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
