import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Film, Lock, Mail, ArrowRight, Shield, User, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';
  const bookingIntent = location.state?.bookingIntent;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      success(`Welcome back, ${user.name}!`);

      if (bookingIntent) {
        navigate('/checkout', { state: bookingIntent, replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md cinema-glass rounded-3xl border border-slate-800 p-8 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop decorative */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 p-0.5 mx-auto mb-3 shadow-glow-crimson">
            <div className="w-full h-full bg-[#08090c] rounded-[14px] flex items-center justify-center">
              <Film className="w-6 h-6 text-rose-500" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white">Welcome Back</h2>
          <p className="text-xs text-slate-400 mt-1">
            Sign in to access your movie bookings and premium member perks
          </p>
        </div>

        {/* Quick Demo Fill Buttons */}
        <div className="mb-6 p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 block mb-2 text-center">
            ⚡ Quick Demo Accounts (Click to autofill):
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillDemo('admin@imovies.com', 'admin123')}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold hover:bg-amber-500/20 transition-colors flex items-center justify-center space-x-1"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Demo</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemo('user@imovies.com', 'user123')}
              className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-semibold hover:bg-rose-500/20 transition-colors flex items-center justify-center space-x-1"
            >
              <User className="w-3.5 h-3.5" />
              <span>User Demo</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider shadow-glow-crimson transition-all flex items-center justify-center space-x-2 mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Sign up prompt */}
        <div className="mt-6 text-center text-xs text-slate-400">
          <span>Don't have an IMovies account? </span>
          <Link to="/register" className="text-rose-400 hover:text-rose-300 font-bold">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
