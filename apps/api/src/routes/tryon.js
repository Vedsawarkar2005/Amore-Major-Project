import express from 'express';

const router = express.Router();

// POST /api/tryon - Mock virtual try-on endpoint
router.post('/', (req, res) => {
  try {
    const { imageBase64, shadeSku } = req.body;

    if (!imageBase64 || !shadeSku) {
      return res.status(400).json({
        error: 'imageBase64 and shadeSku are required.'
      });
    }

    return res.json({
      status: 'success',
      shade: shadeSku,
      processedUrl: imageBase64
    });
  } catch (err) {
    console.error('Error handling try-on request:', err);
    return res.status(500).json({ error: 'Internal server error during try-on processing.' });
  }
});

export default router;
