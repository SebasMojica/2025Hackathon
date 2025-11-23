import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import AdmZip from 'adm-zip';
import { ClothingItem } from '../types';

// Get the correct path
const cwd = process.cwd();
const BASE_DIR = cwd.endsWith('backend') ? cwd : path.join(cwd, 'backend');
const DATASET_DIR = path.join(BASE_DIR, 'dataset');
const DATASET_IMAGES_DIR = path.join(DATASET_DIR, 'images');
const KAGGLE_DATASET_DIR = path.join(BASE_DIR, 'kaggle-dataset');
const KAGGLE_ZIP_PATH = path.join(BASE_DIR, 'kaggle-dataset.zip');

const colors = ['black', 'white', 'blue', 'red', 'green', 'yellow', 'pink', 'purple', 'gray', 'brown', 'beige', 'navy', 'orange', 'teal'];
const brands = ['Fashion', 'Style', 'Trend', 'Classic', 'Modern', 'Vintage', 'Elite', 'Premium'];

// Map Kaggle folder names (Indonesian) to our clothing types
const FOLDER_CATEGORY_MAPPING: Record<string, ClothingItem['type']> = {
  // Tops
  'Kaos': 'top',              // T-shirt
  'Kemeja': 'top',            // Shirt
  'Polo': 'top',              // Polo shirt
  'Sweter': 'top',            // Sweater
  // Bottoms
  'Celana_Panjang': 'bottom',  // Long pants
  'Celana_Pendek': 'bottom',  // Shorts
  'Jeans': 'bottom',          // Jeans
  'Rok': 'bottom',            // Skirt
  // Dresses
  'Gaun': 'dress',            // Dress
  // Outerwear
  'Jaket': 'outerwear',       // Jacket
  'Jaket_Denim': 'outerwear', // Denim jacket
  'Jaket_Olahraga': 'outerwear', // Sports jacket
  'Blazer': 'outerwear',      // Blazer
  'Mantel': 'outerwear',      // Coat
  'Hoodie': 'outerwear',      // Hoodie
};

// Map filename keywords to our clothing types (fallback)
const CATEGORY_MAPPING: Record<string, ClothingItem['type']> = {
  'T-Shirt': 'top',
  'Shirt': 'top',
  'Top': 'top',
  'Blouse': 'top',
  'Sweater': 'top',
  'Jeans': 'bottom',
  'Pants': 'bottom',
  'Trousers': 'bottom',
  'Shorts': 'bottom',
  'Dress': 'dress',
  'Gown': 'dress',
  'Shoes': 'shoes',
  'Sneakers': 'shoes',
  'Boots': 'shoes',
  'Heels': 'shoes',
  'Hat': 'accessories',
  'Cap': 'accessories',
  'Beanie': 'accessories',
  'Jacket': 'outerwear',
  'Coat': 'outerwear',
  'Blazer': 'outerwear',
};

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
  try {
    await fs.access(KAGGLE_DATASET_DIR);
  } catch {
    await fs.mkdir(KAGGLE_DATASET_DIR, { recursive: true });
  }
}

