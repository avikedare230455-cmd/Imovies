import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  ShieldCheck,
  Check,
  Tag,
  QrCode,
  Building,
  Lock,
  ArrowLeft,
  Sparkles,
  Ticket,
} from 'lucide-react';
import { bookingAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error, warning } = useToast();

  const stateData = location.state;
  const show = stateData?.show;
  const selectedSeats = stateData?.selectedSeats || [];

  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [processing, setProcessing] = useState(false);

  // Credit Card Form State
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState(user?.name || 'ALEXANDER VANCE');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('888');

  // UPI State
  const [upiId, setUpiId] = useState('');

  if (!show || selectedSeats.length === 0) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 cinema-glass rounded-2xl text-center border border-slate-800">
        <Ticket className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">No Seats Selected</h2>
        <p className="text-xs text-slate-400 mt-2">Your booking session has expired or no seats were chosen.</p>
        <button
          onClick={() => navigate('/movies')}
          className="mt-4 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold"
        >
          Select a Movie
        </button>
      </div>
    );
  }

  // Cost calculations
  const subtotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const convenienceFee = Number((selectedSeats.length * 1.5).toFixed(2));
  const tax = Number((subtotal * 0.08).toFixed(2));

  let discount = 0;
  if (appliedCoupon === 'IMOVIES20') {
    discount = Number((subtotal * 0.2).toFixed(2));
  } else if (appliedCoupon === 'CINEMA50') {
    discount = Number((subtotal * 0.5).toFixed(2));
  }

  const finalTotal = Math.max(0, Number((subtotal + convenienceFee + tax - discount).toFixed(2)));

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    const code = couponCode.trim().toUpperCase();

    if (code === 'IMOVIES20') {
      setAppliedCoupon('IMOVIES20');
      success('Coupon applied! 20% discount added.');
    } else if (code === 'CINEMA50') {
      setAppliedCoupon('CINEMA50');
      success('Mega deal applied! 50% discount added.');
    } else {
      setCouponError('Invalid coupon code. Try IMOVIES20 or CINEMA50.');
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    try {
      const payload = {
        showId: show._id,
        seatNumbers: selectedSeats.map((s) => s.seatNumber),
        paymentMethod,
        cardLast4: cardNumber.replace(/\s+/g, '').slice(-4) || '4242',
        couponCode: appliedCoupon,
      };

      const res = await bookingAPI.createBooking(payload);
      if (res.success && res.data) {
        success('Payment successful! Your tickets are confirmed.');
        navigate(`/confirmation/${res.data._id}`, {
          state: { booking: res.data },
          replace: true,
        });
      }
    } catch (err) {
      error(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Checkout & Confirmation
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Review your order, enter details, and complete your secure reservation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Payment Methods & Gateway Simulation */}
        <div className="lg:col-span-7 space-y-6">
          {/* Payment Method Selector Tabs */}
          <div className="p-5 rounded-2xl cinema-glass border border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Select Payment Method</span>
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('Credit Card')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all ${
                  paymentMethod === 'Credit Card'
                    ? 'bg-rose-600/10 border-rose-500 text-rose-400 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-xs">Credit/Debit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all ${
                  paymentMethod === 'UPI'
                    ? 'bg-rose-600/10 border-rose-500 text-rose-400 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <QrCode className="w-5 h-5" />
                <span className="text-xs">UPI / Instant QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Net Banking')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all ${
                  paymentMethod === 'Net Banking'
                    ? 'bg-rose-600/10 border-rose-500 text-rose-400 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building className="w-5 h-5" />
                <span className="text-xs">Net Banking</span>
              </button>
            </div>

            {/* Credit Card Form & Virtual Card */}
            {paymentMethod === 'Credit Card' && (
              <div className="mt-6 space-y-4">
                {/* Virtual Card Graphic */}
                <div className="relative w-full max-w-sm mx-auto h-44 rounded-2xl p-5 bg-gradient-to-tr from-rose-900 via-slate-900 to-indigo-950 border border-slate-700 shadow-2xl flex flex-col justify-between overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold tracking-widest text-slate-300 uppercase">
                      IMOVIES PLATINUM
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400">VISA / MC</span>
                  </div>

                  <div className="w-9 h-7 rounded-md bg-amber-400/80 border border-amber-300 shadow-inner flex items-center justify-center">
                    <div className="w-6 h-4 border border-amber-800/40 rounded-sm"></div>
                  </div>

                  <div className="font-mono text-base tracking-widest text-white font-bold">
                    {cardNumber}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-300 font-mono">
                    <div>
                      <span className="text-[9px] text-slate-400 block -mb-0.5">CARD HOLDER</span>
                      <span className="font-semibold uppercase truncate max-w-[150px] inline-block">{cardHolder}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block -mb-0.5">EXPIRES</span>
                      <span className="font-semibold">{expiry}</span>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4242 4242 4242 4242"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          Expiry
                        </label>
                        <input
                          type="text"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 font-mono text-center"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          CVV
                        </label>
                        <input
                          type="password"
                          value={cvv}
                          maxLength={4}
                          onChange={(e) => setCvv(e.target.value)}
                          placeholder="•••"
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 font-mono text-center"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* UPI Form */}
            {paymentMethod === 'UPI' && (
              <div className="mt-6 text-center space-y-4">
                <div className="w-36 h-36 bg-white p-3 rounded-2xl mx-auto shadow-lg flex items-center justify-center">
                  <QrCode className="w-28 h-28 text-slate-900" />
                </div>
                <p className="text-xs text-slate-400">
                  Scan QR code with Google Pay, PhonePe, Paytm, or enter your UPI ID below.
                </p>
                <div className="max-w-xs mx-auto">
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@okhdfcbank"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white text-center focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            )}

            {/* Net Banking Form */}
            {paymentMethod === 'Net Banking' && (
              <div className="mt-6 space-y-3">
                <p className="text-xs text-slate-400">Select your preferred banking partner:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['J.P. Morgan Chase', 'Bank of America', 'Wells Fargo', 'Citibank', 'Barclays', 'HDFC Bank'].map((bank) => (
                    <label
                      key={bank}
                      className="flex items-center space-x-2 p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-600"
                    >
                      <input type="radio" name="bank" defaultChecked={bank === 'J.P. Morgan Chase'} className="accent-rose-600" />
                      <span className="text-slate-300 font-medium">{bank}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Order Breakdown & Checkout CTA */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl cinema-glass border border-slate-800 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-slate-800">
              Booking Summary
            </h3>

            {/* Movie Snapshot */}
            <div className="flex space-x-3 py-4 border-b border-slate-800">
              <img
                src={show.movie?.poster}
                alt={show.movie?.title}
                className="w-16 h-24 rounded-lg object-cover shadow"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{show.movie?.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{show.theatre?.name}</p>
                <p className="text-[11px] text-cyan-400 mt-1 font-semibold">
                  {show.screenName} • {show.format}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {show.date} at {show.startTime}
                </p>
              </div>
            </div>

            {/* Seats Chosen */}
            <div className="py-3 border-b border-slate-800 text-xs">
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Seats ({selectedSeats.length}):</span>
                <span className="font-bold text-white">
                  {selectedSeats.map((s) => s.seatNumber).join(', ')}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tier:</span>
                <span className="font-semibold text-slate-300">
                  {selectedSeats[0]?.tier}
                </span>
              </div>
            </div>

            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="py-4 border-b border-slate-800">
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon (e.g. IMOVIES20)"
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white uppercase font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-xl transition-colors"
                >
                  Apply
                </button>
              </div>
              {appliedCoupon && (
                <p className="text-[11px] text-emerald-400 mt-2 font-medium flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Promo {appliedCoupon} applied successfully!</span>
                </p>
              )}
              {couponError && (
                <p className="text-[11px] text-rose-400 mt-2">{couponError}</p>
              )}
            </form>

            {/* Price Line Items */}
            <div className="py-4 space-y-2 text-xs border-b border-slate-800">
              <div className="flex justify-between text-slate-400">
                <span>Ticket Subtotal</span>
                <span className="font-medium text-slate-200">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Convenience Fee</span>
                <span className="font-medium text-slate-200">${convenienceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Taxes & GST (8%)</span>
                <span className="font-medium text-slate-200">${tax.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="pt-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Total Amount:</span>
                <span className="text-2xl font-black text-rose-500">${finalTotal.toFixed(2)}</span>
              </div>

              <div className="flex items-center space-x-1 text-[11px] text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>256-bit SSL Encrypted</span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handlePayment}
              disabled={processing}
              className="w-full mt-6 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider shadow-glow-crimson transition-all flex items-center justify-center space-x-2"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authorizing Payment...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay & Confirm ${finalTotal.toFixed(2)}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
