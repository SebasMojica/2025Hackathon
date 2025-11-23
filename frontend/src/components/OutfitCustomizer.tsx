import { useState, useEffect } from 'react';
import { Outfit, ClothingItem } from '../types';
import { wardrobeApi } from '../services/api';

interface OutfitCustomizerProps {
  outfit: Outfit;
  onSave: (outfit: Outfit) => void;
  onCancel: () => void;
}

export function OutfitCustomizer({ outfit, onSave, onCancel }: OutfitCustomizerProps) {
  const [customizedOutfit, setCustomizedOutfit] = useState<Outfit>({ ...outfit });
  const [wardrobe, setWardrobe] = useState<ClothingItem[]>([]);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);

  useEffect(() => {
    loadWardrobe();
  }, []);

  const loadWardrobe = async () => {
    try {
      const items = await wardrobeApi.getWardrobe();
      setWardrobe(items);
    } catch (error) {
      console.error('Failed to load wardrobe:', error);
    }
  };

  const swapItem = (itemIndex: number, newItem: ClothingItem) => {
    const newItems = [...customizedOutfit.items];
    newItems[itemIndex] = newItem;
    setCustomizedOutfit({ ...customizedOutfit, items: newItems });
    setSelectedItemIndex(null);
  };

  const changeColor = (itemIndex: number, newColor: string) => {
    const newItems = [...customizedOutfit.items];
    newItems[itemIndex] = { ...newItems[itemIndex], color: newColor };
    setCustomizedOutfit({ ...customizedOutfit, items: newItems });
  };

  const removeItem = (itemIndex: number) => {
    const newItems = customizedOutfit.items.filter((_, i) => i !== itemIndex);
    setCustomizedOutfit({ ...customizedOutfit, items: newItems });
  };

  const getImageUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      return apiUrl ? `${apiUrl}${url}` : `http://localhost:3001${url}`;
    }
    return url;
  };

  const availableItems = (type: ClothingItem['type']) => {
    return wardrobe.filter(item => item.type === type);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 md:p-8 bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50">
      <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        Customize Outfit
      </h2>

        <div className="space-y-4 mb-8">
          {customizedOutfit.items.map((item, index) => (
            <div key={`${item.id}-${index}`} className="border-2 border-gray-200 rounded-2xl p-6 bg-gradient-to-br from-gray-50 to-white card-hover">
            <div className="flex gap-4">
              <img
                src={getImageUrl(item.imageUrl)}
                alt={item.type}
                className="w-32 h-32 object-cover rounded-xl shadow-lg border-2 border-gray-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400?text=Clothing+Item';
                }}
              />
              <div className="flex-1">
                <p className="font-medium capitalize text-lg">{item.type}</p>
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                    <input
                      type="text"
                      value={item.color}
                      onChange={(e) => changeColor(index, e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                    />
                </div>
                {item.brand && <p className="text-sm text-gray-600 mt-1">Brand: {item.brand}</p>}
                
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => setSelectedItemIndex(selectedItemIndex === index ? null : index)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl text-sm font-medium hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                    >
                      Swap Item
                    </button>
                    <button
                      onClick={() => removeItem(index)}
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl text-sm font-medium hover:from-red-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                    >
                      Remove
                    </button>
                  </div>

                {selectedItemIndex === index && (
                  <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                    <p className="text-sm font-medium mb-2">Select replacement:</p>
                    <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                      {availableItems(item.type).map((wardrobeItem) => (
                        <button
                          key={wardrobeItem.id}
                          onClick={() => swapItem(index, wardrobeItem)}
                          className="p-2 border border-gray-300 rounded hover:bg-blue-100"
                        >
                          <img
                            src={getImageUrl(wardrobeItem.imageUrl)}
                            alt={wardrobeItem.type}
                            className="w-full h-20 object-cover rounded mb-1"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400?text=Item';
                            }}
                          />
                          <p className="text-xs text-gray-600">{wardrobeItem.color}</p>
                        </button>
                      ))}
                      {availableItems(item.type).length === 0 && (
                        <p className="text-sm text-gray-500 col-span-3">No items of this type in wardrobe</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-semibold hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(customizedOutfit)}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
          >
            Save Outfit
          </button>
        </div>
    </div>
  );
}

