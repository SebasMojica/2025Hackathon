import fs from 'fs/promises';
import path from 'path';
import { ClothingItem, Outfit, SwipeAction } from '../types';

// Use process.cwd() for tsx compatibility, or __dirname if available
const DATA_DIR = path.join(process.cwd(), 'backend/src/data');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// User storage
export async function getUser(): Promise<{ id: string; photoUrl: string; createdAt: string } | null> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, 'user.json');
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function saveUser(user: { id: string; photoUrl: string; createdAt: string }): Promise<void> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, 'user.json');
  await fs.writeFile(filePath, JSON.stringify(user, null, 2));
}

// Wardrobe storage
export async function getWardrobe(): Promise<ClothingItem[]> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, 'wardrobe.json');
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function saveWardrobe(wardrobe: ClothingItem[]): Promise<void> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, 'wardrobe.json');
  await fs.writeFile(filePath, JSON.stringify(wardrobe, null, 2));
}

export async function addWardrobeItem(item: ClothingItem): Promise<void> {
  const wardrobe = await getWardrobe();
  wardrobe.push(item);
  await saveWardrobe(wardrobe);
}

// Purchase history storage
export async function getPurchaseHistory(): Promise<ClothingItem[]> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, 'purchaseHistory.json');
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function savePurchaseHistory(history: ClothingItem[]): Promise<void> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, 'purchaseHistory.json');
  await fs.writeFile(filePath, JSON.stringify(history, null, 2));
}

// Swipe actions storage
export async function getSwipeActions(): Promise<SwipeAction[]> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, 'swipeActions.json');
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function saveSwipeAction(action: SwipeAction): Promise<void> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, 'swipeActions.json');
  const actions = await getSwipeActions();
  actions.push(action);
  await fs.writeFile(filePath, JSON.stringify(actions, null, 2));
}

