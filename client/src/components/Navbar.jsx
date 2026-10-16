import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Film,
  MapPin,
  Ticket,
  LogOut,
  Shield,
  Bell,
  Menu,
  X,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import { notificationAPI } from '../api';

const CITIES = ['New York', 'Los Angeles', 'London', 'Mumbai'];

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedCity, setSelectedCity] = useState(
    localStorage.getItem('imovies_city') || 'New York'
  );
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchUnread = async () => {
        try {
          const res = await notificationAPI.getNotifications();
          if (res.success) {
            setUnreadCount(res.unreadCount || 0);
          }
        } catch (err) {
          // ignore background failure
        }
      };
      fetchUnread();
    }
  }, [isAuthenticated, location.pathname]);

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    localStorage.setItem('imovies_city', city);
    setCityDropdownOpen(false);
    window.dispatchEvent(new CustomEvent('imovies:city_changed', { detail: city }));
  };

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-40 bg-[#08090c]/90 backdrop-blur-xl border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 p-0.5 shadow-glow-crimson transition-transform group-hover:scale-105">
                <div className="w-full h-full bg-[#08090c] rounded-[10px] flex items-center justify-center">
                  <Film className="w-5 h-5 text-rose-500 group-hover:text-rose-400" />
                </div>
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                  I<span className="text-rose-500">MOVIES</span>
                </span>
                <span className="hidden sm:block text-[9px] font-bold tracking-widest text-slate-400 uppercase -mt-1">
                  Cinema Experience
                </span>
              </div>
            </Link>

            {/* City Selector */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-700/60 hover:border-slate-500 text-xs font-medium text-slate-300 transition-all"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>{selectedCity}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {cityDropdownOpen && (
                <div className="absolute left-0 mt-2 w-44 rounded-xl cinema-glass border border-slate-700 shadow-2xl py-1 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-800">
                    Select Cinema City
                  </div>
                  {CITIES.map((city) => (
                    <button
                      key={city}
                      onClick={() => handleCitySelect(city)}
                      className={`w-full text-left px-3.5 py-2 text-xs transition-colors flex items-center justify-between ${
                        selectedCity === city
                          ? 'text-rose-400 bg-rose-500/10 font-medium'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <span>{city}</span>
                      {selectedCity === city && <Sparkles className="w-3 h-3 text-rose-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-3">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                location.pathname === '/'
                  ? 'text-white bg-slate-800/80'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              Home
            </Link>
            <Link
              to="/movies"
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                location.pathname.startsWith('/movies')
                  ? 'text-white bg-slate-800/80'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              Movies
            </Link>
            <Link
              to="/dashboard"
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center space-x-1.5 ${
                location.pathname === '/dashboard'
                  ? 'text-white bg-slate-800/80'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Ticket className="w-4 h-4 text-rose-500" />
              <span>My Tickets</span>
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center space-x-1.5 border ${
                  location.pathname.startsWith('/admin')
                    ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                    : 'text-amber-300 border-amber-500/20 hover:bg-amber-500/10'
                }`}
              >
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Admin Console</span>
              </Link>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-3">
            {/* Notification Bell */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all relative"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <NotificationDropdown
                  isOpen={notifDropdownOpen}
                  onClose={() => setNotifDropdownOpen(false)}
                />
              </div>
            )}

            {/* User Profile or Auth Buttons */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/70 hover:border-slate-500 transition-all"
                >
                  <span className="text-xs font-semibold text-slate-200 max-w-[120px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl cinema-glass border border-slate-700/80 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-1">
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                      <span className="mt-1 inline-block px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-[10px] font-semibold text-rose-400">
                        {user?.role === 'admin' ? 'Cinema Director' : 'IMovies Member'}
                      </span>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors"
                    >
                      <span>Account & Bookings</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-xs text-amber-300 hover:bg-amber-500/10 transition-colors"
                      >
                        <Shield className="w-3.5 h-3.5 text-amber-400" />
                        <span>Admin Management</span>
                      </Link>
                    )}

                    <div className="border-t border-slate-800 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 shadow-glow-crimson transition-all"
                >
                  Join Free
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white md:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#08090c]/95 px-4 pt-3 pb-5 space-y-2">
          {/* City Selector for Mobile */}
          <div className="py-2 border-b border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">City:</span>
            <div className="flex flex-wrap gap-2">
              {CITIES.map((c) => (
                <button
                  key={c}
                  onClick={() => handleCitySelect(c)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    selectedCity === c
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Home
          </Link>
          <Link
            to="/movies"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Movies
          </Link>
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            My Tickets
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-amber-300 hover:bg-amber-500/10"
            >
              Admin Console
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
