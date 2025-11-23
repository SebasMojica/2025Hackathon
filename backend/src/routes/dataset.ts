import { Router } from 'express';
import { getDataset, loadDatasetIntoWardrobe } from '../services/datasetService';

const router = Router();

// Get dataset items
router.get('/', async (req, res) => {
  try {
    const items = await getDataset();
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Load dataset into wardrobe (for initial setup)
router.post('/load-into-wardrobe', async (req, res) => {
  try {
    const count = await loadDatasetIntoWardrobe();
    res.json({ 
      success: true, 
      message: `Loaded ${count} items into wardrobe`,
      count 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Replace wardrobe with dataset (removes old items)
router.post('/replace-wardrobe', async (req, res) => {
  try {
    const { getWardrobe, saveWardrobe } = await import('../services/storage');
    const { getDataset } = await import('../services/datasetService');
    
    const dataset = await getDataset();
    if (dataset.length === 0) {
      return res.status(400).json({ error: 'Dataset is empty. Please run the download script first.' });
    }

    await saveWardrobe(dataset);
    res.json({ 
      success: true, 
      message: `Replaced wardrobe with ${dataset.length} items from dataset`,
      count: dataset.length 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

