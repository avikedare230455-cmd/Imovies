import React from 'react';
import { Search, X, SlidersHorizontal, Star, Globe, Film } from 'lucide-react';

const SearchFilterBar = ({
  search,
  setSearch,
  selectedGenre,
  setSelectedGenre,
  genres = [],
  selectedLanguage,
  setSelectedLanguage,
  languages = [],
  selectedRating,
  setSelectedRating,
  sortBy,
  setSortBy,
  onReset,
}) => {
  return (
    <div className="p-5 rounded-2xl cinema-glass border border-slate-800/80 mb-8 space-y-4">
      {/* Top Search Line */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search movies by title, director, keyword, language..."
            className="w-full pl-10 pr-9 py-2.5 bg-slate-900/90 border border-slate-700/70 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort By & Rating Dropdowns */}
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="py-2.5 px-3 bg-slate-900 border border-slate-700/70 rounded-xl text-xs font-medium text-slate-200 focus:outline-none focus:border-rose-500"
          >
            <option value="releaseDate">Latest Releases</option>
            <option value="rating">Highest Rated</option>
            <option value="title">Title (A - Z)</option>
          </select>

          {/* Rating filter */}
          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
            className="py-2.5 px-3 bg-slate-900 border border-slate-700/70 rounded-xl text-xs font-medium text-slate-200 focus:outline-none focus:border-rose-500"
          >
            <option value="">Any Rating</option>
            <option value="8.0">★ 8.0 & Above</option>
            <option value="8.5">★ 8.5 & Above</option>
            <option value="9.0">★ 9.0 Masterpiece</option>
          </select>
        </div>
      </div>

      {/* Languages Filter Bar */}
      {languages.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800/60">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center space-x-1">
            <Globe className="w-3.5 h-3.5 text-rose-500" />
            <span>Languages:</span>
          </span>

          <button
            onClick={() => setSelectedLanguage('All')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              selectedLanguage === 'All'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            All Languages
          </button>

          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedLanguage === lang
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      )}

      {/* Genres Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/40">
        <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center space-x-1">
          <Film className="w-3.5 h-3.5 text-slate-500" />
          <span>Genres:</span>
        </span>

        {/* Genre Pill Selection */}
        <button
          onClick={() => setSelectedGenre('All')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
            selectedGenre === 'All'
              ? 'bg-rose-600 text-white shadow-glow-crimson'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          All Genres
        </button>
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              selectedGenre === genre
                ? 'bg-rose-600 text-white shadow-glow-crimson'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {genre}
          </button>
        ))}

        {/* Reset Filter Button */}
        {(selectedGenre !== 'All' || selectedLanguage !== 'All' || selectedRating || search) && (
          <button
            onClick={onReset}
            className="ml-auto text-xs text-rose-400 hover:text-rose-300 underline font-medium"
          >
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchFilterBar;
