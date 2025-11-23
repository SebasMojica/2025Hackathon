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
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'backend/uploads')));

// Serve dataset images
app.use('/dataset', express.static(path.join(process.cwd(), 'backend/dataset')));

// Routes
app.use('/api/user', userRoutes);
app.use('/api/outfits', outfitsRoutes);
app.use('/api/wardrobe', wardrobeRoutes);
app.use('/api/fal', falRoutes);
app.use('/api/dataset', datasetRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve frontend static files in production
const frontendDistPath = path.join(process.cwd(), 'frontend', 'dist');
const frontendExists = fs.existsSync(frontendDistPath);

if (frontendExists) {
  // Serve static files from frontend/dist
  app.use(express.static(frontendDistPath));
  
  // Catch-all handler: send back React's index.html file for SPA routing
  app.get('*', (req, res) => {
    // Don't handle API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  if (frontendExists) {
    console.log('Frontend static files are being served from frontend/dist');
  }
});

