import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getUser, saveUser } from '../services/storage';

const router = Router();
const upload = multer({ dest: path.join(process.cwd(), 'backend/uploads') });

// Get user
router.get('/', async (req, res) => {
  try {
    const user = await getUser();
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Upload user photo
router.post('/photo', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const photoUrl = `/uploads/${req.file.filename}`;
    const user = await getUser();
    
    const userData = {
      id: user?.id || `user-${Date.now()}`,
      photoUrl,
      createdAt: user?.createdAt || new Date().toISOString(),
    };

    await saveUser(userData);
    res.json(userData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

