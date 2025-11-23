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

export default router;

