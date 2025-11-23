# Try-On Image Generation Service

## Overview

The application now includes a dedicated web service that generates virtual try-on images using fal.ai. When users upload their photo and clothing items are available, the system automatically generates images showing the user wearing the clothing items. These images are displayed in the swipeable outfit cards.

## How It Works

### Automatic Generation (Recommended)

When outfit suggestions are generated:
1. The backend checks if a user photo is available
2. For each outfit, it generates a try-on image using fal.ai
3. The generated image URL is stored in `outfit.tryOnImageUrl`
4. The frontend automatically displays these images in the swipe cards

**No additional action needed** - this happens automatically when browsing outfits!

### Manual Generation via API

If you need to generate try-on images manually, use the new endpoint:

#### Endpoint: `POST /api/fal/generate-from-upload`

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `userPhoto`: File (required) - User's photo
  - `clothingItem`: File (required) - Clothing item image

**Response:**
```json
{
  "success": true,
  "imageUrl": "https://fal.ai/generated-image-url.jpg",
  "message": "Try-on image generated successfully"
}
```

**Example using curl:**
```bash
curl -X POST http://localhost:3001/api/fal/generate-from-upload \
  -F "userPhoto=@/path/to/user-photo.jpg" \
  -F "clothingItem=@/path/to/clothing-item.jpg"
```

**Example using JavaScript:**
```javascript
const formData = new FormData();
formData.append('userPhoto', userPhotoFile);
formData.append('clothingItem', clothingItemFile);

const response = await fetch('/api/fal/generate-from-upload', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
console.log('Generated image:', result.imageUrl);
```

## Frontend Integration

The frontend API service includes a helper method:

```typescript
import { falApi } from './services/api';

// Generate try-on from file uploads
const imageUrl = await falApi.generateFromUpload(userPhotoFile, clothingItemFile);
```

## Display in Swipe Cards

Generated try-on images are automatically displayed in the swipe cards:

1. **Pre-generated images**: When outfits are fetched, if `tryOnImageUrl` is present, it's displayed immediately
2. **Fallback generation**: If no pre-generated image exists, the frontend can generate on-demand
3. **Loading states**: The UI shows loading indicators while images are being generated

## Configuration

### Environment Variables

- `FAL_API_KEY`: Your fal.ai API key (required)
- `PUBLIC_URL`: Public URL of your server (required for fal.ai to access uploaded images)
  - Automatically set on Railway
  - For local development, use ngrok or set manually

### File Upload Limits

- Maximum file size: 10MB per file
- Supported formats: JPEG, PNG, WebP
- Files are temporarily stored in `backend/uploads/`

## Troubleshooting

### Images not generating?

1. **Check fal.ai API key**: Ensure `FAL_API_KEY` is set in environment variables
2. **Check PUBLIC_URL**: fal.ai needs publicly accessible URLs. On Railway, this is automatic. For local development, use ngrok.
3. **Check file uploads**: Ensure files are being uploaded correctly and are accessible
4. **Check logs**: Backend logs will show detailed error messages

### Test the service:

```bash
# Test fal.ai setup
curl http://localhost:3001/api/fal/test

# Test image generation with sample URLs
curl -X POST http://localhost:3001/api/fal/test-generation \
  -H "Content-Type: application/json" \
  -d '{
    "userPhotoUrl": "https://example.com/user.jpg",
    "clothingItemUrl": "https://example.com/clothing.jpg"
  }'
```

## Architecture

```
User Uploads Photo
    ↓
Backend stores photo → /uploads/user-photo.jpg
    ↓
User browses outfits
    ↓
Backend generates outfit suggestions
    ↓
For each outfit:
    - Get user photo URL
    - Get clothing item URL
    - Call fal.ai API
    - Store generated image URL in outfit.tryOnImageUrl
    ↓
Frontend receives outfits with tryOnImageUrl
    ↓
OutfitSwipe component displays generated images
```

## Notes

- Generated images are hosted by fal.ai and returned as URLs
- Images are generated asynchronously - the backend polls for results
- Timeout is set to 30 seconds per image generation
- If generation fails, outfits are still returned without try-on images
- The frontend gracefully handles missing images

