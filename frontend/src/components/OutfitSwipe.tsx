import { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { Outfit, User } from '../types';
import { useSwipe } from '../hooks/useSwipe';
import { useImageCarousel } from '../hooks/useImageCarousel';
import { falApi } from '../services/api';
import { userApi } from '../services/api';

interface OutfitSwipeProps {
  outfits: Outfit[];
  onSwipeComplete?: () => void;
  onCustomize?: (outfit: Outfit) => void;
}

export function OutfitSwipe({ outfits, onSwipeComplete, onCustomize }: OutfitSwipeProps) {
  const { currentOutfit, hasMore, swipeDirection, handleSwipe, reset } = useSwipe(
    outfits,
    onSwipeComplete
  );
  const [user, setUser] = useState<User | null>(null);
  const [tryOnImages, setTryOnImages] = useState<string[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);

  const imageCarousel = useImageCarousel(tryOnImages);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (currentOutfit) {
      // Use pre-generated try-on images from backend if available
      if (currentOutfit.tryOnImageUrl) {
        setTryOnImages([currentOutfit.tryOnImageUrl]);
        setLoadingImages(false);
      } else if (currentOutfit.tryOnImageUrls && currentOutfit.tryOnImageUrls.length > 0) {
        setTryOnImages(currentOutfit.tryOnImageUrls);
        setLoadingImages(false);
      } else if (user && currentOutfit.items.length > 0) {
        // Fallback: generate on the fly if not pre-generated
        setTryOnImages([]);
        imageCarousel.goTo(0);
        generateTryOnImages();
      } else {
        setTryOnImages([]);
        setLoadingImages(false);
      }
    } else {
      setTryOnImages([]);
      setLoadingImages(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOutfit?.id, user?.id]); // Only regenerate when outfit or user changes

  const loadUser = async () => {
    try {
      const userData = await userApi.getUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  };

  const generateTryOnImages = async () => {
    if (!currentOutfit || !user || currentOutfit.items.length === 0) return;

    setLoadingImages(true);
    try {
      const userPhotoUrl = getImageUrl(user.photoUrl);
      const clothingItemUrl = getImageUrl(currentOutfit.items[0].imageUrl);
      
      // Generate multiple angles - front, side, back
      const angles = ['front', 'side', 'back'];
      
      try {
        const imageUrls = await falApi.generateMultipleAngles(userPhotoUrl, clothingItemUrl, angles);
        
        if (imageUrls && imageUrls.length > 0) {
          setTryOnImages(imageUrls);
        } else {
          // Fallback: generate single image
          const singleImage = await falApi.generateTryOn(userPhotoUrl, clothingItemUrl);
          setTryOnImages([singleImage]);
        }
      } catch (error) {
        console.error('Failed to generate multiple angles, trying single:', error);
        // Fallback to single image
        const singleImage = await falApi.generateTryOn(userPhotoUrl, clothingItemUrl);
        setTryOnImages([singleImage]);
      }
    } catch (error) {
      console.error('Failed to generate try-on images:', error);
      setTryOnImages(['https://via.placeholder.com/400x600?text=Try+On+Preview']);
    } finally {
      setLoadingImages(false);
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleSwipe('left'),
    onSwipedRight: () => handleSwipe('right'),
    onSwipedUp: () => imageCarousel.next(),
    onSwipedDown: () => imageCarousel.prev(),
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  const imageSwipeHandlers = useSwipeable({
    onSwipedLeft: () => imageCarousel.next(),
    onSwipedRight: () => imageCarousel.prev(),
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  const getImageUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) {
      // In production, use relative URLs (same domain)
      // In development, use localhost
      const apiUrl = import.meta.env.VITE_API_URL || '';
      return apiUrl ? `${apiUrl}${url}` : `http://localhost:3001${url}`;
    }
    return url;
  };

  if (!hasMore) {
    return (
      <div className="w-full max-w-md mx-auto p-8 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl text-center border border-white/50">
        <div className="text-6xl mb-4">✨</div>
        <p className="text-gray-700 text-lg font-semibold mb-2">You've seen all outfits!</p>
        <p className="text-gray-500 text-sm mb-6">Get more suggestions to continue browsing</p>
        <button
          onClick={() => {
            reset();
            if (onSwipeComplete) {
              onSwipeComplete();
            }
          }}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
        >
          Get More Outfits
        </button>
      </div>
    );
  }

  if (!currentOutfit) {
    return (
      <div className="w-full max-w-md mx-auto p-8 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl text-center border border-white/50">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Loading outfits...</p>
      </div>
    );
  }

  const currentImage = tryOnImages[imageCarousel.currentIndex] || 'https://via.placeholder.com/400x600?text=Loading...';

  return (
    <div className="w-full max-w-md mx-auto h-[650px] relative">
      {/* Tinder-like Card with enhanced styling */}
      <div
        {...swipeHandlers}
        className={`absolute inset-0 bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 ease-out ${
          swipeDirection === 'left' 
            ? 'transform -translate-x-full rotate-[-30deg] opacity-0 scale-95' 
            : swipeDirection === 'right' 
            ? 'transform translate-x-full rotate-[30deg] opacity-0 scale-95'
            : 'scale-100'
        }`}
        style={{ 
          touchAction: 'pan-y pinch-zoom',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Image Carousel */}
        <div 
          {...imageSwipeHandlers}
          className="relative w-full h-[550px] bg-gradient-to-br from-gray-50 to-gray-100"
        >
          {loadingImages ? (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="text-center">
                <div className="relative">
                  <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-8 w-8 bg-purple-600 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <p className="text-gray-700 font-medium">Generating your try-on...</p>
                <p className="text-gray-500 text-sm mt-2">This may take a moment</p>
              </div>
            </div>
          ) : (
            <>
              <img
                src={currentImage}
                alt="Try-on preview"
                className="w-full h-full object-cover transition-opacity duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x600?text=Try+On+Preview';
                }}
              />
              
              {/* Image dots indicator */}
              {tryOnImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
                  {tryOnImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => imageCarousel.goTo(index)}
                      className={`rounded-full transition-all duration-300 ${
                        index === imageCarousel.currentIndex 
                          ? 'bg-white w-8 h-2 shadow-lg' 
                          : 'bg-white/60 w-2 h-2 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Image navigation arrows */}
              {tryOnImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      imageCarousel.prev();
                    }}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-xl transition-all hover:scale-110 z-20 backdrop-blur-sm"
                  >
                    <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      imageCarousel.next();
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-xl transition-all hover:scale-110 z-20 backdrop-blur-sm"
                  >
                    <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </>
          )}
        </div>

        {/* Outfit Info Card (Enhanced Tinder-style info overlay) */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-6 text-white">
          <div className="mb-2">
            <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Outfit #{outfits.length - (outfits.indexOf(currentOutfit) || 0)}
            </h3>
            <div className="flex flex-wrap gap-2">
              {currentOutfit.items.map((item, idx) => (
                <span 
                  key={idx}
                  className="px-4 py-1.5 bg-white/25 backdrop-blur-md rounded-full text-sm font-medium capitalize border border-white/20 shadow-lg"
                >
                  {item.type} • {item.color}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons (Enhanced Tinder-style) */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-5 items-center z-30">
        {/* Dislike Button */}
        <button
          onClick={() => handleSwipe('left')}
          className="w-16 h-16 rounded-full bg-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 border-2 border-red-300 hover:border-red-400 hover:shadow-red-200/50"
        >
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Customize Button */}
        <button
          onClick={() => onCustomize?.(currentOutfit)}
          className="w-14 h-14 rounded-full bg-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 border-2 border-purple-300 hover:border-purple-400 hover:shadow-purple-200/50"
        >
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>

        {/* Like Button */}
        <button
          onClick={() => handleSwipe('right')}
          className="w-16 h-16 rounded-full bg-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 border-2 border-green-300 hover:border-green-400 hover:shadow-green-200/50"
        >
          <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </button>
      </div>

      {/* Swipe Instructions */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-center z-20">
        <p className="bg-white/95 backdrop-blur-md text-gray-700 px-5 py-2.5 rounded-full text-sm font-medium shadow-xl border border-white/50">
          <span className="inline-block mr-2">👆</span>
          Swipe left/right to like/dislike
          <span className="mx-2">•</span>
          Swipe up/down for angles
        </p>
      </div>
    </div>
  );
}
