import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import { ClothingItem } from '../types';

// Get the correct path - detect if we're in backend/ or root
const cwd = process.cwd();
const BASE_DIR = cwd.endsWith('backend') 
  ? cwd 
  : path.join(cwd, 'backend');
const DATASET_DIR = path.join(BASE_DIR, 'dataset');
const DATASET_IMAGES_DIR = path.join(DATASET_DIR, 'images');

// Using Lorem Picsum for high-quality placeholder images
// These are free, no API key needed, and provide good quality images
const PICSUM_BASE = 'https://picsum.photos/seed';

const colors = ['black', 'white', 'blue', 'red', 'green', 'yellow', 'pink', 'purple', 'gray', 'brown', 'beige', 'navy', 'orange', 'teal'];
const brands = ['Fashion', 'Style', 'Trend', 'Classic', 'Modern', 'Vintage', 'Elite', 'Premium'];

interface CategoryConfig {
  type: ClothingItem['type'];
  count: number;
  seedPrefix: string;
}

const categories: CategoryConfig[] = [
  { type: 'top', count: 40, seedPrefix: 'shirt' },
  { type: 'bottom', count: 40, seedPrefix: 'pants' },
  { type: 'dress', count: 30, seedPrefix: 'dress' },
  { type: 'shoes', count: 30, seedPrefix: 'shoes' },
  { type: 'accessories', count: 30, seedPrefix: 'hat' },
  { type: 'outerwear', count: 30, seedPrefix: 'jacket' },
];

async function ensureDatasetDir() {
  try {
    await fs.access(DATASET_DIR);
  } catch {
    await fs.mkdir(DATASET_DIR, { recursive: true });
  }
  try {
    await fs.access(DATASET_IMAGES_DIR);
  } catch {
    await fs.mkdir(DATASET_IMAGES_DIR, { recursive: true });
  }
}

async function downloadImage(url: string, filepath: string): Promise<boolean> {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DatasetDownloader/1.0)',
      },
    });
    await fs.writeFile(filepath, response.data);
    return true;
  } catch (error: any) {
    console.error(`Failed to download ${url}:`, error.message);
    return false;
  }
}

async function downloadCategory(category: CategoryConfig): Promise<ClothingItem[]> {
  console.log(`\n📦 Downloading ${category.type} (${category.count} items)...`);
  const items: ClothingItem[] = [];
  let successCount = 0;

  for (let i = 0; i < category.count; i++) {
    const seed = `${category.seedPrefix}-${i}-${Date.now()}`;
    const imageUrl = `${PICSUM_BASE}/${seed}/400/600`;
    const filename = `${category.type}-${i + 1}.jpg`;
    const filepath = path.join(DATASET_IMAGES_DIR, filename);

    // Check if file already exists
    try {
      await fs.access(filepath);
      console.log(`  ⏭️  ${filename} already exists, skipping...`);
      
      // Still add to items list
      const item: ClothingItem = {
        id: `dataset-${category.type}-${i + 1}`,
        type: category.type,
        imageUrl: `/dataset/images/${filename}`,
        color: colors[Math.floor(Math.random() * colors.length)],
        brand: brands[Math.floor(Math.random() * brands.length)],
      };
      items.push(item);
      successCount++;
      continue;
    } catch {
      // File doesn't exist, download it
    }

    const success = await downloadImage(imageUrl, filepath);
    if (success) {
      const item: ClothingItem = {
        id: `dataset-${category.type}-${i + 1}`,
        type: category.type,
        imageUrl: `/dataset/images/${filename}`,
        color: colors[Math.floor(Math.random() * colors.length)],
        brand: brands[Math.floor(Math.random() * brands.length)],
      };
      items.push(item);
      successCount++;
      process.stdout.write(`  ✓ ${filename} (${successCount}/${category.count})\r`);
    } else {
      // Retry once
      await new Promise(resolve => setTimeout(resolve, 1000));
      const retrySuccess = await downloadImage(imageUrl, filepath);
      if (retrySuccess) {
        const item: ClothingItem = {
          id: `dataset-${category.type}-${i + 1}`,
          type: category.type,
          imageUrl: `/dataset/images/${filename}`,
          color: colors[Math.floor(Math.random() * colors.length)],
          brand: brands[Math.floor(Math.random() * brands.length)],
        };
        items.push(item);
        successCount++;
        process.stdout.write(`  ✓ ${filename} (retry) (${successCount}/${category.count})\r`);
      }
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log(`\n  ✅ Completed ${category.type}: ${successCount}/${category.count} items`);
  return items;
}

export async function downloadDataset(): Promise<ClothingItem[]> {
  await ensureDatasetDir();
  console.log('🚀 Starting clothing dataset download...');
  console.log('📁 Dataset directory:', DATASET_DIR);
  console.log('📸 Images will be saved to:', DATASET_IMAGES_DIR);

  const allItems: ClothingItem[] = [];

  for (const category of categories) {
    const items = await downloadCategory(category);
    allItems.push(...items);
  }

  // Save dataset metadata
  const datasetFile = path.join(DATASET_DIR, 'dataset.json');
  await fs.writeFile(datasetFile, JSON.stringify(allItems, null, 2));

  console.log(`\n🎉 Dataset download complete!`);
  console.log(`   Total items: ${allItems.length}`);
  console.log(`   Dataset file: ${datasetFile}`);
  console.log(`\n💡 Next steps:`);
  console.log(`   1. Review the dataset at: ${datasetFile}`);
  console.log(`   2. Load into wardrobe: POST /api/dataset/load-into-wardrobe`);
  console.log(`   3. Or use GET /api/dataset to view all items`);

  return allItems;
}

// Run if called directly
if (require.main === module) {
  downloadDataset()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error downloading dataset:', error);
      process.exit(1);
    });
}

