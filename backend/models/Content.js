const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['movie', 'series'],
    required: true
  },
  genres: [{
    type: String,
    required: true
  }],
  releaseYear: {
    type: Number,
    required: true
  },
  duration: {
    type: Number, // in minutes for movies
  },
  maturityRating: {
    type: String,
    enum: ['G', 'PG', 'PG-13', 'R', 'NC-17', 'TV-Y', 'TV-Y7', 'TV-G', 'TV-PG', 'TV-14', 'TV-MA'],
    required: true
  },
  thumbnail: {
    type: String,
    required: true
  },
  banner: {
    type: String,
    required: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  trailerUrl: String,
  cast: [{
    name: String,
    role: String
  }],
  director: String,
  seasons: [{
    seasonNumber: Number,
    episodes: [{
      episodeNumber: Number,
      title: String,
      description: String,
      duration: Number,
      videoUrl: String,
      thumbnail: String
    }]
  }],
  tags: [String],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 10
    },
    count: {
      type: Number,
      default: 0
    }
  },
  popularity: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  trending: {
    type: Boolean,
    default: false
  },
  newRelease: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for search
contentSchema.index({ title: 'text', description: 'text', tags: 'text' });
contentSchema.index({ genres: 1, popularity: -1 });
contentSchema.index({ trending: 1, popularity: -1 });

module.exports = mongoose.model('Content', contentSchema);
