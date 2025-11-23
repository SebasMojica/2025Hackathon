import { useState, useEffect } from 'react';

export function useImageCarousel(images: string[], _autoAdvance: boolean = false) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset to first image when images array changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [images.length]);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goTo = (index: number) => {
    if (index >= 0 && index < images.length) {
      setCurrentIndex(index);
    }
  };

  return {
    currentIndex,
    currentImage: images[currentIndex] || '',
    next,
    prev,
    goTo,
    hasNext: images.length > 1,
    hasPrev: images.length > 1,
    totalImages: images.length,
  };
}

