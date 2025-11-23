// Clothing Item
export interface ClothingItem {
  id: string;
  type: 'top' | 'bottom' | 'dress' | 'outerwear' | 'shoes' | 'accessories';
  imageUrl: string;
  color: string;
  brand?: string;
  purchaseDate?: string;
}

// Outfit
export interface Outfit {
  id: string;
  items: ClothingItem[];
  generatedAt: string;
  tryOnImageUrl?: string; // fal.ai generated image of user wearing the outfit
  tryOnImageUrls?: string[]; // Multiple angles if available
}

// Swipe Action
export interface SwipeAction {
  outfitId: string;
  direction: 'left' | 'right';
  timestamp: string;
}

