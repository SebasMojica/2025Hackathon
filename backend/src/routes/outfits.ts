import { Router } from 'express';
import { generateOutfitSuggestions } from '../services/suggestionEngine';
import { saveSwipeAction } from '../services/storage';

const router = Router();

// Get outfit suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const count = parseInt(req.query.count as string) || 5;
    const outfits = await generateOutfitSuggestions(count);
    res.json(outfits);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Record swipe action
router.post('/swipe', async (req, res) => {
  try {
    const { outfitId, direction } = req.body;
    
    if (!outfitId || !direction || !['left', 'right'].includes(direction)) {
      return res.status(400).json({ error: 'Invalid swipe data' });
    }

    const action = {
      outfitId,
      direction,
      timestamp: new Date().toISOString(),
    };

    await saveSwipeAction(action);
    res.json({ success: true, action });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

