import React, { useState, useEffect } from 'react';
import {
  Shield,
  Film,
  Tv,
  Calendar,
  Ticket,
  Users,
  DollarSign,
  Plus,
  Trash2,
  Edit,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { adminAPI, movieAPI, theatreAPI, showAPI, bookingAPI } from '../api';
import { useToast } from '../context/ToastContext';

const AdminDashboard = () => {
  const { success, error, warning } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Data lists
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [shows, setShows] = useState([]);
  const [bookings, setBookings] = useState([]);

  // Modals
  const [movieModalOpen, setMovieModalOpen] = useState(false);
  const [showModalOpen, setShowModalOpen] = useState(false);
  const [theatreModalOpen, setTheatreModalOpen] = useState(false);

  // Movie Form
  const [movieForm, setMovieForm] = useState({
    title: '',
    description: '',
    poster: '',
    banner: '',
    trailerUrl: '',
    genres: 'Action, Sci-Fi',
    languages: 'English',
    duration: 150,
    rating: 8.5,
    certificate: 'PG-13',
    director: 'Christopher Nolan',
    releaseDate: new Date().toISOString().split('T')[0],
  });

  // Show Form
  const [showForm, setShowForm] = useState({
    movie: '',
    theatre: '',
    screenName: 'Auditorium 1 (IMAX)',
    date: new Date().toISOString().split('T')[0],
    startTime: '07:00 PM',
    format: 'IMAX 3D',
    language: 'English',
    priceVip: 24,
    pricePremium: 18,
    priceStandard: 13,
  });

  // Theatre Form
  const [theatreForm, setTheatreForm] = useState({
    name: '',
    city: 'New York',
    address: '',
    phone: '+1 (555) 123-4567',
    amenities: 'IMAX Laser, Dolby Atmos, Luxury Recliners',
  });

  const fetchStatsAndData = async () => {
    setLoading(true);
    try {
      const [statsRes, moviesRes, theatresRes, showsRes, bookingsRes] = await Promise.all([
        adminAPI.getStats(),
        movieAPI.getMovies({ limit: 50 }),
        theatreAPI.getTheatres({}),
        showAPI.getShows({}),
        bookingAPI.getAllBookings({ limit: 50 }),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (moviesRes.success) setMovies(moviesRes.data || []);
      if (theatresRes.success) setTheatres(theatresRes.data || []);
      if (showsRes.success) setShows(showsRes.rawShows || []);
      if (bookingsRes.success) setBookings(bookingsRes.data || []);
    } catch (err) {
      console.error('[Admin Load Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatsAndData();
  }, []);

  // Handle Add Movie
  const handleCreateMovie = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...movieForm,
        genres: movieForm.genres.split(',').map((g) => g.trim()),
        languages: movieForm.languages.split(',').map((l) => l.trim()),
        duration: Number(movieForm.duration),
        rating: Number(movieForm.rating),
      };

      const res = await movieAPI.createMovie(payload);
      if (res.success) {
        success('Movie added to catalogue successfully');
        setMovieModalOpen(false);
        fetchStatsAndData();
      }
    } catch (err) {
      error(err.message || 'Failed to add movie');
    }
  };

  // Handle Delete Movie
  const handleDeleteMovie = async (movieId) => {
    if (!window.confirm('Are you sure you want to delete this movie?')) return;
    try {
      const res = await movieAPI.deleteMovie(movieId);
      if (res.success) {
        success('Movie removed successfully');
        fetchStatsAndData();
      }
    } catch (err) {
      error(err.message || 'Failed to delete movie');
    }
  };

  // Handle Create Show
  const handleCreateShow = async (e) => {
    e.preventDefault();
    if (!showForm.movie || !showForm.theatre) {
      return warning('Please select both a movie and a theatre');
    }
    try {
      const payload = {
        movie: showForm.movie,
        theatre: showForm.theatre,
        screenName: showForm.screenName,
        date: showForm.date,
        startTime: showForm.startTime,
        format: showForm.format,
        language: showForm.language,
        priceTiers: {
          vip: Number(showForm.priceVip),
          premium: Number(showForm.pricePremium),
          standard: Number(showForm.priceStandard),
        },
      };

      const res = await showAPI.createShow(payload);
      if (res.success) {
        success('New show scheduled with 70 interactive seats');
        setShowModalOpen(false);
        fetchStatsAndData();
      }
    } catch (err) {
      error(err.message || 'Failed to schedule show');
    }
  };

  // Handle Delete Show
  const handleDeleteShow = async (showId) => {
    if (!window.confirm('Cancel and remove this scheduled show?')) return;
    try {
      const res = await showAPI.deleteShow(showId);
      if (res.success) {
        success('Show removed successfully');
        fetchStatsAndData();
      }
    } catch (err) {
      error(err.message || 'Failed to delete show');
    }
  };

  // Handle Create Theatre
  const handleCreateTheatre = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: theatreForm.name,
        city: theatreForm.city,
        address: theatreForm.address,
        phone: theatreForm.phone,
        amenities: theatreForm.amenities.split(',').map((a) => a.trim()),
        screens: [
          { name: 'Screen 1 (IMAX)', totalSeats: 70, rows: 7, seatsPerRow: 10 },
          { name: 'Screen 2 (Dolby)', totalSeats: 70, rows: 7, seatsPerRow: 10 },
        ],
      };

      const res = await theatreAPI.createTheatre(payload);
      if (res.success) {
        success('New theatre added successfully');
        setTheatreModalOpen(false);
        fetchStatsAndData();
      }
    } catch (err) {
      error(err.message || 'Failed to add theatre');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4 mb-8">
        <div>
          <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-xs uppercase tracking-widest flex items-center space-x-1.5 w-max">
            <Shield className="w-3.5 h-3.5" />
            <span>Cinema Command Center</span>
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white mt-2">
            IMovies Operations & Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage movie catalogue, schedules, theatres, transactions, and live auditorium seat availability.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'movies', label: 'Movies' },
            { id: 'shows', label: 'Shows' },
            { id: 'theatres', label: 'Theatres' },
            { id: 'bookings', label: 'Bookings' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-rose-600 text-white shadow-glow-crimson'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="p-4 rounded-2xl cinema-glass border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white mt-2">
            ${stats?.totalRevenue?.toFixed(2) || '0.00'}
          </div>
          <span className="text-[10px] text-emerald-400 font-medium">All completed bookings</span>
        </div>

        <div className="p-4 rounded-2xl cinema-glass border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Bookings</span>
            <Ticket className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white mt-2">
            {stats?.totalBookings || 0}
          </div>
          <span className="text-[10px] text-slate-400">Active & completed</span>
        </div>

        <div className="p-4 rounded-2xl cinema-glass border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Movies</span>
            <Film className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white mt-2">
            {stats?.totalMovies || 0}
          </div>
          <span className="text-[10px] text-slate-400">Current releases</span>
        </div>

        <div className="p-4 rounded-2xl cinema-glass border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Luxury Theatres</span>
            <Tv className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white mt-2">
            {stats?.totalTheatres || 0}
          </div>
          <span className="text-[10px] text-slate-400">Across 4 global cities</span>
        </div>

        <div className="p-4 rounded-2xl cinema-glass border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Members</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white mt-2">
            {stats?.totalUsers || 0}
          </div>
          <span className="text-[10px] text-purple-400 font-medium">Registered audience</span>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl cinema-glass border border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Recent Ticket Bookings
              </h3>
              <button
                onClick={() => setActiveTab('bookings')}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium"
              >
                View All Ledger →
              </button>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3">Booking ID</th>
                    <th className="pb-3">Movie</th>
                    <th className="pb-3">Theatre</th>
                    <th className="pb-3">Seats</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {stats?.recentBookings?.map((b) => (
                    <tr key={b._id} className="text-slate-300 hover:bg-slate-800/40">
                      <td className="py-3 font-mono font-bold text-white">{b.bookingId}</td>
                      <td className="py-3 font-semibold text-slate-200">{b.movie?.title}</td>
                      <td className="py-3 text-slate-400">{b.theatre?.name}</td>
                      <td className="py-3 font-mono">{b.seats?.map((s) => s.seatNumber).join(', ')}</td>
                      <td className="py-3 font-bold text-rose-400">${b.totalAmount?.toFixed(2)}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            b.bookingStatus === 'confirmed'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {b.bookingStatus}
                        </span>
                      </td>
                      <td className="py-3 text-[11px] text-slate-500">
                        {new Date(b.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MOVIES */}
      {activeTab === 'movies' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Movie Titles ({movies.length})</h2>
            <button
              onClick={() => setMovieModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-glow-crimson transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Movie</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {movies.map((m) => (
              <div
                key={m._id}
                className="p-4 rounded-2xl cinema-glass border border-slate-800 flex space-x-3 items-center justify-between"
              >
                <img
                  src={m.poster}
                  alt={m.title}
                  className="w-16 h-24 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-600 text-white font-bold">
                      {m.certificate}
                    </span>
                    <span className="text-[10px] text-amber-400 font-bold">★ {m.rating}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white truncate mt-1">{m.title}</h4>
                  <p className="text-[11px] text-slate-400 truncate">{m.genres?.join(', ')}</p>
                  <p className="text-[11px] text-slate-500">{m.duration} mins • Dir. {m.director}</p>
                </div>
                <button
                  onClick={() => handleDeleteMovie(m._id)}
                  className="p-2 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-400 transition-colors"
                  title="Delete Movie"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SHOWS */}
      {activeTab === 'shows' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Scheduled Shows ({shows.length})</h2>
            <button
              onClick={() => {
                if (movies.length > 0) setShowForm((prev) => ({ ...prev, movie: movies[0]._id }));
                if (theatres.length > 0) setShowForm((prev) => ({ ...prev, theatre: theatres[0]._id }));
                setShowModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-glow-crimson transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule New Show</span>
            </button>
          </div>

          <div className="overflow-x-auto p-4 rounded-3xl cinema-glass border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3">Movie</th>
                  <th className="pb-3">Theatre & Screen</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Time</th>
                  <th className="pb-3">Format</th>
                  <th className="pb-3">Seats Left</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {shows.map((s) => (
                  <tr key={s._id} className="text-slate-300 hover:bg-slate-800/40">
                    <td className="py-3 font-semibold text-white">{s.movie?.title}</td>
                    <td className="py-3 text-slate-400">{s.theatre?.name} ({s.screenName})</td>
                    <td className="py-3">{s.date}</td>
                    <td className="py-3 font-bold text-cyan-400">{s.startTime}</td>
                    <td className="py-3 font-mono uppercase text-[10px] text-amber-400">{s.format}</td>
                    <td className="py-3 font-semibold text-emerald-400">{s.availableSeatsCount} / {s.totalSeats}</td>
                    <td className="py-3">
                      <button
                        onClick={() => handleDeleteShow(s._id)}
                        className="text-rose-400 hover:text-rose-300 p-1"
                        title="Cancel Show"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: THEATRES */}
      {activeTab === 'theatres' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Cinema Venues ({theatres.length})</h2>
            <button
              onClick={() => setTheatreModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-glow-crimson transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Theatre</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {theatres.map((t) => (
              <div key={t._id} className="p-5 rounded-2xl cinema-glass border border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">{t.name}</h3>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-xs font-semibold text-rose-400">
                    {t.city}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{t.address}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {t.amenities?.map((a) => (
                    <span key={a} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300">
                      {a}
                    </span>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-400 flex justify-between">
                  <span>Screens: {t.screens?.length || 2} Auditoriums</span>
                  <span>Phone: {t.phone}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Global Booking Ledger ({bookings.length})</h2>
          </div>

          <div className="overflow-x-auto p-4 rounded-3xl cinema-glass border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3">Booking ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Movie</th>
                  <th className="pb-3">Theatre</th>
                  <th className="pb-3">Seats</th>
                  <th className="pb-3">Paid</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {bookings.map((b) => (
                  <tr key={b._id} className="text-slate-300 hover:bg-slate-800/40">
                    <td className="py-3 font-mono font-bold text-white">{b.bookingId}</td>
                    <td className="py-3">
                      <div className="font-semibold text-white">{b.user?.name || 'Customer'}</div>
                      <div className="text-[10px] text-slate-500">{b.user?.email}</div>
                    </td>
                    <td className="py-3 font-semibold text-slate-200">{b.movie?.title}</td>
                    <td className="py-3 text-slate-400">{b.theatre?.name}</td>
                    <td className="py-3 font-mono text-cyan-400">{b.seats?.map((s) => s.seatNumber).join(', ')}</td>
                    <td className="py-3 font-bold text-rose-400">${b.totalAmount?.toFixed(2)}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          b.bookingStatus === 'confirmed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {b.bookingStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD MOVIE MODAL */}
      {movieModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-xl bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white mb-4">Add New Movie</h3>
            <form onSubmit={handleCreateMovie} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Movie Title</label>
                <input
                  type="text"
                  required
                  value={movieForm.title}
                  onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                  placeholder="e.g. Avatar 3: Fire and Ash"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Synopsis</label>
                <textarea
                  required
                  rows={3}
                  value={movieForm.description}
                  onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                  placeholder="Full movie description..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Poster URL</label>
                  <input
                    type="url"
                    required
                    value={movieForm.poster}
                    onChange={(e) => setMovieForm({ ...movieForm, poster: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Banner URL</label>
                  <input
                    type="url"
                    value={movieForm.banner}
                    onChange={(e) => setMovieForm({ ...movieForm, banner: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    value={movieForm.duration}
                    onChange={(e) => setMovieForm({ ...movieForm, duration: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Rating (0-10)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={movieForm.rating}
                    onChange={(e) => setMovieForm({ ...movieForm, rating: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Certificate</label>
                  <select
                    value={movieForm.certificate}
                    onChange={(e) => setMovieForm({ ...movieForm, certificate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="U">U</option>
                    <option value="U/A">U/A</option>
                    <option value="A">A</option>
                    <option value="PG">PG</option>
                    <option value="PG-13">PG-13</option>
                    <option value="R">R</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Genres (comma separated)</label>
                  <input
                    type="text"
                    value={movieForm.genres}
                    onChange={(e) => setMovieForm({ ...movieForm, genres: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Director</label>
                  <input
                    type="text"
                    value={movieForm.director}
                    onChange={(e) => setMovieForm({ ...movieForm, director: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Trailer YouTube URL</label>
                <input
                  type="url"
                  value={movieForm.trailerUrl}
                  onChange={(e) => setMovieForm({ ...movieForm, trailerUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setMovieModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-glow-crimson"
                >
                  Create Movie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE SHOW MODAL */}
      {showModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Schedule a Screening</h3>
            <form onSubmit={handleCreateShow} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Select Movie</label>
                <select
                  required
                  value={showForm.movie}
                  onChange={(e) => setShowForm({ ...showForm, movie: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                >
                  <option value="">-- Choose Movie --</option>
                  {movies.map((m) => (
                    <option key={m._id} value={m._id}>{m.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Select Theatre</label>
                <select
                  required
                  value={showForm.theatre}
                  onChange={(e) => setShowForm({ ...showForm, theatre: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                >
                  <option value="">-- Choose Theatre --</option>
                  {theatres.map((t) => (
                    <option key={t._id} value={t._id}>{t.name} ({t.city})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={showForm.date}
                    onChange={(e) => setShowForm({ ...showForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Start Time</label>
                  <input
                    type="text"
                    required
                    value={showForm.startTime}
                    onChange={(e) => setShowForm({ ...showForm, startTime: e.target.value })}
                    placeholder="07:00 PM"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Auditorium / Screen</label>
                  <input
                    type="text"
                    value={showForm.screenName}
                    onChange={(e) => setShowForm({ ...showForm, screenName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Format</label>
                  <select
                    value={showForm.format}
                    onChange={(e) => setShowForm({ ...showForm, format: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="IMAX 3D">IMAX 3D</option>
                    <option value="Dolby Cinema">Dolby Cinema</option>
                    <option value="4DX">4DX</option>
                    <option value="3D">3D</option>
                    <option value="2D">2D</option>
                  </select>
                </div>
              </div>

              {/* Price Tiers */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                <div>
                  <label className="text-slate-400 block mb-1">VIP Recliner ($)</label>
                  <input
                    type="number"
                    value={showForm.priceVip}
                    onChange={(e) => setShowForm({ ...showForm, priceVip: e.target.value })}
                    className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Premium ($)</label>
                  <input
                    type="number"
                    value={showForm.pricePremium}
                    onChange={(e) => setShowForm({ ...showForm, pricePremium: e.target.value })}
                    className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Standard ($)</label>
                  <input
                    type="number"
                    value={showForm.priceStandard}
                    onChange={(e) => setShowForm({ ...showForm, priceStandard: e.target.value })}
                    className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-glow-crimson"
                >
                  Schedule Show
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD THEATRE MODAL */}
      {theatreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Add Theatre Venue</h3>
            <form onSubmit={handleCreateTheatre} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Theatre Name</label>
                <input
                  type="text"
                  required
                  value={theatreForm.name}
                  onChange={(e) => setTheatreForm({ ...theatreForm, name: e.target.value })}
                  placeholder="e.g. IMAX Cinema Royale"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">City</label>
                  <select
                    value={theatreForm.city}
                    onChange={(e) => setTheatreForm({ ...theatreForm, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="New York">New York</option>
                    <option value="Los Angeles">Los Angeles</option>
                    <option value="London">London</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Chicago">Chicago</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={theatreForm.phone}
                    onChange={(e) => setTheatreForm({ ...theatreForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Full Street Address</label>
                <input
                  type="text"
                  required
                  value={theatreForm.address}
                  onChange={(e) => setTheatreForm({ ...theatreForm, address: e.target.value })}
                  placeholder="123 Cinema Way, Times Square"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Amenities (comma separated)</label>
                <input
                  type="text"
                  value={theatreForm.amenities}
                  onChange={(e) => setTheatreForm({ ...theatreForm, amenities: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setTheatreModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-glow-crimson"
                >
                  Create Venue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
