const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Movie synopsis is required'],
    },
    poster: {
      type: String,
      required: [true, 'Movie poster image URL is required'],
    },
    banner: {
      type: String,
      default: '',
    },
    trailerUrl: {
      type: String,
      default: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    },
    genres: {
      type: [String],
      required: true,
      index: true,
    },
    languages: {
      type: [String],
      required: true,
      index: true,
    },
    duration: {
      type: Number, // in minutes
      required: [true, 'Movie duration in minutes is required'],
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    rating: {
      type: Number,
      default: 8.5,
      min: 0,
      max: 10,
    },
    votesCount: {
      type: Number,
      default: 1540,
    },
    certificate: {
      type: String,
      enum: ['U', 'U/A', 'A', 'G', 'PG', 'PG-13', 'R', 'NC-17'],
      default: 'U/A',
    },
    director: {
      type: String,
      default: 'Christopher Nolan',
    },
    cast: [
      {
        name: String,
        role: String,
        image: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes for fast searching and filtering
movieSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Movie', movieSchema);
