# Railway Deployment Fixes

## Issues Fixed

### 1. Frontend Path Resolution
- Added multiple path checks for frontend dist directory
- Handles different deployment scenarios (root vs backend/ directory)
- Better error logging if frontend not found

### 2. CORS Configuration
- Updated CORS to work better with Railway's dynamic domains
- Allows all origins in production if FRONTEND_URL not explicitly set
- Maintains security while being flexible

### 3. Build Process
- Ensured both frontend and backend are built correctly
- Added `--production=false` to install dev dependencies needed for build

### 4. Environment Variables
Railway automatically provides:
- `RAILWAY_PUBLIC_DOMAIN` - Your public domain
- `PORT` - Port to listen on
- `NODE_ENV=production` (if set)

You need to set:
- `FAL_API_KEY` - Your fal.ai API key

## Deployment Checklist

### Before Deploying

1. **Set Environment Variables in Railway:**
   ```
   FAL_API_KEY=your_fal_api_key_here
   NODE_ENV=production
   ```

2. **Verify Build Process:**
   - Frontend builds to `frontend/dist`
   - Backend builds to `backend/dist`
   - Both are included in Railway build

3. **Check Paths:**
   - Railway runs from project root
   - Frontend dist should be at `frontend/dist`
   - Backend dist should be at `backend/dist`

### After Deploying

1. **Check Health:**
   ```bash
   curl https://your-app.railway.app/api/health
   ```

2. **Check fal.ai Setup:**
   ```bash
   curl https://your-app.railway.app/api/fal/test
   ```
   Should show:
   - `hasApiKey: true`
   - `canGenerateImages: true`
   - `isLocalhost: false`

3. **Load Dataset:**
   ```bash
   # Option 1: Via Railway CLI
   railway run npm run download-dataset
   railway run curl -X POST https://your-app.railway.app/api/dataset/load-into-wardrobe
   
   # Option 2: Via API (after deployment)
   curl -X POST https://your-app.railway.app/api/dataset/load-into-wardrobe
   ```

4. **Test Frontend:**
   - Visit your Railway URL
   - Should see the React app
   - Upload a user photo
   - Browse outfit suggestions
   - Try-on images should generate

## Troubleshooting

### Frontend Not Loading
- Check Railway logs for path errors
- Verify `frontend/dist` exists after build
- Check that build completed successfully

### Images Not Generating
- Verify `FAL_API_KEY` is set
- Check `/api/fal/test` endpoint
- Ensure `PUBLIC_URL` is set (Railway auto-sets this)
- Check Railway logs for fal.ai errors

### CORS Errors
- Set `FRONTEND_URL` if frontend is on different domain
- Or leave unset to allow all origins (less secure but works)

### Dataset Not Loading
- Dataset needs to be downloaded after deployment
- Use Railway CLI or API endpoint
- Check file permissions in Railway

## Railway-Specific Features

✅ **Automatic HTTPS** - Railway provides SSL certificates
✅ **Public Domain** - Railway provides public domain automatically
✅ **Environment Variables** - Set in Railway dashboard
✅ **Auto-Deploy** - Deploys on git push
✅ **Logs** - View logs in Railway dashboard
✅ **Health Checks** - Railway monitors `/api/health`

## Next Steps

1. Deploy to Railway
2. Set `FAL_API_KEY` environment variable
3. Load dataset after first deployment
4. Test all features
5. Monitor logs for any issues

