# Image Generation Debugging Guide

## Problem: No Images Being Generated

If you're seeing outfit suggestions but no try-on images, here's how to debug:

## Step 1: Check fal.ai Setup

```bash
curl http://localhost:3001/api/fal/test
```

This will tell you:
- ✅ If FAL_API_KEY is set
- ✅ If PUBLIC_URL is configured correctly
- ⚠️  If PUBLIC_URL is localhost (fal.ai can't access localhost)

## Step 2: Check Backend Logs

When you request outfit suggestions, you should see logs like:

```
📋 Generating 5 outfit suggestions...
   User photo URL provided: http://...
🎨 Generating try-on for outfit outfit-123...
   User photo: http://...
   Clothing item: http://...
   PUBLIC_URL: http://localhost:3001
```

If you see errors, they'll show what's wrong.

## Common Issues

### Issue 1: FAL_API_KEY Not Set

**Symptom:** `"hasApiKey": false` in `/api/fal/test`

**Fix:**
1. Get your fal.ai API key from https://fal.ai/dashboard
2. Add to `backend/.env`:
   ```
   FAL_API_KEY=your_key_here
   ```
3. Restart backend server

### Issue 2: PUBLIC_URL is localhost

**Symptom:** `"publicUrl": "http://localhost:3001"` in `/api/fal/test`

**Problem:** fal.ai cannot access images on localhost. You need a public URL.

**Fix Options:**

#### Option A: Use ngrok (Quick for Development)

1. Install ngrok: `brew install ngrok` or download from https://ngrok.com
2. Start your backend: `cd backend && npm run dev`
3. In another terminal: `ngrok http 3001`
4. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
5. Update `backend/.env`:
   ```
   PUBLIC_URL=https://abc123.ngrok.io
   ```
6. Restart backend

#### Option B: Deploy to Railway (Production)

Railway automatically sets `RAILWAY_PUBLIC_DOMAIN` and `PUBLIC_URL`.

### Issue 3: Images Not Accessible

**Symptom:** Error like "Failed to fetch image" or "Image not accessible"

**Check:**
1. Can you access the image URL directly in browser?
   - User photo: `http://localhost:3001/uploads/...`
   - Clothing: `http://localhost:3001/dataset/images/...`
2. If using ngrok, use ngrok URL instead:
   - `https://abc123.ngrok.io/uploads/...`
   - `https://abc123.ngrok.io/dataset/images/...`

### Issue 4: Generation Failing Silently

**Symptom:** No errors in logs, but no images

**Check backend logs for:**
- `❌ Failed to generate try-on` - shows the error
- `⚠️  Skipping try-on generation` - user photo not available
- `✅ Successfully generated try-on image` - success!

## Step 3: Test Image Generation Directly

```bash
curl -X POST http://localhost:3001/api/fal/try-on \
  -H "Content-Type: application/json" \
  -d '{
    "userPhotoUrl": "https://example.com/user.jpg",
    "clothingItemUrl": "https://example.com/clothing.jpg"
  }'
```

Replace URLs with publicly accessible image URLs.

## Step 4: Check Frontend

1. Open browser console (F12)
2. Look for errors when loading outfits
3. Check Network tab for `/api/outfits/suggestions` response
4. Verify response includes `tryOnImageUrl` field

## Quick Fix Checklist

- [ ] FAL_API_KEY is set in `backend/.env`
- [ ] Backend server restarted after .env changes
- [ ] PUBLIC_URL is set (not localhost) OR using Railway
- [ ] User photo is uploaded
- [ ] Wardrobe has items (dataset loaded)
- [ ] Check backend logs for errors
- [ ] Test `/api/fal/test` endpoint

## Still Not Working?

1. Check backend terminal for detailed error messages
2. Run `/api/fal/test` to see configuration status
3. Try generating a single image via `/api/fal/try-on` with public URLs
4. Check fal.ai dashboard for API usage/errors

