import React from 'react';
import { Film, Heart, ShieldCheck, Sparkles, Tv, Headphones, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#060709] text-slate-400 mt-24">
      {/* Cinematic Experiences Strip */}
      <div className="border-b border-slate-800/50 py-10 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center p-4 rounded-xl cinema-glass border border-slate-800/60">
              <Tv className="w-6 h-6 text-cyan-400 mb-2" />
              <h4 className="text-white text-sm font-semibold">IMAX with Laser</h4>
              <p className="text-xs text-slate-400 mt-1">Crystal clear 4K projection</p>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl cinema-glass border border-slate-800/60">
              <Headphones className="w-6 h-6 text-rose-500 mb-2" />
              <h4 className="text-white text-sm font-semibold">Dolby Atmos</h4>
              <p className="text-xs text-slate-400 mt-1">128-channel spatial audio</p>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl cinema-glass border border-slate-800/60">
              <Sparkles className="w-6 h-6 text-amber-400 mb-2" />
              <h4 className="text-white text-sm font-semibold">VIP Recliners</h4>
              <p className="text-xs text-slate-400 mt-1">Plush leather comfort & dining</p>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl cinema-glass border border-slate-800/60">
              <Award className="w-6 h-6 text-emerald-400 mb-2" />
              <h4 className="text-white text-sm font-semibold">Instant Mobile Pass</h4>
              <p className="text-xs text-slate-400 mt-1">Contactless QR code entry</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 p-0.5">
                <div className="w-full h-full bg-[#08090c] rounded-[10px] flex items-center justify-center">
                  <Film className="w-4 h-4 text-rose-500" />
                </div>
              </div>
              <span className="text-lg font-extrabold tracking-wider text-white">
                I<span className="text-rose-500">MOVIES</span>
              </span>
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-slate-400">
              The premier destination for cinematic discovery, real-time reserved seating, and next-generation theater entertainment.
            </p>
          </div>

          {/* Experience */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">
              Formats & Tech
            </h4>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-rose-400 transition-colors">IMAX 70mm Dual Laser</span></li>
              <li><span className="hover:text-rose-400 transition-colors">Dolby Cinema & Atmos</span></li>
              <li><span className="hover:text-rose-400 transition-colors">4DX Motion & Sensory</span></li>
              <li><span className="hover:text-rose-400 transition-colors">ScreenX 270° Panoramic</span></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/movies" className="hover:text-rose-400 transition-colors">All Movies</Link></li>
              <li><Link to="/dashboard" className="hover:text-rose-400 transition-colors">My Bookings</Link></li>
              <li><Link to="/login" className="hover:text-rose-400 transition-colors">Sign In / Register</Link></li>
              <li><Link to="/admin" className="hover:text-amber-400 transition-colors">Cinema Admin Portal</Link></li>
            </ul>
          </div>

          {/* Security & Guarantees */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">
              Security Guarantee
            </h4>
            <div className="p-3.5 rounded-xl cinema-glass border border-slate-800 text-xs text-slate-400">
              <div className="flex items-center space-x-2 text-emerald-400 font-semibold mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Guaranteed Seats</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Real-time seat reservation lock backed by instant digital verification and flexible 90% cancellation refunds.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/60 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 IMovies Cinema Systems. Built with MERN & Socket.io for cinematic excellence.</p>
          <div className="flex items-center space-x-1 mt-3 sm:mt-0">
            <span>Engineered with passion for movies</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline mx-1" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
