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
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Customize Outfit</h2>

      <div className="space-y-4 mb-6">
        {customizedOutfit.items.map((item, index) => (
          <div key={`${item.id}-${index}`} className="border border-gray-200 rounded-lg p-4">
            <div className="flex gap-4">
              <img
                src={getImageUrl(item.imageUrl)}
                alt={item.type}
                className="w-32 h-32 object-cover rounded-lg"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                {item.brand && <p className="text-sm text-gray-600 mt-1">Brand: {item.brand}</p>}
                
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setSelectedItemIndex(selectedItemIndex === index ? null : index)}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    Swap Item
                  </button>
                  <button
                    onClick={() => removeItem(index)}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
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
          className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(customizedOutfit)}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Save Outfit
        </button>
      </div>
    </div>
  );
}

