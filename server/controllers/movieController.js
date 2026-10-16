const Movie = require('../models/Movie');

// @desc    Get all movies with search, filter, sort & pagination
// @route   GET /api/movies
// @access  Public
const getMovies = async (req, res) => {
  try {
    const { search, genre, language, rating, sortBy, sortOrder = 'desc', page = 1, limit = 12 } = req.query;

    const query = { isActive: true };

    // Search keyword in title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { director: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by genre
    if (genre && genre !== 'All') {
      query.genres = { $in: [genre] };
    }

    // Filter by language
    if (language && language !== 'All') {
      query.languages = { $in: [language] };
    }

    // Filter by minimum rating
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // Sorting options
    let sort = { releaseDate: -1 };
    if (sortBy === 'rating') sort = { rating: sortOrder === 'asc' ? 1 : -1 };
    if (sortBy === 'title') sort = { title: sortOrder === 'asc' ? 1 : -1 };
    if (sortBy === 'releaseDate') sort = { releaseDate: sortOrder === 'asc' ? 1 : -1 };

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const totalMovies = await Movie.countDocuments(query);
    const movies = await Movie.find(query).sort(sort).skip(skip).limit(limitNum);

    // Extract available filters from dataset
    const allGenres = await Movie.distinct('genres', { isActive: true });
    const allLanguages = await Movie.distinct('languages', { isActive: true });

    res.json({
      success: true,
      count: movies.length,
      totalMovies,
      totalPages: Math.ceil(totalMovies / limitNum),
      currentPage: pageNum,
      filters: {
        genres: allGenres,
        languages: allLanguages,
      },
      data: movies,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get featured/trending movies for hero slider
// @route   GET /api/movies/featured
// @access  Public
const getFeaturedMovies = async (req, res) => {
  try {
    const movies = await Movie.find({ isActive: true, featured: true }).limit(5);
    res.json({ success: true, data: movies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single movie by ID
// @route   GET /api/movies/:id
// @access  Public
const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }
    res.json({ success: true, data: movie });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new movie (Admin)
// @route   POST /api/movies
// @access  Private/Admin
const createMovie = async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({ success: true, data: movie, message: 'Movie added successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update movie (Admin)
// @route   PUT /api/movies/:id
// @access  Private/Admin
const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }
    res.json({ success: true, data: movie, message: 'Movie updated successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete movie (Admin)
// @route   DELETE /api/movies/:id
// @access  Private/Admin
const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }
    res.json({ success: true, message: 'Movie removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMovies,
  getFeaturedMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
};
