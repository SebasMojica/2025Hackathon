import axios from 'axios';

const FAL_API_KEY = process.env.FAL_API_KEY || '';
const FAL_API_URL = 'https://fal.run';

export interface TryOnRequest {
  userPhotoUrl: string;
  clothingItemUrl: string;
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

// Alternative: Use a dedicated virtual try-on model if available
export async function generateVirtualTryOn(
  userPhotoUrl: string,
  clothingItemUrl: string
): Promise<string> {
  if (!FAL_API_KEY) {
    throw new Error('FAL_API_KEY is not configured');
  }

  try {
    // This would use a specific virtual try-on model endpoint
    // You'll need to check fal.ai's documentation for the correct model
    // Example: fal-ai/idm-vton or other virtual try-on models
    const response = await axios.post(
      `${FAL_API_URL}/fal-ai/idm-vton`,
      {
        person_image: userPhotoUrl,
        garment_image: clothingItemUrl,
      },
      {
        headers: {
          'Authorization': `Key ${FAL_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Handle async response if needed
    if (response.data.request_id) {
      // Poll for result if async
      // This is a simplified version - adjust based on actual API
      return response.data.image_url || '';
    }

    return response.data.result?.image_url || response.data.image_url || '';
  } catch (error: any) {
    console.error('Virtual try-on error:', error.response?.data || error.message);
    // Fallback to basic generation if specific model fails
    try {
      return await generateTryOn({ userPhotoUrl, clothingItemUrl });
    } catch (fallbackError) {
      throw new Error(`Failed to generate try-on: ${error.message}`);
    }
  }
}

