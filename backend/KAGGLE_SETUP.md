# Kaggle Dataset Setup Guide

## Quick Start

### 1. Install Kaggle CLI

```bash
pip install kaggle
```

### 2. Get Kaggle API Credentials

1. Go to https://www.kaggle.com/account
2. Scroll to "API" section  
3. Click "Create New API Token"
4. This downloads `kaggle.json`

### 3. Set Up Credentials

**On macOS/Linux:**
```bash
mkdir -p ~/.kaggle
mv ~/Downloads/kaggle.json ~/.kaggle/
chmod 600 ~/.kaggle/kaggle.json
```

**On Windows:**
```bash
mkdir %USERPROFILE%\.kaggle
move %USERPROFILE%\Downloads\kaggle.json %USERPROFILE%\.kaggle\
```

### 4. Accept Dataset Terms

Before downloading, you need to accept the dataset terms on Kaggle:
1. Go to https://www.kaggle.com/datasets/agrigorev/clothing-dataset-full
2. Click "Download" or "New Notebook"
3. Accept the terms if prompted

### 5. Download the Dataset

```bash
cd backend
npm run download-dataset
```

This will:
- Download the full clothing dataset from Kaggle
- Extract and process images
- Categorize into: tops, bottoms, dresses, shoes, accessories, outerwear
- Copy 200 images to `backend/dataset/images/`
- Generate metadata in `backend/dataset/dataset.json`

### 6. Load into Wardrobe

```bash
curl -X POST http://localhost:3001/api/dataset/load-into-wardrobe
```

## What Happens Next

Once loaded, these REAL clothing images will be:
- Used in outfit suggestions
- Available for virtual try-on with fal.ai
- Displayed in the Tinder-like swipe interface
- Used to generate multiple angle views of the user wearing the clothing

## Troubleshooting

**"Kaggle CLI not installed"**
- Run: `pip install kaggle`
- Verify: `kaggle --version`

**"Kaggle credentials required"**
- Make sure `~/.kaggle/kaggle.json` exists
- Check file permissions: `chmod 600 ~/.kaggle/kaggle.json`

**"403 Forbidden" or "401 Unauthorized"**
- Verify your Kaggle API token is valid
- Make sure you've accepted the dataset terms on Kaggle
- Check that your account has access to the dataset

**"Could not find images directory"**
- The dataset structure may be different than expected
- Check `backend/kaggle-dataset/` for the actual structure
- The script searches recursively, but you may need to adjust paths

## Dataset Information

- **Source**: Kaggle - clothing-dataset-full by agrigorev
- **License**: Check Kaggle dataset page
- **Size**: Large dataset - download may take 5-10 minutes
- **Images**: Real clothing photos, not placeholders

