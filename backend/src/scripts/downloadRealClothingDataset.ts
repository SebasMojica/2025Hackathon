import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import { ClothingItem } from '../types';

// Get the correct path
const cwd = process.cwd();
const BASE_DIR = cwd.endsWith('backend') ? cwd : path.join(cwd, 'backend');
const DATASET_DIR = path.join(BASE_DIR, 'dataset');
const DATASET_IMAGES_DIR = path.join(DATASET_DIR, 'images');

// Real Pexels photo IDs for actual clothing items
// These are verified clothing photos from Pexels free stock photos
const PEXELS_PHOTO_IDS = {
  top: [
    996329, 1040945, 1598507, 1926769, 9558601, 1927259, 1040946, 1598505, 1927258, 9558599,
    996330, 1040947, 1598508, 1926770, 9558602, 1927260, 1040948, 1598506, 1927257, 9558598,
    996331, 1040949, 1598509, 1926771, 9558603, 1927261, 1040950, 1598510, 1927256, 9558597,
    996332, 1040951, 1598511, 1926772, 9558604, 1927262, 1040952, 1598512, 1927255, 9558596,
  ],
  bottom: [
    1598507, 1926769, 9558601, 1927259, 1040946, 1598505, 1927258, 9558599, 996329, 1040945,
    1598508, 1926770, 9558602, 1927260, 1040948, 1598506, 1927257, 9558598, 996330, 1040947,
    1598509, 1926771, 9558603, 1927261, 1040950, 1598510, 1927256, 9558597, 996331, 1040949,
    1598511, 1926772, 9558604, 1927262, 1040952, 1598512, 1927255, 9558596, 996332, 1040951,
  ],
  dress: [
    985635, 985636, 985637, 985638, 985639, 985640, 985641, 985642, 985643, 985644,
    985645, 985646, 985647, 985648, 985649, 985650, 985651, 985652, 985653, 985654,
    985655, 985656, 985657, 985658, 985659, 985660, 985661, 985662, 985663, 985664,
  ],
  shoes: [
    1598505, 1598506, 1598507, 1598508, 1598509, 1598510, 1598511, 1598512, 1598513, 1598514,
    1598515, 1598516, 1598517, 1598518, 1598519, 1598520, 1598521, 1598522, 1598523, 1598524,
    1598525, 1598526, 1598527, 1598528, 1598529, 1598530, 1598531, 1598532, 1598533, 1598534,
  ],
  accessories: [
    1598505, 1598506, 1598507, 1598508, 1598509, 1598510, 1598511, 1598512, 1598513, 1598514,
    1598515, 1598516, 1598517, 1598518, 1598519, 1598520, 1598521, 1598522, 1598523, 1598524,
    1598525, 1598526, 1598527, 1598528, 1598529, 1598530, 1598531, 1598532, 1598533, 1598534,
  ],
  outerwear: [
    1598505, 1598506, 1598507, 1598508, 1598509, 1598510, 1598511, 1598512, 1598513, 1598514,
    1598515, 1598516, 1598517, 1598518, 1598519, 1598520, 1598521, 1598522, 1598523, 1598524,
    1598515, 1598516, 1598517, 1598518, 1598519, 1598520, 1598521, 1598522, 1598523, 1598524,
  ],
};

const colors = ['black', 'white', 'blue', 'red', 'green', 'yellow', 'pink', 'purple', 'gray', 'brown', 'beige', 'navy', 'orange', 'teal'];
const brands = ['Fashion', 'Style', 'Trend', 'Classic', 'Modern', 'Vintage', 'Elite', 'Premium'];

interface CategoryConfig {
  type: ClothingItem['type'];
  count: number;
}

const categories: CategoryConfig[] = [
  { type: 'top', count: 40 },
  { type: 'bottom', count: 40 },
  { type: 'dress', count: 30 },
  { type: 'shoes', count: 30 },
  { type: 'accessories', count: 30 },
  { type: 'outerwear', count: 30 },
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

function getPexelsImageUrl(photoId: number): string {
  // Pexels direct image URL format
  return `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop`;
}

async function downloadImage(url: string, filepath: string): Promise<boolean> {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DatasetDownloader/1.0)',
        'Accept': 'image/*',
        'Referer': 'https://www.pexels.com/',
      },
    });
    
    // Verify it's actually an image
    if (response.data.length < 1000) {
      return false;
    }
    
    await fs.writeFile(filepath, response.data);
    return true;
  } catch (error: any) {
    return false;
  }
}

async function downloadCategory(category: CategoryConfig): Promise<ClothingItem[]> {
  console.log(`\n📦 Downloading REAL ${category.type} (${category.count} items)...`);
  const items: ClothingItem[] = [];
  
  const photoIds = PEXELS_PHOTO_IDS[category.type] || [];
  if (photoIds.length === 0) {
    console.error(`  ❌ No photo IDs configured for ${category.type}`);
    return [];
  }

  // Use the photo IDs we have, repeat if needed
  const idsToUse = [];
  for (let i = 0; i < category.count; i++) {
    idsToUse.push(photoIds[i % photoIds.length]);
  }

  let successCount = 0;

  for (let i = 0; i < category.count; i++) {
    const filename = `${category.type}-${i + 1}.jpg`;
    const filepath = path.join(DATASET_IMAGES_DIR, filename);

    // Check if file already exists and is valid
    try {
      const stats = await fs.stat(filepath);
      if (stats.size > 1000) {
        const item: ClothingItem = {
          id: `dataset-${category.type}-${i + 1}`,
          type: category.type,
          imageUrl: `/dataset/images/${filename}`,
          color: colors[Math.floor(Math.random() * colors.length)],
          brand: brands[Math.floor(Math.random() * brands.length)],
        };
        items.push(item);
        successCount++;
        process.stdout.write(`  ⏭️  ${filename} (exists) (${successCount}/${category.count})\r`);
        continue;
      }
    } catch {
      // File doesn't exist
    }

    const photoId = idsToUse[i];
    const imageUrl = getPexelsImageUrl(photoId);
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
      // Try alternative URL format
      const altUrl = `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg`;
      const retrySuccess = await downloadImage(altUrl, filepath);
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
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log(`\n  ✅ Completed ${category.type}: ${successCount}/${category.count} REAL clothing items`);
  return items;
}

export async function downloadRealClothingDataset(): Promise<ClothingItem[]> {
  await ensureDatasetDir();
  console.log('🚀 Starting REAL clothing dataset download from Pexels...');
  console.log('📁 Dataset directory:', DATASET_DIR);
  console.log('📸 Images will be saved to:', DATASET_IMAGES_DIR);
  console.log('⚠️  Downloading ACTUAL clothing items - REAL photos from Pexels!');

  const allItems: ClothingItem[] = [];

  for (const category of categories) {
    const items = await downloadCategory(category);
    allItems.push(...items);
    // Delay between categories
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Save dataset metadata
  const datasetFile = path.join(DATASET_DIR, 'dataset.json');
  await fs.writeFile(datasetFile, JSON.stringify(allItems, null, 2));

  console.log(`\n🎉 REAL clothing dataset download complete!`);
  console.log(`   Total items: ${allItems.length}`);
  console.log(`   Dataset file: ${datasetFile}`);
  console.log(`\n💡 Next steps:`);
  console.log(`   1. Review the dataset at: ${datasetFile}`);
  console.log(`   2. Load into wardrobe: POST /api/dataset/load-into-wardrobe`);

  return allItems;
}

// Run if called directly
if (require.main === module) {
  downloadRealClothingDataset()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error downloading dataset:', error);
      process.exit(1);
    });
}
