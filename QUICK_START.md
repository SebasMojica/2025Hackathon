# Quick Start Guide - Running the Web App

## 🚀 Quick Start (Local Development)

### Step 1: Install Dependencies

Open two terminal windows/tabs:

**Terminal 1 - Backend:**
```bash
cd backend
npm install
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
```

### Step 2: Set Up Environment Variables

Create or update `backend/.env` file:

```bash
cd backend
```

Create `.env` file with:
```env
FAL_API_KEY=your_fal_api_key_here
PORT=3001
FRONTEND_URL=http://localhost:5173
PUBLIC_URL=http://localhost:3001
```

**Note:** For local development with fal.ai, you'll need to use ngrok (see below) or deploy to Railway for image generation to work.

### Step 3: Run the Application

**Terminal 1 - Start Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
Server running on port 3001
Public URL: http://localhost:3001
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 4: Open in Browser

Open your browser and go to:
```
http://localhost:5173
```

## 📋 Complete Setup Checklist

### Prerequisites
- [ ] Node.js v20+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] fal.ai API key (get from https://fal.ai)

### Installation
- [ ] Backend dependencies installed (`cd backend && npm install`)
- [ ] Frontend dependencies installed (`cd frontend && npm install`)
- [ ] `.env` file created in `backend/` directory
- [ ] `FAL_API_KEY` set in `.env` file

### Running
- [ ] Backend server running (`npm run dev` in `backend/`)
- [ ] Frontend server running (`npm run dev` in `frontend/`)
- [ ] Browser opened to `http://localhost:5173`

### Optional: Load Dataset
- [ ] Dataset downloaded (`npm run download-dataset` in `backend/`)
- [ ] Dataset loaded into wardrobe (via UI or API)

## 🔧 Troubleshooting

### Backend won't start?

1. **Check if port 3001 is in use:**
   ```bash
   lsof -i :3001
   # If something is using it, kill it or change PORT in .env
   ```

2. **Check environment variables:**
   ```bash
   cd backend
   cat .env
   # Make sure FAL_API_KEY is set
   ```

3. **Check for TypeScript errors:**
   ```bash
   cd backend
   npm run build
   ```

### Frontend won't start?

1. **Check if port 5173 is in use:**
   ```bash
   lsof -i :5173
   ```

2. **Clear node_modules and reinstall:**
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

### Images not generating?

1. **Check fal.ai API key:**
   ```bash
   curl http://localhost:3001/api/fal/test
   ```

2. **For local development, you need ngrok:**
   - Install: `brew install ngrok` (Mac) or download from ngrok.com
   - Run: `ngrok http 3001`
   - Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
   - Update `PUBLIC_URL` in `backend/.env`:
     ```env
     PUBLIC_URL=https://abc123.ngrok.io
     ```
   - Restart backend server

3. **Or deploy to Railway** (recommended for production):
   - Railway automatically sets `PUBLIC_URL`
   - See `RAILWAY_QUICK_START.md` for details

## 🌐 Running on Railway (Production)

The app is already configured for Railway deployment!

1. **Push to GitHub** (if not already):
   ```bash
   git push origin main
   ```

2. **Deploy on Railway:**
   - Go to https://railway.app
   - Create new project from GitHub repo
   - Select this repository
   - Add environment variable: `FAL_API_KEY=your_key_here`
   - Railway will auto-deploy

3. **Access your app:**
   - Railway provides a public URL automatically
   - The app will be available at: `https://your-app.railway.app`

## 📝 Common Commands

### Backend Commands
```bash
cd backend

# Development (with hot-reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Download dataset
npm run download-dataset
```

### Frontend Commands
```bash
cd frontend

# Development (with hot-reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎯 First Time Setup

1. **Install dependencies:**
   ```bash
   # Backend
   cd backend && npm install
   
   # Frontend
   cd ../frontend && npm install
   ```

2. **Set up environment:**
   ```bash
   cd ../backend
   # Create .env file (see Step 2 above)
   ```

3. **Get fal.ai API key:**
   - Sign up at https://fal.ai
   - Get your API key from dashboard
   - Add to `backend/.env`

4. **Start both servers:**
   ```bash
   # Terminal 1
   cd backend && npm run dev
   
   # Terminal 2
   cd frontend && npm run dev
   ```

5. **Open browser:**
   - Go to http://localhost:5173
   - Upload your photo
   - Start browsing outfits!

## 🆘 Need Help?

- Check `README.md` for detailed documentation
- Check `RAILWAY_DEPLOYMENT.md` for deployment help
- Check `TRY_ON_SERVICE.md` for try-on image generation details
- Check backend logs for error messages
- Check browser console for frontend errors

