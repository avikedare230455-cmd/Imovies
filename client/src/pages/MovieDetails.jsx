import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star,
  Clock,
  Calendar,
  Play,
  MapPin,
  Sparkles,
  Ticket,
  Tv,
  CheckCircle,
  Film,
} from 'lucide-react';
import { movieAPI, showAPI, theatreAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { info } = useToast();

  const [movie, setMovie] = useState(null);
  const [theatresWithShows, setTheatresWithShows] = useState([]);
  const [selectedCity, setSelectedCity] = useState(
    localStorage.getItem('imovies_city') || 'New York'
  );
  const [selectedDate, setSelectedDate] = useState('');
  const [dateList, setDateList] = useState([]);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showsLoading, setShowsLoading] = useState(false);

  // Generate 5 days of dates starting from today
  useEffect(() => {
    const dates = [];
    const now = new Date();
    for (let i = 0; i < 5; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.toLocaleDateString('en-US', { day: 'numeric' });
      const month = d.toLocaleDateString('en-US', { month: 'short' });

      dates.push({
        iso,
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : weekday,
        subLabel: `${dayNum} ${month}`,
      });
    }
    setDateList(dates);
    setSelectedDate(dates[0].iso);
  }, []);

  // Fetch movie details
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await movieAPI.getMovieById(id);
        if (res.success) {
          setMovie(res.data);
        }
      } catch (err) {
        console.error('[Movie Detail Error]', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  // Fetch shows when movie, city, or date changes
  useEffect(() => {
    const fetchShows = async () => {
      if (!id || !selectedDate) return;
      setShowsLoading(true);
      try {
        const res = await showAPI.getShows({
          movieId: id,
          date: selectedDate,
          city: selectedCity,
        });
        if (res.success) {
          setTheatresWithShows(res.data || []);
        }
      } catch (err) {
        console.error('[Fetch Shows Error]', err);
      } finally {
        setShowsLoading(false);
      }
    };

    fetchShows();
  }, [id, selectedDate, selectedCity]);

  // Listen to city changes from navbar
  useEffect(() => {
    const handleCityChange = (e) => {
      if (e.detail) {
        setSelectedCity(e.detail);
      }
    };
    window.addEventListener('imovies:city_changed', handleCityChange);
    return () => window.removeEventListener('imovies:city_changed', handleCityChange);
  }, []);

  const handleShowSelect = (showId) => {
    if (!isAuthenticated) {
      info('Please sign in to reserve seats and complete your booking');
    }
    navigate(`/booking/${showId}`);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 cinema-glass rounded-2xl text-center border border-slate-800">
        <Film className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">Movie Not Found</h2>
        <p className="text-xs text-slate-400 mt-2">The movie you requested does not exist or has finished its run.</p>
        <button
          onClick={() => navigate('/movies')}
          className="mt-4 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold"
        >
          Browse All Movies
        </button>
      </div>
    );
  }

  let trailerEmbedUrl = movie.trailerUrl || '';
  if (trailerEmbedUrl.includes('watch?v=')) {
    trailerEmbedUrl = trailerEmbedUrl.replace('watch?v=', 'embed/');
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Backdrop Header */}
      <div className="relative w-full h-[400px] overflow-hidden bg-slate-950">
        <img
          src={movie.banner || movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover object-center filter brightness-[0.35]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090c] via-[#08090c]/70 to-transparent" />
      </div>

      {/* Main Content Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-64 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Column: Poster + Actions */}
          <div className="md:col-span-4 lg:col-span-3 flex flex-col items-center sm:items-start">
            <div className="w-64 sm:w-full rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-700/80 bg-slate-900 aspect-[2/3]">
              <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
            </div>

            {movie.trailerUrl && (
              <button
                onClick={() => setTrailerOpen(true)}
                className="w-64 sm:w-full mt-4 py-3 rounded-xl cinema-glass border border-slate-700 hover:border-rose-500 text-white font-semibold text-xs tracking-wider uppercase transition-all flex items-center justify-center space-x-2"
              >
                <Play className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span>Play Official Trailer</span>
              </button>
            )}
          </div>

          {/* Right Column: Metadata + Synopsis + Cast */}
          <div className="md:col-span-8 lg:col-span-9 flex flex-col justify-end">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-md bg-rose-600 text-white font-bold text-xs uppercase">
                {movie.certificate}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold text-xs flex items-center space-x-1">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{movie.rating.toFixed(1)} / 10 ({movie.votesCount?.toLocaleString()} votes)</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-medium">
                {movie.duration} Minutes
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {movie.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <span className="font-semibold text-white">Genres:</span>
              {movie.genres?.map((g) => (
                <span key={g} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {g}
                </span>
              ))}
              <span className="text-slate-500 mx-1">•</span>
              <span className="font-semibold text-white">Languages:</span>
              <span>{movie.languages?.join(', ')}</span>
              <span className="text-slate-500 mx-1">•</span>
              <span className="font-semibold text-white">Directed by:</span>
              <span>{movie.director}</span>
            </div>

            {/* Synopsis */}
            <div className="mt-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                Synopsis
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                {movie.description}
              </p>
            </div>

            {/* Cast List */}
            {movie.cast?.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                  Featured Cast
                </h3>
                <div className="flex flex-wrap gap-4">
                  {movie.cast.map((actor, idx) => (
                    <div key={idx} className="flex items-center space-x-2.5 p-2 rounded-xl cinema-glass border border-slate-800">
                      <img
                        src={actor.image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                        alt={actor.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <p className="text-xs font-bold text-white">{actor.name}</p>
                        <p className="text-[11px] text-slate-400">{actor.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Showtimes & Theatres Booking Section */}
        <section className="mt-16 pt-10 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-bold tracking-widest text-rose-500 uppercase flex items-center space-x-1.5">
                <Ticket className="w-3.5 h-3.5" />
                <span>Reserved Seating</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">
                Select Date & Showtimes
              </h2>
            </div>

            {/* City Selector */}
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>Cinema City:</span>
              <span className="font-bold text-white bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">
                {selectedCity}
              </span>
            </div>
          </div>

          {/* Date Picker Strip */}
          <div className="flex items-center space-x-3 overflow-x-auto pb-4">
            {dateList.map((d) => (
              <button
                key={d.iso}
                onClick={() => setSelectedDate(d.iso)}
                className={`flex-shrink-0 px-5 py-3 rounded-2xl border text-center transition-all ${
                  selectedDate === d.iso
                    ? 'bg-rose-600 border-rose-500 text-white shadow-glow-crimson'
                    : 'cinema-glass border-slate-800 text-slate-400 hover:text-white hover:border-slate-600'
                }`}
              >
                <div className="text-xs font-bold uppercase">{d.label}</div>
                <div className="text-[11px] opacity-80 mt-0.5 font-medium">{d.subLabel}</div>
              </button>
            ))}
          </div>

          {/* Theatres and Showtimes List */}
          <div className="mt-8 space-y-6">
            {showsLoading ? (
              <div className="p-8 text-center cinema-glass rounded-2xl border border-slate-800">
                <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-xs text-slate-400">Finding available theatre screenings...</p>
              </div>
            ) : theatresWithShows.length === 0 ? (
              <div className="p-10 text-center cinema-glass rounded-2xl border border-slate-800">
                <Tv className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <h4 className="text-base font-bold text-white">No Screenings Available</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  There are no scheduled shows for this movie in <span className="text-rose-400 font-bold">{selectedCity}</span> on {selectedDate}.
                  Please pick another date or switch cities.
                </p>
              </div>
            ) : (
              theatresWithShows.map(({ theatre, shows }) => (
                <div
                  key={theatre._id}
                  className="p-6 rounded-2xl cinema-glass border border-slate-800/80 hover:border-slate-700 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                        <span>{theatre.name}</span>
                        <span className="text-xs text-amber-400 font-normal">★ {theatre.rating || '4.8'}</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        <span>{theatre.address}</span>
                      </p>
                    </div>

                    {/* Amenities chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {theatre.amenities?.slice(0, 3).map((amenity) => (
                        <span
                          key={amenity}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-medium"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Showtimes Grid */}
                  <div className="pt-4 flex flex-wrap gap-3">
                    {shows.map((show) => (
                      <button
                        key={show._id}
                        onClick={() => handleShowSelect(show._id)}
                        className="group flex flex-col items-center justify-center px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-rose-500 hover:bg-rose-500/10 transition-all text-center"
                      >
                        <span className="text-sm font-bold text-white group-hover:text-rose-400">
                          {show.startTime}
                        </span>
                        <div className="flex items-center space-x-1.5 mt-1">
                          <span className="text-[10px] font-semibold text-cyan-400 uppercase">
                            {show.format}
                          </span>
                          <span className="text-[10px] text-slate-500">•</span>
                          <span className="text-[10px] text-slate-400">
                            ${show.priceTiers?.standard || 13}
                          </span>
                        </div>
                        <span className="text-[9px] text-emerald-400 font-medium mt-1">
                          {show.availableSeatsCount} seats left
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Trailer Modal */}
      {trailerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <h4 className="font-bold text-white text-sm">Official Trailer - {movie.title}</h4>
              <button
                onClick={() => setTrailerOpen(false)}
                className="text-slate-400 hover:text-white px-2 py-1 text-sm"
              >
                ✕ Close
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={`${trailerEmbedUrl}?autoplay=1`}
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

export default MovieDetails;
