import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle2, Ticket, ArrowRight, Home, Sparkles } from 'lucide-react';
import { bookingAPI } from '../api';
import TicketCard from '../components/TicketCard';

const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);

  useEffect(() => {
    // Fire confetti celebration
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#e50914', '#f59e0b', '#06b6d4', '#10b981'],
      });
    } catch (e) {
      // ignore in tests
    }

    if (!booking && bookingId) {
      const fetchBooking = async () => {
        try {
          const res = await bookingAPI.getBookingById(bookingId);
          if (res.success) {
            setBooking(res.data);
          }
        } catch (err) {
          console.error('[Booking Confirmation Error]', err);
        } finally {
          setLoading(false);
        }
      };
      fetchBooking();
    }
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-semibold text-slate-400">Finalizing ticket generation...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen text-center">
      {/* Success Badge */}
      <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4 animate-in zoom-in-75">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <span className="px-3 py-1 rounded-full bg-rose-600/10 border border-rose-500/20 text-rose-400 text-xs font-bold tracking-widest uppercase">
        Booking Confirmed
      </span>

      <h1 className="text-3xl sm:text-4xl font-black text-white mt-2">
        You're Ready For The Show!
      </h1>
      <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
        Your digital admission pass has been issued. Present this QR code at the cinema gate for instant entry.
      </p>

      {/* Render Digital Pass */}
      <div className="mt-8 text-left">
        <TicketCard booking={booking} showActions={true} />
      </div>

      {/* Navigation Links */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/dashboard"
          className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-all flex items-center space-x-2"
        >
          <Ticket className="w-4 h-4 text-rose-500" />
          <span>View All My Bookings</span>
        </Link>

        <Link
          to="/movies"
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs shadow-glow-crimson transition-all flex items-center space-x-2"
        >
          <span>Explore More Movies</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default BookingConfirmation;
