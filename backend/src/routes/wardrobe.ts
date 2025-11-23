import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getWardrobe, addWardrobeItem, getPurchaseHistory, savePurchaseHistory } from '../services/storage';
import { ClothingItem } from '../types';

const router = Router();
const upload = multer({ dest: path.join(process.cwd(), 'backend/uploads') });

// Get wardrobe
router.get('/', async (req, res) => {
  try {
    const wardrobe = await getWardrobe();
    res.json(wardrobe);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add wardrobe item
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const { type, color, brand, purchaseDate } = req.body;

    if (!type || !color) {
      return res.status(400).json({ error: 'Missing required fields: type, color' });
    }

    const item: ClothingItem = {
      id: `item-${Date.now()}`,
      type: type as ClothingItem['type'],
      imageUrl: `/uploads/${req.file.filename}`,
      color,
      brand: brand || undefined,
      purchaseDate: purchaseDate || undefined,
    };

    await addWardrobeItem(item);
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get purchase history
router.get('/purchase-history', async (req, res) => {
  try {
    const history = await getPurchaseHistory();
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add to purchase history
router.post('/purchase-history', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const { type, color, brand, purchaseDate } = req.body;

    if (!type || !color) {
      return res.status(400).json({ error: 'Missing required fields: type, color' });
    }

    const item: ClothingItem = {
      id: `purchase-${Date.now()}`,
      type: type as ClothingItem['type'],
      imageUrl: `/uploads/${req.file.filename}`,
      color,
      brand: brand || undefined,
      purchaseDate: purchaseDate || new Date().toISOString(),
    };

    const history = await getPurchaseHistory();
    history.push(item);
    await savePurchaseHistory(history);
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

