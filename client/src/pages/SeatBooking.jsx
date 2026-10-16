import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Film, MapPin, Calendar, ArrowLeft, ShieldAlert, Sparkles } from 'lucide-react';
import { showAPI } from '../api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import SeatLayout from '../components/SeatLayout';

const SeatBooking = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { joinShow, leaveShow, lockSeat, unlockSeat } = useSocket();
  const { warning, error, info } = useToast();

  const [show, setShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes (600 seconds)

  // Fetch show details
  useEffect(() => {
    const fetchShow = async () => {
      try {
        const res = await showAPI.getShowById(showId);
        if (res.success) {
          setShow(res.data);
        }
      } catch (err) {
        error(err.message || 'Failed to load show seating');
      } finally {
        setLoading(false);
      }
    };

    fetchShow();
  }, [showId]);

  // Join real-time socket room for this show
  useEffect(() => {
    if (showId) {
      joinShow(showId);
    }
    return () => {
      if (showId) {
        leaveShow(showId);
      }
    };
  }, [showId]);

  // Hold Timer countdown
  useEffect(() => {
    if (selectedSeats.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          warning('Your seat hold has expired. Please select your seats again.');
          // Release selected seats
          selectedSeats.forEach((s) => unlockSeat(showId, s.seatNumber));
          setSelectedSeats([]);
          return 600;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedSeats, showId]);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeatToggle = (seat) => {
    const exists = selectedSeats.some((s) => s.seatNumber === seat.seatNumber);

    if (exists) {
      // Deselect and unlock
      setSelectedSeats((prev) => prev.filter((s) => s.seatNumber !== seat.seatNumber));
      unlockSeat(showId, seat.seatNumber);
    } else {
      if (selectedSeats.length >= 8) {
        return warning('Maximum 8 tickets allowed per booking');
      }
      // Select and lock
      setSelectedSeats((prev) => [...prev, seat]);
      lockSeat(showId, seat.seatNumber);
    }
  };

  const handleProceed = () => {
    if (selectedSeats.length === 0) {
      return warning('Please select at least 1 seat to proceed');
    }

    if (!isAuthenticated) {
      info('Please sign in or register to complete your ticket booking');
      return navigate('/login', {
        state: {
          from: `/booking/${showId}`,
          bookingIntent: {
            show,
            selectedSeats,
          },
        },
      });
    }

    // Pass show and selected seats to checkout
    navigate('/checkout', {
      state: {
        show,
        selectedSeats,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-semibold text-slate-400">Loading interactive seat map...</p>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 cinema-glass rounded-2xl text-center border border-slate-800">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">Show Not Found</h2>
        <p className="text-xs text-slate-400 mt-2">This screening is either unavailable or has expired.</p>
        <button
          onClick={() => navigate('/movies')}
          className="mt-4 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold"
        >
          Back to Movies
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Navigation & Movie Snapshot Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800/80 gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">{show.movie?.title}</h1>
              <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-extrabold uppercase">
                {show.movie?.certificate || 'U/A'}
              </span>
              <span className="px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold">
                {show.format}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-slate-300 font-semibold">{show.theatre?.name}</span>
                <span>({show.screenName})</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-300">{show.date}</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-200 font-bold">{show.startTime}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Live Seat Hold Countdown Timer */}
        {selectedSeats.length > 0 && (
          <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs font-semibold animate-pulse">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Seats held for:</span>
            <span className="font-mono text-sm font-bold text-white">{formatTimer(timeLeft)}</span>
          </div>
        )}
      </div>

      {/* Interactive Seat Layout */}
      <div className="mt-6">
        <SeatLayout
          show={show}
          selectedSeats={selectedSeats}
          onSeatToggle={handleSeatToggle}
          onProceed={handleProceed}
        />
      </div>
    </div>
  );
};

export default SeatBooking;
