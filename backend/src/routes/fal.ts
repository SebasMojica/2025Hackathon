import { Router } from 'express';
import { generateVirtualTryOn, generateMultipleAngles } from '../services/falService';

const router = Router();

// Generate try-on image
router.post('/try-on', async (req, res) => {
  try {
    const { userPhotoUrl, clothingItemUrl } = req.body;

    if (!userPhotoUrl || !clothingItemUrl) {
      return res.status(400).json({ error: 'Missing userPhotoUrl or clothingItemUrl' });
    }

    const resultImageUrl = await generateVirtualTryOn(userPhotoUrl, clothingItemUrl);
    res.json({ imageUrl: resultImageUrl });
  } catch (error: any) {
    console.error('Try-on generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate multiple angles for try-on
router.post('/try-on/angles', async (req, res) => {
  try {
    const { userPhotoUrl, clothingItemUrl, angles } = req.body;

    if (!userPhotoUrl || !clothingItemUrl) {
      return res.status(400).json({ error: 'Missing userPhotoUrl or clothingItemUrl' });
    }

    const defaultAngles = ['front', 'side', 'back'];
    const requestedAngles = angles || defaultAngles;

    const imageUrls = await generateMultipleAngles(userPhotoUrl, clothingItemUrl, requestedAngles);
    res.json({ imageUrls });
  } catch (error: any) {
    console.error('Multi-angle generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint to verify fal.ai setup
router.get('/test', async (req, res) => {
  const hasApiKey = !!process.env.FAL_API_KEY;
  const publicUrl = process.env.PUBLIC_URL || process.env.FRONTEND_URL?.replace(':5173', ':3001') || 'http://localhost:3001';
  
  res.json({
    hasApiKey,
    publicUrl,
    message: hasApiKey 
      ? 'fal.ai API key is configured. Make sure PUBLIC_URL is set for image generation to work.'
      : 'FAL_API_KEY is not set in .env file',
    note: 'Images must be publicly accessible for fal.ai to generate try-on images. Use ngrok or deploy to a public server.',
  });
});

export default router;

