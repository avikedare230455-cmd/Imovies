import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-3xl bg-rose-600/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-4">
        <Film className="w-8 h-8" />
      </div>
      <h1 className="text-5xl font-black text-white">404</h1>
      <h2 className="text-lg font-bold text-slate-300 mt-2">Scene Not Found</h2>
      <p className="text-xs text-slate-500 mt-1 max-w-sm">
        The cinematic feature or page you're trying to view has been cut from the final reel.
      </p>

      <div className="mt-6 flex items-center space-x-3">
        <Link
          to="/"
          className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-glow-crimson transition-all flex items-center space-x-2"
        >
          <Home className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
