import fs from 'fs/promises';
import path from 'path';
import { ClothingItem } from '../types';
import { getWardrobe, saveWardrobe } from './storage';

// Get the correct path - detect if we're in backend/ or root
const cwd = process.cwd();
const BASE_DIR = cwd.endsWith('backend') 
  ? cwd 
  : path.join(cwd, 'backend');
const DATASET_DIR = path.join(BASE_DIR, 'dataset');
const DATASET_FILE = path.join(DATASET_DIR, 'dataset.json');

export async function getDataset(): Promise<ClothingItem[]> {
  try {
    const data = await fs.readFile(DATASET_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    // If dataset doesn't exist, return empty array
    console.error(`Failed to read dataset from ${DATASET_FILE}:`, error.message);
    return [];
  }
}

export async function loadDatasetIntoWardrobe(): Promise<number> {
  const dataset = await getDataset();
  if (dataset.length === 0) {
    throw new Error('Dataset is empty. Please run the download script first.');
  }

  const currentWardrobe = await getWardrobe();
  const existingIds = new Set(currentWardrobe.map(item => item.id));
  
  // Add only new items that don't already exist
  const newItems = dataset.filter(item => !existingIds.has(item.id));
  const updatedWardrobe = [...currentWardrobe, ...newItems];
  
  await saveWardrobe(updatedWardrobe);
  return newItems.length;
}

export async function datasetExists(): Promise<boolean> {
  try {
    await fs.access(DATASET_FILE);
    return true;
  } catch {
    return false;
  }
}

