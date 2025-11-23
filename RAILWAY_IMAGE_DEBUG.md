# Railway Image Generation Debugging

## Quick Checks

### 1. Verify Setup
```bash
curl https://web-production-fd6cc.up.railway.app/api/fal/test
```

Should show:
- `hasApiKey: true`
- `canGenerateImages: true`
- `isLocalhost: false`

### 2. Check Railway Logs

In Railway dashboard:
1. Go to your service
2. Click "Logs" tab
3. Look for:
   - `🎨 Generating try-on for outfit...`
   - `✅ Successfully generated try-on image`
   - `❌ Failed to generate try-on`

### 3. Test Image Generation Directly

```bash
curl -X POST https://web-production-fd6cc.up.railway.app/api/fal/test-generation \
  -H "Content-Type: application/json" \
  -d '{
    "userPhotoUrl": "https://example.com/user.jpg",
    "clothingItemUrl": "https://example.com/clothing.jpg"
  }'
```

Replace URLs with publicly accessible image URLs.

### 4. Check if User Photo is Uploaded

```bash
curl https://web-production-fd6cc.up.railway.app/api/user
```

Should return user with `photoUrl`.

### 5. Check if Dataset is Loaded

```bash
curl https://web-production-fd6cc.up.railway.app/api/wardrobe | jq 'length'
```

Should return number of items (should be > 0).

### 6. Check Outfit Suggestions Response

```bash
curl "https://web-production-fd6cc.up.railway.app/api/outfits/suggestions?count=1" | jq '.[0] | {id, tryOnImageUrl, items: .items[0].imageUrl}'
```

Check if `tryOnImageUrl` is present.

## Common Issues

### Issue 1: No User Photo
**Symptom:** Logs show "⚠️ Skipping try-on generation: No user photo available"

**Fix:** Upload a user photo via the frontend

### Issue 2: No Dataset Items
**Symptom:** No outfit suggestions or empty wardrobe

**Fix:** Load dataset:
```bash
curl -X POST https://web-production-fd6cc.up.railway.app/api/dataset/load-into-wardrobe
```

### Issue 3: Image Generation Timeout
**Symptom:** Logs show timeout errors

**Possible causes:**
- fal.ai API is slow
- Images are too large
- Network issues

**Fix:** Check Railway logs for specific error messages

### Issue 4: fal.ai API Error
**Symptom:** Logs show fal.ai API errors

**Check:**
- Verify FAL_API_KEY is correct in Railway variables
- Check fal.ai dashboard for API usage/errors
- Verify image URLs are publicly accessible

### Issue 5: Images Not Accessible
**Symptom:** Error about images not being accessible

**Check:**
- User photo URL: `https://web-production-fd6cc.up.railway.app/uploads/...`
- Clothing URL: `https://web-production-fd6cc.up.railway.app/dataset/images/...`

Both should be accessible in browser.

## Next Steps

1. Check Railway logs for detailed error messages
2. Test image generation with `/api/fal/test-generation`
3. Verify user photo and dataset are loaded
4. Check fal.ai dashboard for API issues

