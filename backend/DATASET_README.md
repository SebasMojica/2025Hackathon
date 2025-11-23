# Clothing Dataset - Kaggle Integration

This directory contains clothing images from the Kaggle dataset: **clothing-dataset-full** by agrigorev.

## Dataset Source

- **Kaggle Dataset**: [clothing-dataset-full](https://www.kaggle.com/datasets/agrigorev/clothing-dataset-full)
- **Dataset Structure**: Contains real clothing images with categories
- **License**: Check Kaggle dataset page for licensing terms

## Setup Instructions

### 1. Install Kaggle CLI

```bash
pip install kaggle
```

### 2. Set Up Kaggle API Credentials

1. Go to https://www.kaggle.com/account
2. Scroll to "API" section
3. Click "Create New API Token"
4. This downloads `kaggle.json`
5. Place it in `~/.kaggle/kaggle.json`:
   ```bash
   mkdir -p ~/.kaggle
   mv ~/Downloads/kaggle.json ~/.kaggle/
   chmod 600 ~/.kaggle/kaggle.json
   ```

### 3. Download the Dataset

```bash
cd backend
npm run download-dataset
```

This will:
1. Download the full dataset from Kaggle
2. Extract and process clothing images
3. Categorize images (tops, bottoms, dresses, shoes, accessories, outerwear)
4. Copy images to `backend/dataset/images/`
5. Generate metadata in `backend/dataset/dataset.json`

## Dataset Structure

After download:
- **kaggle-dataset/**: Raw downloaded dataset from Kaggle
- **dataset/images/**: Processed clothing images (200+ items)
- **dataset/dataset.json**: Metadata with clothing item information

## Categories

The dataset includes:
- **Tops**: 40 items (T-Shirts, Shirts, Blouses, Sweaters)
- **Bottoms**: 40 items (Jeans, Pants, Trousers, Shorts)
- **Dresses**: 30 items
- **Shoes**: 30 items (Sneakers, Boots, Heels)
- **Accessories**: 30 items (Hats, Caps, Beanies)
- **Outerwear**: 30 items (Jackets, Coats, Blazers)

**Total: 200 items**

## Using the Dataset

### Option 1: Load into Wardrobe

Load all dataset items into your wardrobe:

```bash
curl -X POST http://localhost:3001/api/dataset/load-into-wardrobe
```

### Option 2: View Dataset Items

Get all dataset items:

```bash
curl http://localhost:3001/api/dataset
```

### Option 3: Use in Suggestions

The suggestion engine will automatically use items from your wardrobe, which includes dataset items.

## Integration with Virtual Try-On

These clothing images will be used with fal.ai to:
1. Generate virtual try-on images of the user wearing the clothing
2. Create multiple angles (front, side, back) for each outfit
3. Display in the Tinder-like swipe interface
4. Allow users to swipe left/right to like/dislike outfits

## Notes

- Images are cached locally after first download
- Re-running the script will skip existing images
- All images are served via `/dataset/images/` endpoint
- Dataset metadata is stored in JSON format
- The Kaggle dataset is large - download may take several minutes

## Troubleshooting

**Kaggle API Error:**
- Make sure `~/.kaggle/kaggle.json` exists and has correct credentials
- Verify Kaggle CLI is installed: `kaggle --version`

**Download Fails:**
- Check internet connection
- Verify dataset is accessible: https://www.kaggle.com/datasets/agrigorev/clothing-dataset-full
- Ensure you've accepted the dataset terms on Kaggle

**Processing Issues:**
- Check that images were extracted correctly
- Verify file permissions on dataset directories
