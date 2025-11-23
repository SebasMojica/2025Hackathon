# Using Kaggle Dataset Zip File

If you have downloaded the Kaggle dataset as a zip file, you can use it directly without needing the Kaggle CLI or API credentials.

## Quick Setup

### 1. Download the Zip File

1. Go to https://www.kaggle.com/datasets/agrigorev/clothing-dataset-full
2. Click "Download" (you may need to accept terms first)
3. Save the zip file

### 2. Place the Zip File

Place the downloaded zip file in the `backend/` directory and rename it to `kaggle-dataset.zip`:

```bash
# Move your downloaded zip file to:
backend/kaggle-dataset.zip
```

### 3. Run the Script

```bash
cd backend
npm install  # Installs adm-zip if not already installed
npm run download-dataset
```

The script will:
- ✅ Detect the zip file automatically
- ✅ Extract it to `backend/kaggle-dataset/`
- ✅ Process all clothing images
- ✅ Categorize and copy 200 images to `backend/dataset/images/`
- ✅ Generate metadata in `backend/dataset/dataset.json`

### 4. Load into Wardrobe

```bash
curl -X POST http://localhost:3001/api/dataset/load-into-wardrobe
```

## File Structure

After extraction:
```
backend/
├── kaggle-dataset.zip          # Your zip file (keep this)
├── kaggle-dataset/              # Extracted dataset
│   └── [dataset files]
└── dataset/
    ├── images/                  # Processed images (200 items)
    └── dataset.json             # Metadata
```

## Notes

- The zip file will be extracted automatically
- If already extracted, the script will skip extraction
- The zip file can stay in place (it's ignored by git)
- No Kaggle API credentials needed when using zip file

## Troubleshooting

**"No zip file found"**
- Make sure the file is named exactly `kaggle-dataset.zip`
- Make sure it's in the `backend/` directory
- Check file permissions

**"Failed to extract zip file"**
- Verify the zip file is not corrupted
- Try re-downloading from Kaggle
- Check available disk space

**"Could not find images directory"**
- The dataset structure may vary
- Check `backend/kaggle-dataset/` after extraction
- The script searches recursively, so it should find images

