const express = require('express');
const router = express.Router();
const Content = require('../models/Content');
const { protect } = require('../middleware/auth');

// @route   GET /api/content
// @desc    Get all content with filters
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { type, genre, search, featured, trending, newRelease, limit = 20, page = 1 } = req.query;

    let query = {};

    if (type) query.type = type;
    if (genre) query.genres = genre;
    if (featured) query.featured = featured === 'true';
    if (trending) query.trending = trending === 'true';
    if (newRelease) query.newRelease = newRelease === 'true';
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const content = await Content.find(query)
      .sort({ popularity: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Content.countDocuments(query);

    res.json({
      success: true,
      count: content.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: content
    });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/content/:id
// @desc    Get single content by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Get content by ID error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/content/genres/list
// @desc    Get all unique genres
// @access  Private
router.get('/genres/list', protect, async (req, res) => {
  try {
    const genres = await Content.distinct('genres');
    res.json({
      success: true,
      data: genres
    });
  } catch (error) {
    console.error('Get genres error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/content/:id/view
// @desc    Increment view count
// @access  Private
router.post('/:id/view', protect, async (req, res) => {
  try {
    const content = await Content.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Increment view error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/content/:id/rate
// @desc    Rate content
// @access  Private
router.post('/:id/rate', protect, async (req, res) => {
  try {
    const { rating } = req.body;

    if (rating < 0 || rating > 10) {
      return res.status(400).json({ error: 'Rating must be between 0 and 10' });
    }

    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Update average rating
    const newCount = content.rating.count + 1;
    const newAverage = ((content.rating.average * content.rating.count) + rating) / newCount;

    content.rating.average = newAverage;
    content.rating.count = newCount;

    await content.save();

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Rate content error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
