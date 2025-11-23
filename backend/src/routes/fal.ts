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

// Test image generation with sample URLs
router.post('/test-generation', async (req, res) => {
  try {
    const { userPhotoUrl, clothingItemUrl } = req.body;
    
    if (!userPhotoUrl || !clothingItemUrl) {
      return res.status(400).json({ 
        error: 'Missing userPhotoUrl or clothingItemUrl',
        example: {
          userPhotoUrl: 'https://example.com/user.jpg',
          clothingItemUrl: 'https://example.com/clothing.jpg'
        }
      });
    }

    console.log('🧪 Testing image generation...');
    console.log('   User photo:', userPhotoUrl);
    console.log('   Clothing:', clothingItemUrl);
    
    const result = await generateVirtualTryOn(userPhotoUrl, clothingItemUrl);
    
    res.json({ 
      success: true, 
      imageUrl: result,
      message: 'Image generation successful!'
    });
  } catch (error: any) {
    console.error('Test generation error:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.stack
    });
  }
});

// Test endpoint to verify fal.ai setup
router.get('/test', async (req, res) => {
  const hasApiKey = !!process.env.FAL_API_KEY;
  const publicUrl = process.env.PUBLIC_URL || process.env.FRONTEND_URL?.replace(':5173', ':3001') || 'http://localhost:3001';
  const isLocalhost = publicUrl.includes('localhost') || publicUrl.includes('127.0.0.1');
  
  res.json({
    hasApiKey,
    publicUrl,
    isLocalhost,
    canGenerateImages: hasApiKey && !isLocalhost,
    message: !hasApiKey 
      ? '❌ FAL_API_KEY is not set in .env file'
      : isLocalhost
      ? '⚠️  PUBLIC_URL is localhost - fal.ai cannot access localhost images. Use ngrok or deploy to Railway.'
      : '✅ Setup looks good! Images should generate.',
    instructions: isLocalhost ? [
      'Option 1: Use ngrok (for development)',
      '  1. Install: brew install ngrok',
      '  2. Run: ngrok http 3001',
      '  3. Copy the ngrok URL and set PUBLIC_URL in .env',
      '  4. Restart backend server',
      '',
      'Option 2: Deploy to Railway (for production)',
      '  - Railway automatically sets PUBLIC_URL',
      '  - See RAILWAY_QUICK_START.md for instructions'
    ] : [],
  });
});

export default router;