function checkKaggleInstalled(): boolean {
  try {
    execSync('kaggle --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function checkForZipFile(): Promise<boolean> {
  try {
    const stats = await fs.stat(KAGGLE_ZIP_PATH);
    return stats.isFile();
  } catch {
    return false;
  }
}

async function extractZipFile(): Promise<void> {
  console.log('📦 Found zip file, extracting...');
  try {
    const zip = new AdmZip(KAGGLE_ZIP_PATH);
    
    // Check if extraction directory already exists and has content
    let needsExtraction = true;
    try {
      const existingFiles = await fs.readdir(KAGGLE_DATASET_DIR);
      if (existingFiles.length > 0) {
        console.log('  ⏭️  Dataset already extracted, skipping...');
        needsExtraction = false;
      }
    } catch {
      // Directory doesn't exist, need to extract
    }

    if (needsExtraction) {
      console.log(`  Extracting to: ${KAGGLE_DATASET_DIR}`);
      zip.extractAllTo(KAGGLE_DATASET_DIR, true);
      console.log('  ✅ Zip file extracted successfully');
    }
  } catch (error: any) {
    console.error('  ❌ Failed to extract zip file:', error.message);
    throw error;
  }
}

async function downloadKaggleDataset(): Promise<void> {
  // First check if zip file exists
  const zipExists = await checkForZipFile();
  if (zipExists) {
    await extractZipFile();
    return;
  }

  // Otherwise, try downloading via Kaggle CLI
  console.log('📥 Downloading Kaggle dataset via API...');
  try {
    // Check if kaggle is installed
    if (!checkKaggleInstalled()) {
      throw new Error('Kaggle CLI not installed. Install with: pip install kaggle\n   Or place kaggle-dataset.zip in the backend/ directory');
    }

    // Download the dataset
    const datasetName = 'agrigorev/clothing-dataset-full';
    console.log(`  Downloading ${datasetName}...`);
    
    execSync(`kaggle datasets download -d ${datasetName} -p "${BASE_DIR}" --unzip`, {
      stdio: 'inherit',
      cwd: BASE_DIR,
    });
    
    console.log('  ✅ Dataset downloaded successfully');
  } catch (error: any) {
    console.error('  ❌ Failed to download from Kaggle:', error.message);
    console.error('\n  💡 Alternative: Download the zip file manually from Kaggle and place it as:');
    console.error(`     ${KAGGLE_ZIP_PATH}`);
    throw error;
  }
}

async function findClothesDatasetDirectory(): Promise<string | null> {
  // Look for Clothes_Dataset directory (the main dataset folder)
  const possibleDirs = [
    path.join(KAGGLE_DATASET_DIR, 'Clothes_Dataset'),
    path.join(KAGGLE_DATASET_DIR, 'clothing-dataset-full', 'Clothes_Dataset'),
    path.join(KAGGLE_DATASET_DIR, 'clothing-dataset-full'),
    KAGGLE_DATASET_DIR,
  ];

  for (const dir of possibleDirs) {
    try {
      const stats = await fs.stat(dir);
      if (stats.isDirectory()) {
        // Check if it has subdirectories (clothing type folders)
        const entries = await fs.readdir(dir, { withFileTypes: true });
        const hasSubdirs = entries.some(e => e.isDirectory());
        if (hasSubdirs || entries.some(e => e.name.match(/\.(jpg|jpeg|png)$/i))) {
          return dir;
        }
      }
    } catch {
      continue;
    }
  }

  return null;
}

async function readCSVMetadata(csvPath: string): Promise<Map<string, string>> {
  const categoryMap = new Map<string, string>();
  try {
    const csvContent = await fs.readFile(csvPath, 'utf-8');
    const lines = csvContent.split('\n');
    const headers = lines[0]?.split(',').map(h => h.trim()) || [];
    
    const imageIndex = headers.findIndex(h => h.toLowerCase().includes('image') || h.toLowerCase().includes('file'));
    const categoryIndex = headers.findIndex(h => h.toLowerCase().includes('category') || h.toLowerCase().includes('label') || h.toLowerCase().includes('class'));
    
    if (imageIndex === -1 || categoryIndex === -1) {
      return categoryMap;
    }

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length > Math.max(imageIndex, categoryIndex)) {
        const imageName = values[imageIndex];
        const category = values[categoryIndex];
        if (imageName && category) {
          categoryMap.set(imageName.toLowerCase(), category);
        }
      }
    }
  } catch (error) {
    console.log('  ⚠️  Could not read CSV metadata:', error);
  }
  
  return categoryMap;
}

async function processKaggleDataset(): Promise<ClothingItem[]> {
  console.log('\n📦 Processing Kaggle dataset...');
  
  // Find Clothes_Dataset directory
  const imageDir = await findClothesDatasetDirectory();
  if (!imageDir) {
    throw new Error('Could not find Clothes_Dataset directory in Kaggle dataset. Please check the dataset structure.');
  }

  console.log(`  Found dataset in: ${imageDir}`);

  // Look for CSV metadata file
  const possibleCSVPaths = [
    path.join(KAGGLE_DATASET_DIR, 'images.csv'),
    path.join(KAGGLE_DATASET_DIR, 'clothing-dataset-full', 'images.csv'),
    path.join(KAGGLE_DATASET_DIR, 'annotations.csv'),
    path.join(KAGGLE_DATASET_DIR, 'labels.csv'),
  ];

  let csvMetadata = new Map<string, string>();
  for (const csvPath of possibleCSVPaths) {
    try {
      await fs.access(csvPath);
      console.log(`  Found metadata file: ${csvPath}`);
      csvMetadata = await readCSVMetadata(csvPath);
      break;
    } catch {
      continue;
    }
  }

  // Get all image files from category folders
  async function getImagesFromFolders(baseDir: string): Promise<Array<{path: string, category: ClothingItem['type']}>> {
    const imageList: Array<{path: string, category: ClothingItem['type']}> = [];
    
    try {
      const entries = await fs.readdir(baseDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        
        const folderName = entry.name;
        const category = FOLDER_CATEGORY_MAPPING[folderName];
        
        if (!category) {
          // Unknown folder, skip or try to infer from name
          continue;
        }
        
        const folderPath = path.join(baseDir, folderName);
        const files = await fs.readdir(folderPath);
        const imageFiles = files.filter(f => f.match(/\.(jpg|jpeg|png)$/i));
        
        for (const imageFile of imageFiles) {
          imageList.push({
            path: path.join(folderPath, imageFile),
            category: category
          });
        }
      }
    } catch (error) {
      console.error('  Error reading folders:', error);
    }
    
    return imageList;
  }

  const allImages = await getImagesFromFolders(imageDir);
  console.log(`  Found ${allImages.length} images across ${Object.keys(FOLDER_CATEGORY_MAPPING).length} category folders`);

  // Process images and categorize them
  const items: ClothingItem[] = [];
  const categoryCounts: Record<ClothingItem['type'], number> = {
    top: 0,
    bottom: 0,
    dress: 0,
    shoes: 0,
    accessories: 0,
    outerwear: 0,
  };

  const targetCounts = {
    top: 40,
    bottom: 40,
    dress: 30,
    shoes: 30,
    accessories: 30,
    outerwear: 30,
  };

  for (const { path: imagePath, category: folderCategory } of allImages) {
    const fileName = path.basename(imagePath);
    const fileNameLower = fileName.toLowerCase();
    
    // Use category from folder (most reliable)
    let category: ClothingItem['type'] = folderCategory;
    
    // Check CSV metadata as secondary source
    if (csvMetadata.has(fileNameLower)) {
      const csvCategory = csvMetadata.get(fileNameLower) || '';
      for (const [kaggleCat, ourType] of Object.entries(CATEGORY_MAPPING)) {
        if (csvCategory.toLowerCase().includes(kaggleCat.toLowerCase())) {
          category = ourType;
          break;
        }
      }
    }

    // Check if we need more of this category
    if (categoryCounts[category] >= targetCounts[category]) {
      continue;
    }

    // Copy image to our dataset directory
    const destFilename = `${category}-${categoryCounts[category] + 1}.jpg`;
    const destPath = path.join(DATASET_IMAGES_DIR, destFilename);

    try {
      await fs.copyFile(imagePath, destPath);
      
      const item: ClothingItem = {
        id: `dataset-${category}-${categoryCounts[category] + 1}`,
        type: category,
        imageUrl: `/dataset/images/${destFilename}`,
        color: colors[Math.floor(Math.random() * colors.length)],
        brand: brands[Math.floor(Math.random() * brands.length)],
      };

      items.push(item);
      categoryCounts[category]++;
      
      process.stdout.write(`  ✓ ${fileName} -> ${destFilename} (${items.length}/${allImages.length})\r`);
      
      // Stop if we have enough items total
      const totalNeeded = Object.values(targetCounts).reduce((a, b) => a + b, 0);
      if (items.length >= totalNeeded) break;
    } catch (error) {
      console.error(`\n  Failed to copy ${fileName}:`, error);
    }
  }

  console.log(`\n  ✅ Processed ${items.length} clothing items from Kaggle dataset`);
  console.log(`     Categories:`, categoryCounts);
  return items;
}

