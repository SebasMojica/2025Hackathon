# Railway Deployment Guide

This guide will help you deploy the Virtual Try-On Fashion App to Railway.

## Architecture

Railway will deploy:
- **Backend**: Node.js/Express server (port 3001)
- **Frontend**: Vite/React app (can be served from backend or separate service)

## Prerequisites

1. **Railway Account**: Sign up at https://railway.app
2. **GitHub Repository**: Your code should be pushed to GitHub
3. **fal.ai API Key**: Get from https://fal.ai

## Deployment Steps

### Option 1: Deploy Backend Only (Recommended for MVP)

1. **Create New Project on Railway**
   - Go to https://railway.app/new
   - Click "Deploy from GitHub repo"
   - Select your repository

2. **Configure Backend Service**
   - Railway will auto-detect Node.js
   - Root directory: Leave as `/` (or set to `backend/` if needed)
   - Build command: `cd backend && npm install && npm run build`
   - Start command: `cd backend && npm start`

3. **Set Environment Variables**
   In Railway dashboard, go to Variables tab and add:
   ```
   FAL_API_KEY=your_fal_api_key_here
   PORT=3001
   NODE_ENV=production
   ```
   
   Railway automatically sets:
   - `RAILWAY_PUBLIC_DOMAIN` - Your public domain
   - `PORT` - Port to listen on

4. **Deploy Frontend Separately** (or serve from backend)
   - Option A: Deploy to Vercel/Netlify
   - Option B: Serve static files from backend (see below)

### Option 2: Deploy Both Backend + Frontend

1. **Backend Service** (as above)

2. **Frontend Service**
   - Add another service in Railway
   - Root directory: `frontend/`
   - Build command: `npm install && npm run build`
   - Start command: `npm run preview`
   - Set environment variable:
     ```
     VITE_API_URL=https://your-backend-service.railway.app
     ```

3. **Update CORS**
   - In backend, set `FRONTEND_URL` to your frontend Railway URL

## Serving Frontend from Backend (Single Service)

To serve the frontend from the backend (single Railway service):

1. **Update backend/server.ts** to serve static files:
   ```typescript
   // Serve frontend build
   app.use(express.static(path.join(process.cwd(), '../frontend/dist')));
   
   // Fallback to index.html for SPA routing
   app.get('*', (req, res) => {
     res.sendFile(path.join(process.cwd(), '../frontend/dist/index.html'));
   });
   ```

2. **Build frontend before deploying**:
   ```bash
   cd frontend && npm run build
   ```

3. **Update Railway build command**:
   ```
   cd frontend && npm install && npm run build && cd ../backend && npm install && npm run build
   ```

## Environment Variables

### Required
- `FAL_API_KEY` - Your fal.ai API key

### Optional (Auto-detected by Railway)
- `PORT` - Railway sets this automatically
- `RAILWAY_PUBLIC_DOMAIN` - Railway sets this automatically
- `PUBLIC_URL` - Auto-set from RAILWAY_PUBLIC_DOMAIN
- `FRONTEND_URL` - Set if frontend is on different domain

## Dataset Setup

The dataset needs to be loaded after deployment:

1. **Option A: Load via Railway CLI**
   ```bash
   railway run npm run download-dataset
   railway run curl -X POST https://your-app.railway.app/api/dataset/load-into-wardrobe
   ```

2. **Option B: Load via API** (after deployment)
   ```bash
   curl -X POST https://your-app.railway.app/api/dataset/load-into-wardrobe
   ```

3. **Option C: Pre-load dataset** (add to build script)
   - Add dataset images to repository (if small enough)
   - Or use Railway volumes for persistent storage

## Persistent Storage

Railway provides ephemeral storage by default. For persistent data:

1. **Use Railway Volumes** (for dataset/images)
   - Add volume in Railway dashboard
   - Mount to `/backend/dataset/images`
   - Mount to `/backend/uploads`

2. **Or use external storage**:
   - AWS S3
   - Cloudinary
   - Railway's built-in storage

## Post-Deployment Checklist

- [ ] Backend is running and accessible
- [ ] Environment variables are set
- [ ] Dataset is loaded into wardrobe
- [ ] fal.ai API key is configured
- [ ] Frontend can connect to backend
- [ ] CORS is configured correctly
- [ ] Images are publicly accessible (for fal.ai)
- [ ] Health check endpoint works: `https://your-app.railway.app/api/health`

## Testing Deployment

1. **Check health:**
   ```bash
   curl https://your-app.railway.app/api/health
   ```

2. **Check fal.ai setup:**
   ```bash
   curl https://your-app.railway.app/api/fal/test
   ```

3. **Test try-on generation:**
   - Upload user photo via frontend
   - View outfits page
   - Try-on images should generate automatically

## Troubleshooting

### Images not generating
- Check `PUBLIC_URL` is set correctly
- Verify fal.ai API key is valid
- Check Railway logs for errors

### CORS errors
- Set `FRONTEND_URL` to your frontend domain
- Check CORS configuration in server.ts

### Dataset not loading
- Run download script via Railway CLI
- Check file permissions
- Verify dataset directory exists

### Build failures
- Check Node.js version (Railway auto-detects)
- Verify all dependencies in package.json
- Check build logs in Railway dashboard

## Railway-Specific Features

Railway automatically provides:
- HTTPS/SSL certificates
- Public domain (or custom domain)
- Environment variables
- Logs and monitoring
- Auto-deploy from GitHub

## Cost Considerations

- Railway free tier: $5 credit/month
- Pay-as-you-go after free tier
- Consider dataset storage costs
- fal.ai API usage costs

## Next Steps

1. Deploy backend to Railway
2. Set environment variables
3. Load dataset
4. Deploy frontend (separate service or from backend)
5. Test all features
6. Set up custom domain (optional)
7. Monitor usage and costs

