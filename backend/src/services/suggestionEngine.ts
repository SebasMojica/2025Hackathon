import { ClothingItem, Outfit } from '../types';
import { getWardrobe, getPurchaseHistory, getSwipeActions } from './storage';

export async function generateOutfitSuggestions(count: number = 5): Promise<Outfit[]> {
  const wardrobe = await getWardrobe();
  const purchaseHistory = await getPurchaseHistory();
  const swipeActions = await getSwipeActions();
  
  // Combine wardrobe and purchase history
  const allItems = [...wardrobe, ...purchaseHistory];
  
  // Filter out items that were disliked
  const dislikedOutfitIds = new Set(
    swipeActions
      .filter(action => action.direction === 'left')
      .map(action => action.outfitId)
  );
  
  const outfits: Outfit[] = [];
  
  // Generate outfits based on available items
  if (allItems.length === 0) {
    // Return mock outfits if no items available
    return generateMockOutfits(count);
  }
  
  // Group items by type
  const itemsByType = {
    top: allItems.filter(item => item.type === 'top'),
    bottom: allItems.filter(item => item.type === 'bottom'),
    dress: allItems.filter(item => item.type === 'dress'),
    outerwear: allItems.filter(item => item.type === 'outerwear'),
    shoes: allItems.filter(item => item.type === 'shoes'),
    accessories: allItems.filter(item => item.type === 'accessories'),
  };
  
  // Generate outfits
  for (let i = 0; i < count; i++) {
    const outfitId = `outfit-${Date.now()}-${i}`;
    const items: ClothingItem[] = [];
    
    // Create outfit based on available items
    if (itemsByType.dress.length > 0 && Math.random() > 0.5) {
      // Dress outfit
      items.push(itemsByType.dress[Math.floor(Math.random() * itemsByType.dress.length)]);
    } else {
      // Top + bottom outfit
      if (itemsByType.top.length > 0) {
        items.push(itemsByType.top[Math.floor(Math.random() * itemsByType.top.length)]);
      }
      if (itemsByType.bottom.length > 0) {
        items.push(itemsByType.bottom[Math.floor(Math.random() * itemsByType.bottom.length)]);
      }
    }
    
    // Add optional items
    if (itemsByType.outerwear.length > 0 && Math.random() > 0.6) {
      items.push(itemsByType.outerwear[Math.floor(Math.random() * itemsByType.outerwear.length)]);
    }
    if (itemsByType.shoes.length > 0 && Math.random() > 0.7) {
      items.push(itemsByType.shoes[Math.floor(Math.random() * itemsByType.shoes.length)]);
    }
    if (itemsByType.accessories.length > 0 && Math.random() > 0.8) {
      items.push(itemsByType.accessories[Math.floor(Math.random() * itemsByType.accessories.length)]);
    }
    
    if (items.length > 0) {
      outfits.push({
        id: outfitId,
        items,
        generatedAt: new Date().toISOString(),
      });
    }
  }
  
  // Filter out disliked outfits
  const filteredOutfits = outfits.filter(outfit => !dislikedOutfitIds.has(outfit.id));
  
  // If we don't have enough outfits, add mock ones
  while (filteredOutfits.length < count) {
    filteredOutfits.push(...generateMockOutfits(1));
  }
  
  return filteredOutfits.slice(0, count);
}

function generateMockOutfits(count: number): Outfit[] {
  const mockOutfits: Outfit[] = [];
  const mockItems: ClothingItem[] = [
    { id: 'mock-1', type: 'top', imageUrl: '/api/placeholder/300/400', color: 'blue', brand: 'Mock Brand' },
    { id: 'mock-2', type: 'bottom', imageUrl: '/api/placeholder/300/400', color: 'black', brand: 'Mock Brand' },
    { id: 'mock-3', type: 'dress', imageUrl: '/api/placeholder/300/400', color: 'red', brand: 'Mock Brand' },
  ];
  
  for (let i = 0; i < count; i++) {
    mockOutfits.push({
      id: `mock-outfit-${Date.now()}-${i}`,
      items: [mockItems[i % mockItems.length]],
      generatedAt: new Date().toISOString(),
    });
  }
  
  return mockOutfits;
}