export async function downloadKaggleClothingDataset(): Promise<ClothingItem[]> {
  await ensureDatasetDir();
  
  console.log('🚀 Starting Kaggle clothing dataset processing...');
  console.log('📁 Dataset directory:', DATASET_DIR);
  console.log('📸 Images will be saved to:', DATASET_IMAGES_DIR);
  console.log('');

  // Check if zip file exists first
  const zipExists = await checkForZipFile();
  if (zipExists) {
    console.log('  ✓ Found kaggle-dataset.zip file');
    console.log('  Will extract and process from zip file\n');
  } else {
    console.log('  ⚠️  No zip file found. Will try downloading via Kaggle API...');
    console.log('  💡 Tip: You can download the zip manually from Kaggle and place it as:');
    console.log(`     ${KAGGLE_ZIP_PATH}\n`);
    
    // Check for Kaggle credentials only if we need to download
    const homeDir = process.env.HOME || process.env.USERPROFILE || '';
    const kaggleConfigPath = path.join(homeDir, '.kaggle', 'kaggle.json');
    try {
      await fs.access(kaggleConfigPath);
      console.log('  ✓ Kaggle credentials found\n');
    } catch {
      console.log('  ⚠️  Kaggle credentials not found!');
      console.log('     Please either:');
      console.log('     A) Place kaggle-dataset.zip in backend/ directory, OR');
      console.log('     B) Set up Kaggle API:');
      console.log('        1. Go to https://www.kaggle.com/account');
      console.log('        2. Create API token');
      console.log('        3. Place kaggle.json in ~/.kaggle/ (or %USERPROFILE%\\.kaggle\\ on Windows)\n');
      throw new Error('Kaggle zip file or credentials required');
    }
  }

  // Download or extract dataset
  await downloadKaggleDataset();

  // Process dataset
  const items = await processKaggleDataset();

  // Save dataset metadata
  const datasetFile = path.join(DATASET_DIR, 'dataset.json');
  await fs.writeFile(datasetFile, JSON.stringify(items, null, 2));

  console.log(`\n🎉 Kaggle clothing dataset processing complete!`);
  console.log(`   Total items: ${items.length}`);
  console.log(`   Dataset file: ${datasetFile}`);
  console.log(`\n💡 Next steps:`);
  console.log(`   1. Review the dataset at: ${datasetFile}`);
  console.log(`   2. Load into wardrobe: POST /api/dataset/load-into-wardrobe`);

  return items;
}

// Run if called directly
if (require.main === module) {
  downloadKaggleClothingDataset()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error downloading Kaggle dataset:', error.message);
      console.error('\n💡 Setup instructions:');
      console.error('   1. Install Kaggle CLI: pip install kaggle');
      console.error('   2. Get API token from: https://www.kaggle.com/account');
      console.error('   3. Place kaggle.json in ~/.kaggle/');
      process.exit(1);
    });
}

