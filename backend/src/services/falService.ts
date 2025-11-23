import axios from 'axios';

const FAL_API_KEY = process.env.FAL_API_KEY || '';
const FAL_API_URL = 'https://fal.run';

// Get PUBLIC_URL from environment (set by server.ts)
// Railway provides RAILWAY_PUBLIC_DOMAIN automatically
const RAILWAY_PUBLIC_DOMAIN = process.env.RAILWAY_PUBLIC_DOMAIN;
const PUBLIC_URL = process.env.PUBLIC_URL || 
  (RAILWAY_PUBLIC_DOMAIN ? `https://${RAILWAY_PUBLIC_DOMAIN}` : null) ||
  process.env.FRONTEND_URL?.replace(':5173', ':3001') || 
  'http://localhost:3001';

export interface TryOnRequest {
  userPhotoUrl: string;
  clothingItemUrl: string;
}

// Convert localhost URLs to publicly accessible URLs
// NOTE: For fal.ai to work, images must be publicly accessible
// Options: 
// 1. Use ngrok: ngrok http 3001 (then set PUBLIC_URL to ngrok URL)
// 2. Deploy to a public server
// 3. Use a cloud storage service (S3, Cloudinary, etc.)
function getPublicUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // If it's already a full URL, check if it's localhost
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      // Replace localhost with PUBLIC_URL if set
      if (PUBLIC_URL && !PUBLIC_URL.includes('localhost')) {
        return url.replace(/https?:\/\/[^/]+/, PUBLIC_URL);
      }
    }
    return url;
  }
  if (url.startsWith('/')) {
    return `${PUBLIC_URL}${url}`;
  }
  return `${PUBLIC_URL}/${url}`;
}

export async function generateTryOn(request: TryOnRequest): Promise<string> {
  if (!FAL_API_KEY) {
    throw new Error('FAL_API_KEY is not configured');
  }

  try {
    // Using fal.ai's virtual try-on model
    // Note: This is a placeholder - you'll need to use the actual fal.ai model endpoint
    // Common models: fal-ai/flux or specific try-on models
    const response = await axios.post(
      `${FAL_API_URL}/fal-ai/flux/schnell`,
      {
        prompt: `A person wearing ${request.clothingItemUrl} in a realistic photo`,
        image_url: request.userPhotoUrl,
      },
      {
        headers: {
          'Authorization': `Key ${FAL_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // The actual response structure depends on fal.ai's API
    // This is a placeholder - adjust based on actual API response
    return response.data.images?.[0]?.url || response.data.image_url || '';
  } catch (error: any) {
    console.error('Error generating try-on:', error.response?.data || error.message);
    throw new Error(`Failed to generate try-on: ${error.message}`);
  }
}

// Use fal.ai's IDM-VTON model for virtual try-on
export async function generateVirtualTryOn(
  userPhotoUrl: string,
  clothingItemUrl: string
): Promise<string> {
  if (!FAL_API_KEY) {
    throw new Error('FAL_API_KEY is not configured');
  }

  // Convert to publicly accessible URLs
  const publicUserUrl = getPublicUrl(userPhotoUrl);
  const publicClothingUrl = getPublicUrl(clothingItemUrl);

  console.log('Generating try-on with:', { publicUserUrl, publicClothingUrl });

  try {
    // Use fal.ai's IDM-VTON model for virtual try-on
    // This model requires person_image and garment_image as public URLs
    const response = await axios.post(
      `${FAL_API_URL}/fal-ai/idm-vton`,
      {
        person_image: publicUserUrl,
        garment_image: publicClothingUrl,
      },
      {
        headers: {
          'Authorization': `Key ${FAL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000, // 60 second timeout for image generation
      }
    );

    console.log('Fal.ai response:', response.data);

    // Handle async response - fal.ai often returns a request_id for async processing
    if (response.data.request_id) {
      // Poll for result
      return await pollForResult(response.data.request_id);
    }

    // Direct response
    const imageUrl = response.data.images?.[0]?.url || 
                     response.data.image?.url ||
                     response.data.result?.image_url || 
                     response.data.image_url || 
                     '';
    
    if (!imageUrl) {
      throw new Error('No image URL in response');
    }

    return imageUrl;
  } catch (error: any) {
    console.error('Virtual try-on error:', error.response?.data || error.message);
    console.error('Full error:', error);
    throw new Error(`Failed to generate try-on: ${error.response?.data?.detail || error.message}`);
  }
}

// Poll for async result
async function pollForResult(requestId: string, maxAttempts: number = 30): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      
      const response = await axios.get(
        `${FAL_API_URL}/fal-ai/idm-vton/requests/${requestId}/status`,
        {
          headers: {
            'Authorization': `Key ${FAL_API_KEY}`,
          },
        }
      );

      if (response.data.status === 'COMPLETED') {
        return response.data.images?.[0]?.url || 
               response.data.image?.url ||
               response.data.result?.image_url || 
               response.data.image_url || 
               '';
      }

      if (response.data.status === 'FAILED') {
        throw new Error('Image generation failed');
      }
    } catch (error: any) {
      if (i === maxAttempts - 1) {
        throw error;
      }
    }
  }

  throw new Error('Timeout waiting for image generation');
}

// Generate multiple angles for try-on
export async function generateMultipleAngles(
  userPhotoUrl: string,
  clothingItemUrl: string,
  angles: string[] = ['front', 'side', 'back']
): Promise<string[]> {
  if (!FAL_API_KEY) {
    throw new Error('FAL_API_KEY is not configured');
  }

  // For now, generate one image and return it multiple times
  // (IDM-VTON doesn't support angle parameters directly)
  // In production, you could use different prompts or models for different angles
  try {
    const singleImage = await generateVirtualTryOn(userPhotoUrl, clothingItemUrl);
    
    // Return the same image for all angles (or generate multiple with slight variations)
    // For a better implementation, you could generate multiple times with different seeds
    return [singleImage, singleImage, singleImage].slice(0, angles.length);
  } catch (error: any) {
    console.error('Error generating multiple angles:', error);
    // Return empty array on error - frontend will handle fallback
    return [];
  }
}

