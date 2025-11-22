const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  subscription: {
    type: String,
    enum: ['basic', 'standard', 'premium'],
    default: 'basic'
  },
  profiles: [{
    name: String,
    avatar: String,
    preferences: {
      genres: [String],
      maturityLevel: {
        type: String,
        enum: ['all', 'teen', 'mature'],
        default: 'all'
      }
    },
    watchHistory: [{
      contentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Content'
      },
      watchedAt: Date,
      progress: Number,
      completed: Boolean
    }],
    myList: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Content'
    }]
  }],
  paymentInfo: {
    lastFour: String,
    expiryDate: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
