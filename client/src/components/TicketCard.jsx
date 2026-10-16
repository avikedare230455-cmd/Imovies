import React from 'react';
import { Printer, MapPin, Calendar, Clock, Ticket, AlertCircle, XCircle } from 'lucide-react';

const TicketCard = ({ booking, onCancel, showActions = true }) => {
  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const isCancelled = booking.bookingStatus === 'cancelled';

  return (
    <div
      className={`relative max-w-2xl mx-auto rounded-3xl overflow-hidden cinema-glass border shadow-2xl transition-all ${
        isCancelled
          ? 'border-rose-900/40 bg-slate-950/60 opacity-80'
          : 'border-slate-700/80 bg-slate-900/90'
      }`}
    >
      {/* Top Banner Ribbon */}
      <div
        className={`px-6 py-2.5 flex items-center justify-between text-xs font-bold tracking-wider uppercase ${
          isCancelled
            ? 'bg-rose-950/80 text-rose-300 border-b border-rose-900/50'
            : 'bg-gradient-to-r from-rose-900/60 via-slate-800 to-slate-900 text-rose-400 border-b border-slate-800'
        }`}
      >
        <div className="flex items-center space-x-2">
          <Ticket className="w-4 h-4 text-rose-500" />
          <span>IMovies Verified Pass</span>
        </div>
        <div>
          {isCancelled ? (
            <span className="text-rose-400 flex items-center space-x-1">
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancelled ({booking.refundAmount ? `$${booking.refundAmount} Refunded` : 'Refunded'})</span>
            </span>
          ) : (
            <span className="text-emerald-400">Confirmed & Active</span>
          )}
        </div>
      </div>

      {/* Main Ticket Area */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Left: Poster + Movie Details */}
        <div className="md:col-span-2 flex space-x-4">
          <img
            src={booking.movie?.poster || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80'}
            alt={booking.movie?.title}
            className="w-24 h-36 rounded-xl object-cover shadow-lg border border-slate-800 flex-shrink-0"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-extrabold text-[10px] tracking-wider">
                {booking.movie?.certificate || 'U/A'}
              </span>
              <span className="px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 font-bold text-[10px]">
                {booking.movie?.format || 'IMAX 3D'}
              </span>
            </div>

            <h3 className="text-lg font-extrabold text-white mt-1.5 truncate">
              {booking.movie?.title}
            </h3>

            {/* Theatre & Screen */}
            <div className="mt-2 text-xs text-slate-300 space-y-1">
              <div className="flex items-center space-x-1.5 text-slate-200 font-semibold truncate">
                <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                <span className="truncate">{booking.theatre?.name}</span>
              </div>
              <p className="text-[11px] text-slate-400 pl-5 truncate">
                {booking.theatre?.screenName} • {booking.theatre?.city}
              </p>
            </div>

            {/* Date & Time */}
            <div className="mt-3 flex items-center space-x-4 text-xs font-semibold text-slate-200">
              <div className="flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>{booking.showDetails?.date}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                <span>{booking.showDetails?.startTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Stub: Seats, Total & QR Pass */}
        <div className="border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 flex flex-col items-center text-center">
          <div className="w-full bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex flex-col items-center">
            {/* Simulated QR Code SVG */}
            <div className="w-24 h-24 bg-white p-2 rounded-xl shadow-md flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full text-black">
                {/* QR Pattern visual */}
                <rect width="100" height="100" fill="white" />
                <rect x="10" y="10" width="25" height="25" fill="black" />
                <rect x="15" y="15" width="15" height="15" fill="white" />
                <rect x="65" y="10" width="25" height="25" fill="black" />
                <rect x="70" y="15" width="15" height="15" fill="white" />
                <rect x="10" y="65" width="25" height="25" fill="black" />
                <rect x="15" y="70" width="15" height="15" fill="white" />
                <rect x="42" y="20" width="16" height="8" fill="black" />
                <rect x="42" y="42" width="16" height="16" fill="black" />
                <rect x="65" y="42" width="8" height="16" fill="black" />
                <rect x="20" y="42" width="15" height="8" fill="black" />
                <rect x="42" y="68" width="16" height="18" fill="black" />
                <rect x="68" y="68" width="18" height="18" fill="black" />
              </svg>
            </div>

            <p className="text-[10px] tracking-widest font-mono text-slate-400 mt-2 uppercase font-semibold">
              {booking.bookingId}
            </p>
          </div>

          <div className="mt-3 w-full text-left">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Seats:</span>
              <span className="font-bold text-white">
                {booking.seats?.map((s) => s.seatNumber).join(', ')}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Amount Paid:</span>
              <span className="font-extrabold text-rose-400">
                ${booking.totalAmount?.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Perforated separator bar */}
      <div className="relative flex items-center justify-between px-6 py-2 border-t border-dashed border-slate-800 bg-slate-950/60">
        <span className="text-[11px] text-slate-500 font-mono">
          Ref: {booking.paymentId || 'TXN-VERIFIED'}
        </span>

        {showActions && (
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Pass</span>
            </button>

            {!isCancelled && onCancel && (
              <button
                onClick={() => onCancel(booking)}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-xs font-semibold text-rose-300 transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketCard;
