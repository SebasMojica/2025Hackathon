import { useSwipeable } from 'react-swipeable';
import { Outfit } from '../types';
import { useSwipe } from '../hooks/useSwipe';

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

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleSwipe('left'),
    onSwipedRight: () => handleSwipe('right'),
    trackMouse: true,
  });

  if (!hasMore) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
        <p className="text-gray-600 mb-4">No more outfits to show!</p>
        <button
          onClick={() => {
            reset();
            if (onSwipeComplete) {
              onSwipeComplete();
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Reset & Get More
        </button>
      </div>
    );
  }

  if (!currentOutfit) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  const getImageUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return `http://localhost:3001${url}`;
    return url;
  };

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div
        {...swipeHandlers}
        className={`relative bg-white rounded-lg shadow-xl overflow-hidden cursor-grab active:cursor-grabbing transition-all duration-300 ${
          swipeDirection === 'left' ? 'transform -translate-x-full opacity-0' :
          swipeDirection === 'right' ? 'transform translate-x-full opacity-0' :
          ''
        }`}
      >
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Outfit Suggestion</h3>
          
          <div className="space-y-4 mb-6">
            {currentOutfit.items.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <img
                  src={getImageUrl(item.imageUrl)}
                  alt={item.type}
                  className="w-full h-48 object-cover rounded-lg mb-2"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400?text=Clothing+Item';
                  }}
                />
                <div className="text-sm text-gray-600">
                  <p className="font-medium capitalize">{item.type}</p>
                  <p>Color: {item.color}</p>
                  {item.brand && <p>Brand: {item.brand}</p>}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleSwipe('left')}
              className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
            >
              ✕ Dislike
            </button>
            <button
              onClick={() => onCustomize?.(currentOutfit)}
              className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
            >
              ✎
            </button>
            <button
              onClick={() => handleSwipe('right')}
              className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
            >
              ♥ Like
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-4">
            Swipe left to dislike, right to like
          </p>
        </div>
      </div>
    </div>
  );
}

