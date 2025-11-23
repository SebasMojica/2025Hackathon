# fal.ai Virtual Try-On Setup Guide

## Problem: Images Not Generating

fal.ai requires **publicly accessible image URLs** to generate try-on images. Since your server runs on `localhost`, fal.ai cannot access your images.

## Solution Options

### Option 1: Use ngrok (Recommended for Development)

1. **Install ngrok:**
   ```bash
   # macOS
   brew install ngrok
   
   # Or download from https://ngrok.com/download
   ```

2. **Start your backend server:**
   ```bash
   cd backend
   npm run dev
   ```

3. **In a new terminal, expose your server:**
   ```bash
   ngrok http 3001
   ```

4. **Copy the ngrok URL** (e.g., `https://abc123.ngrok.io`)

5. **Update your `.env` file:**
   ```env
   FAL_API_KEY=your_fal_api_key_here
   PORT=3001
   FRONTEND_URL=http://localhost:5173
   PUBLIC_URL=https://abc123.ngrok.io  # Add this line with your ngrok URL
   ```

6. **Restart your backend server**

### Option 2: Deploy to a Public Server

Deploy your backend to a service like:
- Heroku
- Railway
- Render
- DigitalOcean

Then set `PUBLIC_URL` to your deployed URL.

### Option 3: Use Cloud Storage

Upload images to:
- AWS S3
- Cloudinary
- ImgBB
- Other cloud storage

Then use those public URLs directly.

## Testing fal.ai Connection

1. **Check your API key:**
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **Test try-on generation:**
   ```bash
   curl -X POST http://localhost:3001/api/fal/try-on \
     -H "Content-Type: application/json" \
     -d '{
       "userPhotoUrl": "https://example.com/user.jpg",
       "clothingItemUrl": "https://example.com/clothing.jpg"
     }'
   ```

## Troubleshooting

### Error: "FAL_API_KEY is not configured"
- Make sure `FAL_API_KEY` is set in `backend/.env`
- Restart your server after updating `.env`

### Error: "Failed to generate try-on"
- Check that images are publicly accessible (not localhost)
- Verify your fal.ai API key is valid
- Check server logs for detailed error messages

### Images show placeholder
- fal.ai couldn't access your images
- Make sure `PUBLIC_URL` is set correctly
- Verify ngrok is running and URL is correct

## Current Status

- ✅ User photo uploaded: Check `/api/user`
- ✅ Clothing items loaded: Check `/api/wardrobe`
- ⚠️  Public URL needed: Set `PUBLIC_URL` in `.env`
- ⚠️  fal.ai API key: Set `FAL_API_KEY` in `.env`

## Next Steps

1. Set up ngrok or deploy your server
2. Update `PUBLIC_URL` in `.env`
3. Restart backend server
4. Try generating try-on images again

