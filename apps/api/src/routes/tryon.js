import express from 'express';

const router = express.Router();

const PYTHON_RECOM_URL =
  process.env.SHADE_RECOM_URL ||
  process.env.PYTHON_RECOM_URL ||
  'http://127.0.0.1:8001';

// POST /api/tryon - Mock virtual try-on telemetry/sync endpoint
router.post('/', (req, res) => {
  try {
    const { imageBase64, shadeSku } = req.body;

    if (!imageBase64 || !shadeSku) {
      return res.status(400).json({
        error: 'imageBase64 and shadeSku are required.',
      });
    }

    return res.json({
      status: 'success',
      shade: shadeSku,
      processedUrl: imageBase64,
    });
  } catch (err) {
    console.error('Error handling try-on request:', err);
    return res.status(500).json({ error: 'Internal server error during try-on processing.' });
  }
});

// POST /api/tryon/recommend - Proxy endpoint to Python shade recommendation microservice
router.post('/recommend', async (req, res) => {
  try {
    const { imageBase64, image, skinTone, skin_tone, skinLab, skin_lab } = req.body;

    const rawImage = imageBase64 || image;
    const tone = skinTone || skin_tone;
    const lab = skinLab || skin_lab;

    if (!rawImage && !lab && !tone) {
      return res.status(400).json({
        success: false,
        error: 'Please provide user portrait image (imageBase64) or skin-tone / skin-lab metrics.',
      });
    }

    // Prepare JSON payload for the Python microservice
    const forwardPayload = {
      imageBase64: rawImage,
      skin_tone: tone,
      skin_lab: lab,
    };

    console.log(`[Express API] Proxying recommendation request to Python engine at ${PYTHON_RECOM_URL}/recommend`);

    // Forward request to local Python FastAPI recommendation server
    const pythonResponse = await fetch(`${PYTHON_RECOM_URL}/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(forwardPayload),
      signal: AbortSignal.timeout(12000),
    });

    const data = await pythonResponse.json();

    if (!pythonResponse.ok) {
      console.warn(`[Express API] Python service returned HTTP ${pythonResponse.status}:`, data);
      return res.status(pythonResponse.status).json(data);
    }

    // Seamlessly return parsed JSON match scores to Next.js client
    return res.json(data);
  } catch (err) {
    console.error('[Express API] Error connecting to Python recommendation engine:', err.message);

    // If Python service is unreachable, return a clear 503 response
    return res.status(503).json({
      success: false,
      error: 'Python recommendation microservice is unreachable.',
      details: err.message,
      target: `${PYTHON_RECOM_URL}/recommend`,
    });
  }
});

export default router;
