import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// MongoDB Schema for Transcriptions
const transcriptionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  confidence: {
    type: Number,
    default: 0,
  },
  duration: {
    type: Number, // in milliseconds
    default: 0,
  },
  language: {
    type: String,
    default: 'en-US',
  },
  metadata: {
    userAgent: String,
    timestamp: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create indexes for efficient querying
transcriptionSchema.index({ createdAt: -1 });
transcriptionSchema.index({ language: 1, createdAt: -1 });
transcriptionSchema.index({ confidence: -1 });

const Transcription = mongoose.model('Transcription', transcriptionSchema);

/**
 * POST /api/transcription
 * Save a new transcription to the database
 */
router.post('/', async (req, res) => {
  try {
    const { text, confidence, duration, language, metadata } = req.body;

    if (!text) {
      return res.status(400).json({ 
        error: 'Text is required',
        success: false 
      });
    }

    const transcription = new Transcription({
      text,
      confidence: confidence || 0,
      duration: duration || 0,
      language: language || 'en-US',
      metadata: {
        userAgent: req.headers['user-agent'],
        timestamp: new Date(),
        ...metadata,
      },
    });

    await transcription.save();

    res.status(201).json({
      success: true,
      data: transcription,
      message: 'Transcription saved successfully',
    });
  } catch (error) {
    console.error('Error saving transcription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save transcription',
      message: error.message,
    });
  }
});

/**
 * GET /api/transcription
 * Get all transcriptions with pagination
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const transcriptions = await Transcription.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transcription.countDocuments();

    res.json({
      success: true,
      data: transcriptions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching transcriptions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transcriptions',
      message: error.message,
    });
  }
});

/**
 * GET /api/transcription/:id
 * Get a specific transcription by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const transcription = await Transcription.findById(req.params.id);

    if (!transcription) {
      return res.status(404).json({
        success: false,
        error: 'Transcription not found',
      });
    }

    res.json({
      success: true,
      data: transcription,
    });
  } catch (error) {
    console.error('Error fetching transcription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transcription',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/transcription/:id
 * Delete a specific transcription
 */
router.delete('/:id', async (req, res) => {
  try {
    const transcription = await Transcription.findByIdAndDelete(req.params.id);

    if (!transcription) {
      return res.status(404).json({
        success: false,
        error: 'Transcription not found',
      });
    }

    res.json({
      success: true,
      message: 'Transcription deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting transcription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete transcription',
      message: error.message,
    });
  }
});

/**
 * GET /api/transcription/stats/summary
 * Get transcription statistics
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const total = await Transcription.countDocuments();
    const avgConfidence = await Transcription.aggregate([
      {
        $group: {
          _id: null,
          avgConfidence: { $avg: '$confidence' },
          totalDuration: { $sum: '$duration' },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        totalTranscriptions: total,
        averageConfidence: avgConfidence[0]?.avgConfidence || 0,
        totalDuration: avgConfidence[0]?.totalDuration || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      message: error.message,
    });
  }
});

export default router;
