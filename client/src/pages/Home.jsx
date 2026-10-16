import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Ticket,
  Star,
  Clock,
  Sparkles,
  ChevronRight,
  Tv,
  Headphones,
  ShieldCheck,
  Tag,
  Film,
} from 'lucide-react';
import { movieAPI } from '../api';
import MovieCard from '../components/MovieCard';

const Home = () => {
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [nowShowing, setNowShowing] = useState([]);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [activeTrailerUrl, setActiveTrailerUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [featuredRes, moviesRes] = await Promise.all([
          movieAPI.getFeaturedMovies(),
          movieAPI.getMovies({ limit: 8 }),
        ]);

        if (featuredRes.success) setFeaturedMovies(featuredRes.data || []);
        if (moviesRes.success) setNowShowing(moviesRes.data || []);
      } catch (err) {
        console.error('[Home Load Error]', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  // Auto rotate hero slider every 7 seconds
  useEffect(() => {
    if (featuredMovies.length <= 1) return;
    const interval = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [featuredMovies.length]);

  const currentHero = featuredMovies[activeHeroIndex] || nowShowing[0];

  const openTrailer = (url) => {
    // Convert standard youtube link to embed link
    let embedUrl = url;
    if (url.includes('watch?v=')) {
      embedUrl = url.replace('watch?v=', 'embed/');
    }
    setActiveTrailerUrl(embedUrl);
    setTrailerOpen(true);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Showcase Slider */}
      {currentHero && (
        <section className="relative w-full h-[75vh] min-h-[520px] max-h-[700px] overflow-hidden bg-slate-950">
          {/* Background Banner with gradient layers */}
          <div className="absolute inset-0">
            <img
              src={currentHero.banner || currentHero.poster}
              alt={currentHero.title}
              className="w-full h-full object-cover object-center filter brightness-[0.45] transition-all duration-1000 scale-100 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#08090c] via-[#08090c]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#08090c] via-[#08090c]/70 to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 z-10">
            <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-6 duration-700">
              {/* Badges */}
              <div className="flex items-center space-x-2.5 mb-3">
                <span className="px-3 py-1 rounded-full bg-rose-600/90 text-white text-xs font-bold tracking-wider uppercase shadow-glow-crimson flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Featured Premiere</span>
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-amber-400 text-xs font-bold flex items-center space-x-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{currentHero.rating.toFixed(1)} Rating</span>
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 text-xs font-bold">
                  {currentHero.certificate}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
                {currentHero.title}
              </h1>

              {/* Genres & Runtime */}
              <div className="flex items-center space-x-3 text-xs sm:text-sm text-slate-300 mt-2 font-medium">
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-rose-500" />
                  <span>{currentHero.duration} mins</span>
                </div>
                <span>•</span>
                <span>{currentHero.genres?.join(', ')}</span>
                <span>•</span>
                <span>Dir. {currentHero.director}</span>
              </div>

              {/* Description */}
              <p className="mt-3 text-sm sm:text-base text-slate-300 line-clamp-3 leading-relaxed">
                {currentHero.description}
              </p>

              {/* Actions */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  to={`/movies/${currentHero._id}`}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-sm tracking-wide shadow-glow-crimson transition-all flex items-center space-x-2 transform active:scale-95"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Book Tickets Now</span>
                </Link>

                {currentHero.trailerUrl && (
                  <button
                    onClick={() => openTrailer(currentHero.trailerUrl)}
                    className="px-5 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-semibold text-sm transition-all flex items-center space-x-2 backdrop-blur-md"
                  >
                    <Play className="w-4 h-4 text-rose-500 fill-rose-500" />
                    <span>Watch Trailer</span>
                  </button>
                )}
              </div>
            </div>

            {/* Slider Dots */}
            {featuredMovies.length > 1 && (
              <div className="flex items-center space-x-2 mt-8">
                {featuredMovies.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveHeroIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      activeHeroIndex === idx ? 'w-8 bg-rose-600' : 'w-2 bg-slate-700 hover:bg-slate-500'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Promotional Offers Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-950/70 via-slate-900 to-amber-950/40 border border-rose-500/30 shadow-xl backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>Exclusive Cinema Discounts</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-[10px] uppercase font-extrabold">Active</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Use code <span className="font-mono font-bold text-amber-300">IMOVIES20</span> for 20% off or <span className="font-mono font-bold text-rose-300">CINEMA50</span> for 50% off during checkout!
              </p>
            </div>
          </div>
          <Link
            to="/movies"
            className="flex-shrink-0 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-all flex items-center space-x-1"
          >
            <span>Explore Movies</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Now Showing Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Now In Theatres
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Select a blockbuster, choose your premium seats, and enjoy cinematic perfection.
            </p>
          </div>
          <Link
            to="/movies"
            className="flex items-center space-x-1 text-xs sm:text-sm font-bold text-rose-500 hover:text-rose-400 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[2/3] rounded-2xl bg-slate-900 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {nowShowing.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        )}
      </section>

      {/* Luxury Experience Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold tracking-widest text-rose-500 uppercase">
            The Pinnacle of Entertainment
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
            Engineered For Movie Lovers
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Every auditorium is calibrated for maximum immersion, spatial realism, and unmatched luxury seating.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl cinema-glass border border-slate-800 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
              <Tv className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">IMAX with Dual Laser</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Custom-designed giant screens with 4K laser projection delivering breathtaking brightness and color saturation.
            </p>
          </div>

          <div className="p-6 rounded-2xl cinema-glass border border-slate-800 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-xl bg-rose-950/60 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
              <Headphones className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Dolby Atmos Spatial Audio</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              128 audio channels placed all around and overhead, transporting you directly inside every cinematic moment.
            </p>
          </div>

          <div className="p-6 rounded-2xl cinema-glass border border-slate-800 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Live Real-Time Seat Lock</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Instant socket synchronization ensures no double bookings, seamless 10-minute hold timers, and digital QR passes.
            </p>
          </div>
        </div>
      </section>

      {/* YouTube Trailer Modal */}
      {trailerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                <Film className="w-4 h-4 text-rose-500" />
                <span>Official Trailer</span>
              </h4>
              <button
                onClick={() => setTrailerOpen(false)}
                className="text-slate-400 hover:text-white px-2 py-1 rounded-lg text-sm"
              >
                ✕ Close
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={`${activeTrailerUrl}?autoplay=1`}
                title="Trailer"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
