import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, Lock, Mail, User, Phone, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register({
        name,
        email,
        phone,
        password,
      });
      success(`Welcome to IMovies, ${user.name}!`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md cinema-glass rounded-3xl border border-slate-800 p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative ambient blur */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 p-0.5 mx-auto mb-3 shadow-glow-crimson">
            <div className="w-full h-full bg-[#08090c] rounded-[14px] flex items-center justify-center">
              <Film className="w-6 h-6 text-rose-500" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white">Join IMovies</h2>
          <p className="text-xs text-slate-400 mt-1">
            Experience next-level cinema booking with instant reserved seating
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alexander Vance"
                className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

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
            <label className="text-slate-300 font-semibold block mb-1">Phone Number (Optional)</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 019-2834"
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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
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
                <span>Create Free Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          <span>Already registered? </span>
          <Link to="/login" className="text-rose-400 hover:text-rose-300 font-bold">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
