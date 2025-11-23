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
}

// Swipe Action
export interface SwipeAction {
  outfitId: string;
  direction: 'left' | 'right';
  timestamp: string;
}

