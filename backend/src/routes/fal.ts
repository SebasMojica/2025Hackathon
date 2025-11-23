import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { generateVirtualTryOn, generateMultipleAngles } from '../services/falService';

const router = Router();

// Configure multer for file uploads
const upload = multer({ 
  dest: path.join(process.cwd(), 'backend/uploads'),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

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

// Generate try-on image from file uploads
// This endpoint accepts:
// - userPhoto: file (required) - user's photo
// - clothingItem: file (required) - clothing item to try on
// Returns: { imageUrl: string } - URL of generated try-on image
router.post('/generate-from-upload', upload.fields([
  { name: 'userPhoto', maxCount: 1 },
  { name: 'clothingItem', maxCount: 1 }
]), async (req, res) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    if (!files || !files.userPhoto || !files.userPhoto[0]) {
      return res.status(400).json({ error: 'Missing userPhoto file' });
    }
    
    if (!files || !files.clothingItem || !files.clothingItem[0]) {
      return res.status(400).json({ error: 'Missing clothingItem file' });
    }

    const userPhotoFile = files.userPhoto[0];
    const clothingItemFile = files.clothingItem[0];

    // Get public URLs for the uploaded files
    const baseUrl = process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 3001}`;
    const userPhotoUrl = `${baseUrl}/uploads/${userPhotoFile.filename}`;
    const clothingItemUrl = `${baseUrl}/uploads/${clothingItemFile.filename}`;

    console.log('🎨 Generating try-on from uploaded files...');
    console.log(`   User photo: ${userPhotoUrl}`);
    console.log(`   Clothing item: ${clothingItemUrl}`);

    // Generate try-on image using fal.ai
    const resultImageUrl = await generateVirtualTryOn(userPhotoUrl, clothingItemUrl);

    console.log(`✅ Successfully generated try-on image: ${resultImageUrl}`);

    res.json({ 
      success: true,
      imageUrl: resultImageUrl,
      message: 'Try-on image generated successfully'
    });
  } catch (error: any) {
    console.error('❌ Error generating try-on from upload:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to generate try-on image'
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

