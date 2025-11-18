const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Content = require('../models/Content');

// @route   GET /api/streaming/:contentId
// @desc    Get streaming URL for content
// @access  Private
router.get('/:contentId', protect, async (req, res) => {
  try {
    const content = await Content.findById(req.params.contentId);

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // In production, you would generate signed URLs with expiration
    // For demo purposes, we return the direct URL
    const streamingUrl = content.videoUrl;

    res.json({
      success: true,
      data: {
        contentId: content._id,
        title: content.title,
        streamingUrl: streamingUrl,
        type: content.type,
        duration: content.duration,
        thumbnail: content.thumbnail
      }
    });
  } catch (error) {
    console.error('Get streaming URL error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/streaming/episode/:contentId/:seasonNumber/:episodeNumber
// @desc    Get streaming URL for specific episode
// @access  Private
router.get('/episode/:contentId/:seasonNumber/:episodeNumber', protect, async (req, res) => {
  try {
    const { contentId, seasonNumber, episodeNumber } = req.params;

    const content = await Content.findById(contentId);

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    if (content.type !== 'series') {
      return res.status(400).json({ error: 'Content is not a series' });
    }

    const season = content.seasons.find(s => s.seasonNumber === parseInt(seasonNumber));
    if (!season) {
      return res.status(404).json({ error: 'Season not found' });
    }

    const episode = season.episodes.find(e => e.episodeNumber === parseInt(episodeNumber));
    if (!episode) {
      return res.status(404).json({ error: 'Episode not found' });
    }

    res.json({
      success: true,
      data: {
        contentId: content._id,
        title: content.title,
        episodeTitle: episode.title,
        streamingUrl: episode.videoUrl,
        season: seasonNumber,
        episode: episodeNumber,
        duration: episode.duration,
        thumbnail: episode.thumbnail
      }
    });
  } catch (error) {
    console.error('Get episode streaming URL error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
