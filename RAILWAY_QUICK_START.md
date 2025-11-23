# Railway Quick Start Guide

## 🚀 Deploy in 5 Minutes

### Step 1: Connect to Railway

1. Go to https://railway.app
2. Sign up/Login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository: `SebasMojica/2025Hackathon`

### Step 2: Configure Service

Railway will auto-detect Node.js. The configuration is already set up via `nixpacks.toml`:

- **Build**: Automatically builds frontend and backend
- **Start**: Runs `cd backend && npm start`
- **Port**: Railway sets `PORT` automatically

### Step 3: Set Environment Variables

In Railway dashboard → Variables tab, add:

```
FAL_API_KEY=your_fal_api_key_here
NODE_ENV=production
```

**Railway automatically provides:**
- `RAILWAY_PUBLIC_DOMAIN` - Your public domain (e.g., `your-app.railway.app`)
- `PORT` - Port to listen on
- `PUBLIC_URL` - Auto-detected from Railway domain

### Step 4: Deploy

Railway will automatically:
1. Install dependencies
2. Build frontend (`npm run build`)
3. Build backend (`npm run build`)
4. Start server (`npm start`)

### Step 5: Load Dataset

After deployment, load the clothing dataset:

**Option A: Via Railway CLI**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# Download dataset
railway run npm run download-dataset

# Load into wardrobe
railway run curl -X POST https://your-app.railway.app/api/dataset/load-into-wardrobe
```

**Option B: Via API** (after deployment)
```bash
curl -X POST https://your-app.railway.app/api/dataset/load-into-wardrobe
```

### Step 6: Verify Deployment

1. **Check health:**
   ```bash
   curl https://your-app.railway.app/api/health
   ```

2. **Check fal.ai setup:**
   ```bash
   curl https://your-app.railway.app/api/fal/test
   ```

3. **Visit your app:**
   - Frontend: `https://your-app.railway.app` (if frontend is built)
   - Backend API: `https://your-app.railway.app/api`

## 🎯 What's Configured

✅ **Automatic Railway Detection**
- Detects `RAILWAY_PUBLIC_DOMAIN` automatically
- Sets `PUBLIC_URL` for fal.ai image access
- Configures CORS for production

✅ **Single-Service Deployment**
- Frontend is built and served from backend
- One Railway service = full app
- No separate frontend deployment needed

✅ **Production Ready**
- Environment-based configuration
- Health check endpoint
- Error handling
- Static file serving

## 🔧 Troubleshooting

**Build fails:**
- Check Railway logs
- Verify Node.js version (20.x)
- Check `package.json` scripts

**Images not generating:**
- Verify `FAL_API_KEY` is set
- Check `PUBLIC_URL` is correct (auto-set from Railway)
- Check Railway logs for fal.ai errors

**Dataset not loading:**
- Run download script via Railway CLI
- Check file permissions
- Verify dataset directory exists

## 📝 Environment Variables Reference

| Variable | Required | Auto-Set | Description |
|----------|----------|----------|-------------|
| `FAL_API_KEY` | ✅ Yes | ❌ No | fal.ai API key |
| `NODE_ENV` | ⚠️ Recommended | ❌ No | Set to `production` |
| `PORT` | ❌ No | ✅ Yes | Railway sets automatically |
| `RAILWAY_PUBLIC_DOMAIN` | ❌ No | ✅ Yes | Railway provides automatically |
| `PUBLIC_URL` | ❌ No | ✅ Yes | Auto-detected from Railway |
| `FRONTEND_URL` | ❌ No | ✅ Yes | Auto-detected from Railway |

## 🎉 You're Done!

Your app is now live on Railway with:
- ✅ Public HTTPS URL
- ✅ fal.ai integration ready
- ✅ Dataset loading capability
- ✅ All features enabled

Visit your Railway dashboard to see logs, metrics, and manage your deployment!

