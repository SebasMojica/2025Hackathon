import { useState } from 'react';
import { Outfit } from '../types';
import { outfitsApi } from '../services/api';

export function useSwipe(outfits: Outfit[], onSwipeComplete?: () => void) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (currentIndex >= outfits.length) return;

    const currentOutfit = outfits[currentIndex];
    setSwipeDirection(direction);

    try {
      await outfitsApi.swipe(currentOutfit.id, direction);
    } catch (error) {
      console.error('Failed to record swipe:', error);
    }

    // Move to next outfit after a short delay
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setSwipeDirection(null);
      if (onSwipeComplete) {
        onSwipeComplete();
      }
    }, 300);
  };

  const currentOutfit = outfits[currentIndex] || null;
  const hasMore = currentIndex < outfits.length;

  return {
    currentOutfit,
    currentIndex,
    hasMore,
    swipeDirection,
    handleSwipe,
    reset: () => setCurrentIndex(0),
  };
}

