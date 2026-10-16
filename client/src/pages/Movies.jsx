import React, { useState, useEffect } from 'react';
import { Film, Sparkles, Filter } from 'lucide-react';
import { movieAPI } from '../api';
import MovieCard from '../components/MovieCard';
import SearchFilterBar from '../components/SearchFilterBar';

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedRating, setSelectedRating] = useState('');
  const [sortBy, setSortBy] = useState('releaseDate');
  const [genresList, setGenresList] = useState([]);
  const [languagesList, setLanguagesList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        sortBy,
      };

      if (search) params.search = search;
      if (selectedGenre !== 'All') params.genre = selectedGenre;
      if (selectedLanguage !== 'All') params.language = selectedLanguage;
      if (selectedRating) params.rating = selectedRating;

      const res = await movieAPI.getMovies(params);
      if (res.success) {
        setMovies(res.data || []);
        setTotalPages(res.totalPages || 1);
        if (res.filters) {
          if (res.filters.genres) setGenresList(res.filters.genres);
          if (res.filters.languages) setLanguagesList(res.filters.languages);
        }
      }
    } catch (err) {
      console.error('[Fetch Movies Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [search, selectedGenre, selectedLanguage, selectedRating, sortBy, page]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedGenre('All');
    setSelectedLanguage('All');
    setSelectedRating('');
    setSortBy('releaseDate');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <span className="text-xs font-bold tracking-widest text-rose-500 uppercase flex items-center space-x-1.5">
          <Film className="w-3.5 h-3.5" />
          <span>Cinematic Catalog</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
          Explore All Movies
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
          Discover current screenings, upcoming blockbusters, and award-winning cinema.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <SearchFilterBar
        search={search}
        setSearch={(val) => {
          setSearch(val);
          setPage(1);
        }}
        selectedGenre={selectedGenre}
        setSelectedGenre={(val) => {
          setSelectedGenre(val);
          setPage(1);
        }}
        genres={genresList}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={(val) => {
          setSelectedLanguage(val);
          setPage(1);
        }}
        languages={languagesList}
        selectedRating={selectedRating}
        setSelectedRating={(val) => {
          setSelectedRating(val);
          setPage(1);
        }}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onReset={handleResetFilters}
      />

      {/* Movie Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="aspect-[2/3] rounded-2xl bg-slate-900 animate-pulse border border-slate-800"
            />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-20 cinema-glass rounded-2xl border border-slate-800">
          <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No Movies Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            We couldn't find any movie matching your current filters. Try resetting search or selecting other genres.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-12">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 disabled:opacity-40 hover:border-slate-600 transition-colors"
          >
            Previous
          </button>
          <span className="text-xs font-semibold text-slate-400 px-3">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 disabled:opacity-40 hover:border-slate-600 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Movies;
