import express from 'express';
import { processTryon, recommendShade } from '../controllers/tryonController.js';

const router = express.Router();

// POST /api/tryon - Virtual try-on telemetry/sync endpoint
router.post('/', processTryon);

// POST /api/tryon/recommend - Proxy endpoint to Python shade recommendation microservice
router.post('/recommend', recommendShade);

export default router;
