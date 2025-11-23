import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import userRoutes from './routes/user';
import outfitsRoutes from './routes/outfits';
import wardrobeRoutes from './routes/wardrobe';
import falRoutes from './routes/fal';
import datasetRoutes from './routes/dataset';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Get Railway public URL or use environment variable
// Railway provides RAILWAY_PUBLIC_DOMAIN automatically
const RAILWAY_PUBLIC_DOMAIN = process.env.RAILWAY_PUBLIC_DOMAIN;
const RAILWAY_ENVIRONMENT = process.env.RAILWAY_ENVIRONMENT;
const PUBLIC_URL = process.env.PUBLIC_URL || 
  (RAILWAY_PUBLIC_DOMAIN ? `https://${RAILWAY_PUBLIC_DOMAIN}` : null) ||
  `http://localhost:${PORT}`;

// Frontend URL - in production, use the same domain or set FRONTEND_URL
const FRONTEND_URL = process.env.FRONTEND_URL || 
  (RAILWAY_PUBLIC_DOMAIN ? `https://${RAILWAY_PUBLIC_DOMAIN}` : 'http://localhost:5173');

// Set PUBLIC_URL in environment for fal.ai service
process.env.PUBLIC_URL = PUBLIC_URL;

console.log('Server Configuration:');
console.log(`  PORT: ${PORT}`);
console.log(`  PUBLIC_URL: ${PUBLIC_URL}`);
console.log(`  FRONTEND_URL: ${FRONTEND_URL}`);
console.log(`  RAILWAY_PUBLIC_DOMAIN: ${RAILWAY_PUBLIC_DOMAIN || 'Not set'}`);

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
const uploadsPath = path.join(process.cwd(), 'backend/uploads');
app.use('/uploads', express.static(uploadsPath));

// Serve dataset images
const datasetPath = path.join(process.cwd(), 'backend/dataset');
app.use('/dataset', express.static(datasetPath));

// Ensure directories exist
[uploadsPath, datasetPath].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Routes
app.use('/api/user', userRoutes);
app.use('/api/outfits', outfitsRoutes);
app.use('/api/wardrobe', wardrobeRoutes);
app.use('/api/fal', falRoutes);
app.use('/api/dataset', datasetRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    publicUrl: PUBLIC_URL,
    railwayDomain: RAILWAY_PUBLIC_DOMAIN || 'Not set',
  });
});

// Auto-load dataset on server start (if wardrobe is empty)
async function autoLoadDataset() {
  try {
    const { getWardrobe } = await import('./services/storage');
    const { getDataset, loadDatasetIntoWardrobe } = await import('./services/datasetService');
    
    const wardrobe = await getWardrobe();
    const dataset = await getDataset();
    
    // Only auto-load if wardrobe is empty and dataset exists
    if (wardrobe.length === 0 && dataset.length > 0) {
      console.log(`📦 Auto-loading ${dataset.length} items from dataset into wardrobe...`);
      const count = await loadDatasetIntoWardrobe();
      console.log(`✅ Auto-loaded ${count} items into wardrobe`);
    } else if (wardrobe.length > 0) {
      console.log(`ℹ️  Wardrobe already has ${wardrobe.length} items, skipping auto-load`);
    } else if (dataset.length === 0) {
      console.log(`ℹ️  Dataset is empty, skipping auto-load. Run 'npm run download-dataset' to populate.`);
    }
  } catch (error: any) {
    console.error('⚠️  Failed to auto-load dataset:', error.message);
    // Don't throw - allow server to start even if auto-load fails
  }
}

// Serve frontend in production (if built and exists)
// This allows single-service deployment on Railway
if (process.env.NODE_ENV === 'production') {
  const frontendDist = path.join(process.cwd(), '../frontend/dist');
  const frontendDistAlt = path.join(process.cwd(), 'frontend/dist');
  const distPath = fs.existsSync(frontendDist) ? frontendDist : 
                   fs.existsSync(frontendDistAlt) ? frontendDistAlt : null;
  
  if (distPath) {
    console.log(`Serving frontend from: ${distPath}`);
    app.use(express.static(distPath));
    // Fallback to index.html for SPA routing (must be after API routes)
    app.get('*', (req, res, next) => {
      // Don't serve frontend for API routes
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    console.log('Frontend dist not found, serving API only');
  }
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Public URL: ${PUBLIC_URL}`);
  if (RAILWAY_PUBLIC_DOMAIN) {
    console.log(`Railway deployment detected: https://${RAILWAY_PUBLIC_DOMAIN}`);
  }
  
  // Auto-load dataset if wardrobe is empty (non-blocking)
  autoLoadDataset().catch(err => {
    console.error('Auto-load dataset error:', err);
  });
});

