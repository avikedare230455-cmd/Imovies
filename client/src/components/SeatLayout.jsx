import React from 'react';
import { Armchair, Lock, Check } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const SeatLayout = ({
  show,
  selectedSeats = [],
  onSeatToggle,
  onProceed,
}) => {
  const { lockedSeats = {}, bookedSeats = [] } = useSocket();
  const { user } = useAuth();

  if (!show || !show.seats) return null;

  // Group seats by Row (A to G)
  const rowsMap = new Map();
  show.seats.forEach((seat) => {
    if (!rowsMap.has(seat.row)) {
      rowsMap.set(seat.row, []);
    }
    rowsMap.get(seat.row).push(seat);
  });

  // Sort columns
  rowsMap.forEach((seatsInRow) => {
    seatsInRow.sort((a, b) => a.col - b.col);
  });

  const getSeatStatus = (seat) => {
    // 1. Is it booked in database or booked live by socket?
    if (seat.status === 'booked' || bookedSeats.includes(seat.seatNumber)) {
      return 'booked';
    }

    // 2. Is it currently selected by this user?
    if (selectedSeats.some((s) => s.seatNumber === seat.seatNumber)) {
      return 'selected';
    }

    // 3. Is it locked by another user via Socket.io?
    const lockInfo = lockedSeats[seat.seatNumber];
    if (lockInfo) {
      if (lockInfo.lockedBy === user?._id) {
        return 'selected';
      }
      return 'locked';
    }

    return 'available';
  };

  const handleSeatClick = (seat) => {
    const status = getSeatStatus(seat);
    if (status === 'booked' || status === 'locked') {
      return; // Can't select booked or locked
    }
    onSeatToggle(seat);
  };

  // Calculate pricing
  const subtotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Curved Screen Effect */}
      <div className="w-full max-w-2xl text-center my-6">
        <div className="cinema-curved-screen"></div>
        <div className="h-10 cinema-projector-beam pointer-events-none -mt-4"></div>
      </div>

      {/* Seating Grid */}
      <div className="w-full max-w-3xl overflow-x-auto pb-4">
        <div className="min-w-[620px] flex flex-col items-center space-y-3">
          {Array.from(rowsMap.entries()).map(([rowLabel, seatsInRow]) => {
            const rowTier = seatsInRow[0]?.tier || 'Standard';

            return (
              <div key={rowLabel} className="flex items-center space-x-3">
                {/* Row Letter Left */}
                <span className="w-6 text-center text-xs font-bold text-slate-500">
                  {rowLabel}
                </span>

                {/* Seats with Center Aisle */}
                <div className="flex items-center space-x-2">
                  {seatsInRow.map((seat) => {
                    const status = getSeatStatus(seat);
                    const isLeftHalf = seat.col <= 5;
                    const isAisleEdge = seat.col === 5;

                    let seatStyles = 'bg-slate-900 border-slate-700/80 text-slate-300 hover:border-rose-500 hover:scale-105';

                    if (status === 'selected') {
                      seatStyles = 'bg-rose-600 border-rose-500 text-white shadow-glow-crimson scale-105 animate-seat-selected';
                    } else if (status === 'locked') {
                      seatStyles = 'bg-amber-950/70 border-amber-600/60 text-amber-300 cursor-not-allowed opacity-80';
                    } else if (status === 'booked') {
                      seatStyles = 'bg-slate-950/90 border-slate-800 text-slate-600 cursor-not-allowed opacity-40';
                    } else if (rowTier === 'VIP') {
                      seatStyles = 'bg-amber-950/20 border-amber-500/40 text-amber-200 hover:border-amber-400 hover:scale-105';
                    } else if (rowTier === 'Premium') {
                      seatStyles = 'bg-indigo-950/20 border-indigo-500/40 text-indigo-200 hover:border-indigo-400 hover:scale-105';
                    }

                    return (
                      <React.Fragment key={seat.seatNumber}>
                        <button
                          type="button"
                          onClick={() => handleSeatClick(seat)}
                          disabled={status === 'booked' || status === 'locked'}
                          title={`${seat.seatNumber} (${seat.tier}) - $${seat.price}`}
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex flex-col items-center justify-center font-bold text-[11px] transition-all relative ${seatStyles}`}
                        >
                          {status === 'selected' ? (
                            <Check className="w-4 h-4 stroke-[3]" />
                          ) : status === 'locked' ? (
                            <Lock className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <span>{seat.col}</span>
                          )}
                        </button>

                        {/* Center Aisle Spacer */}
                        {isAisleEdge && <div className="w-6 sm:w-8" />}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Row Letter Right */}
                <span className="w-6 text-center text-xs font-bold text-slate-500">
                  {rowLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tier Badges & Legend */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-400 border-t border-slate-800/80 pt-6 max-w-2xl w-full">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-md border border-amber-500/50 bg-amber-950/30"></div>
          <span>VIP Recliner (${show.priceTiers?.vip || 24})</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-md border border-indigo-500/50 bg-indigo-950/30"></div>
          <span>Premium (${show.priceTiers?.premium || 18})</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-md border border-slate-700 bg-slate-900"></div>
          <span>Standard (${show.priceTiers?.standard || 13})</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-md bg-rose-600 border border-rose-500"></div>
          <span className="text-white font-medium">Selected</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-md border border-amber-600/60 bg-amber-950/70 flex items-center justify-center">
            <Lock className="w-2.5 h-2.5 text-amber-400" />
          </div>
          <span>Held by Other</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-md bg-slate-950/90 border border-slate-800 opacity-40"></div>
          <span>Sold Out</span>
        </div>
      </div>

      {/* Floating Bottom Selection Bar */}
      {selectedSeats.length > 0 && (
        <div className="sticky bottom-6 mt-8 w-full max-w-2xl bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 z-30 animate-in slide-in-from-bottom-4">
          <div>
            <div className="text-xs text-slate-400">
              Selected ({selectedSeats.length} {selectedSeats.length === 1 ? 'seat' : 'seats'}):
            </div>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="text-sm font-bold text-white tracking-wide">
                {selectedSeats.map((s) => s.seatNumber).join(', ')}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-base font-extrabold text-rose-500">
                ${subtotal.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            onClick={onProceed}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold uppercase tracking-wider shadow-glow-crimson transition-all transform active:scale-95"
          >
            Continue to Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default SeatLayout;
