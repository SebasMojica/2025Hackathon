import { Router } from 'express';
import { generateVirtualTryOn } from '../services/falService';

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

export default router;

