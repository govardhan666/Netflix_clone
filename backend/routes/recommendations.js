const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/auth');
const Content = require('../models/Content');

// @route   GET /api/recommendations/:profileId
// @desc    Get personalized recommendations
// @access  Private
router.get('/:profileId', protect, async (req, res) => {
  try {
    const user = req.user;
    const profile = user.profiles.id(req.params.profileId);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Get user's watch history and preferences
    const watchHistory = profile.watchHistory.map(item => ({
      contentId: item.contentId.toString(),
      completed: item.completed
    }));

    const preferences = {
      genres: profile.preferences.genres,
      watchHistory: watchHistory
    };

    try {
      // Call ML service for personalized recommendations
      const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://ml-service:8000';
      const mlResponse = await axios.post(
        `${mlServiceUrl}/recommend`,
        {
          userId: user._id.toString(),
          profileId: req.params.profileId,
          preferences: preferences,
          limit: req.query.limit || 20
        },
        { timeout: 5000 }
      );

      if (mlResponse.data && mlResponse.data.recommendations) {
        const contentIds = mlResponse.data.recommendations;
        const recommendedContent = await Content.find({
          _id: { $in: contentIds }
        });

        return res.json({
          success: true,
          data: recommendedContent,
          source: 'ml-model'
        });
      }
    } catch (mlError) {
      console.log('ML service unavailable, falling back to rule-based recommendations');
    }

    // Fallback: Rule-based recommendations
    const preferredGenres = profile.preferences.genres.length > 0
      ? profile.preferences.genres
      : ['Action', 'Drama', 'Comedy'];

    const watchedContentIds = watchHistory.map(item => item.contentId);

    const recommendations = await Content.find({
      _id: { $nin: watchedContentIds },
      genres: { $in: preferredGenres }
    })
      .sort({ popularity: -1, 'rating.average': -1 })
      .limit(parseInt(req.query.limit) || 20);

    res.json({
      success: true,
      data: recommendations,
      source: 'rule-based'
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/recommendations/:profileId/similar/:contentId
// @desc    Get similar content
// @access  Private
router.get('/:profileId/similar/:contentId', protect, async (req, res) => {
  try {
    const content = await Content.findById(req.params.contentId);

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Find similar content based on genres and type
    const similar = await Content.find({
      _id: { $ne: content._id },
      type: content.type,
      genres: { $in: content.genres }
    })
      .sort({ popularity: -1 })
      .limit(10);

    res.json({
      success: true,
      data: similar
    });
  } catch (error) {
    console.error('Get similar content error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
