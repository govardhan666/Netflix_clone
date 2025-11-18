const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   POST /api/user/profiles
// @desc    Create new profile
// @access  Private
router.post('/profiles', protect, async (req, res) => {
  try {
    const { name, avatar } = req.body;

    const user = await User.findById(req.user._id);

    if (user.profiles.length >= 5) {
      return res.status(400).json({ error: 'Maximum 5 profiles allowed' });
    }

    user.profiles.push({
      name,
      avatar: avatar || 'https://i.pravatar.cc/150?img=' + (user.profiles.length + 1),
      preferences: {
        genres: [],
        maturityLevel: 'all'
      },
      watchHistory: [],
      myList: []
    });

    await user.save();

    res.status(201).json({
      success: true,
      profiles: user.profiles
    });
  } catch (error) {
    console.error('Create profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/user/profiles/:profileId/watch-history
// @desc    Update watch history
// @access  Private
router.put('/profiles/:profileId/watch-history', protect, async (req, res) => {
  try {
    const { contentId, progress, completed } = req.body;
    const user = await User.findById(req.user._id);

    const profile = user.profiles.id(req.params.profileId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Check if content already in watch history
    const existingIndex = profile.watchHistory.findIndex(
      item => item.contentId.toString() === contentId
    );

    if (existingIndex > -1) {
      profile.watchHistory[existingIndex].progress = progress;
      profile.watchHistory[existingIndex].completed = completed;
      profile.watchHistory[existingIndex].watchedAt = new Date();
    } else {
      profile.watchHistory.push({
        contentId,
        watchedAt: new Date(),
        progress,
        completed: completed || false
      });
    }

    await user.save();

    res.json({
      success: true,
      watchHistory: profile.watchHistory
    });
  } catch (error) {
    console.error('Update watch history error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/user/profiles/:profileId/watch-history
// @desc    Get watch history with content details
// @access  Private
router.get('/profiles/:profileId/watch-history', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('profiles.watchHistory.contentId');

    const profile = user.profiles.id(req.params.profileId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({
      success: true,
      data: profile.watchHistory
    });
  } catch (error) {
    console.error('Get watch history error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/user/profiles/:profileId/my-list
// @desc    Add to my list
// @access  Private
router.post('/profiles/:profileId/my-list', protect, async (req, res) => {
  try {
    const { contentId } = req.body;
    const user = await User.findById(req.user._id);

    const profile = user.profiles.id(req.params.profileId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    if (!profile.myList.includes(contentId)) {
      profile.myList.push(contentId);
      await user.save();
    }

    res.json({
      success: true,
      myList: profile.myList
    });
  } catch (error) {
    console.error('Add to my list error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/user/profiles/:profileId/my-list/:contentId
// @desc    Remove from my list
// @access  Private
router.delete('/profiles/:profileId/my-list/:contentId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const profile = user.profiles.id(req.params.profileId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    profile.myList = profile.myList.filter(
      id => id.toString() !== req.params.contentId
    );

    await user.save();

    res.json({
      success: true,
      myList: profile.myList
    });
  } catch (error) {
    console.error('Remove from my list error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/user/profiles/:profileId/my-list
// @desc    Get my list with content details
// @access  Private
router.get('/profiles/:profileId/my-list', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('profiles.myList');

    const profile = user.profiles.id(req.params.profileId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({
      success: true,
      data: profile.myList
    });
  } catch (error) {
    console.error('Get my list error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
