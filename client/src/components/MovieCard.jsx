import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Ticket } from 'lucide-react';

const MovieCard = ({ movie }) => {
  const formatDuration = (mins) => {
    const hrs = Math.floor(mins / 60);
    const remainder = mins % 60;
    return `${hrs}h ${remainder}m`;
  };

  return (
    <div className="group relative rounded-2xl overflow-hidden cinema-glass border border-slate-800/80 hover:border-slate-600 transition-all duration-300 hover:shadow-2xl hover:shadow-rose-950/20 flex flex-col h-full">
      {/* Poster Media Box */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradient dark fade on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090c] via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-[11px] font-bold text-amber-400 flex items-center space-x-1 shadow-md">
            <Star className="w-3 h-3 fill-amber-400" />
            <span>{movie.rating.toFixed(1)}</span>
          </span>

          <span className="px-2 py-0.5 rounded-md bg-rose-600/90 text-white text-[10px] font-extrabold tracking-wider uppercase shadow-md">
            {movie.certificate}
          </span>
        </div>

        {/* Runtime Badge */}
        <div className="absolute bottom-3 left-3 flex items-center space-x-1.5 text-xs text-slate-300 font-medium bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full">
          <Clock className="w-3 h-3 text-rose-500" />
          <span>{formatDuration(movie.duration)}</span>
        </div>
      </div>

      {/* Movie Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Genres */}
          <div className="flex flex-wrap gap-1 mb-2">
            {movie.genres.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300"
              >
                {genre}
              </span>
            ))}
            {movie.languages?.length > 0 && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
                {movie.languages.slice(0, 2).join(' • ')}
              </span>
            )}
          </div>

          <h3 className="text-base font-bold text-white group-hover:text-rose-400 transition-colors line-clamp-1">
            {movie.title}
          </h3>

          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {movie.description}
          </p>
        </div>

        {/* CTA Button */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <Link
            to={`/movies/${movie._id}`}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-slate-800/90 hover:bg-rose-600 text-slate-200 hover:text-white font-semibold text-xs tracking-wide transition-all shadow-sm group-hover:bg-rose-600 group-hover:shadow-glow-crimson"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Book Tickets</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
