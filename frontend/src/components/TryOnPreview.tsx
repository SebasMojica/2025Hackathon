import { useState } from 'react';
import { Outfit, User } from '../types';
import { falApi } from '../services/api';

interface TryOnPreviewProps {
  user: User;
  outfit: Outfit;
  onClose: () => void;
}

export function TryOnPreview({ user, outfit, onClose }: TryOnPreviewProps) {
  const [generating, setGenerating] = useState(false);
  const [tryOnImage, setTryOnImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getImageUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return `http://localhost:3001${url}`;
    return url;
  };

  const generateTryOn = async () => {
    if (outfit.items.length === 0) {
      setError('Outfit has no items');
      return;
    }

    setGenerating(true);
    setError(null);
    setTryOnImage(null);

    try {
      const userPhotoUrl = getImageUrl(user.photoUrl);
      // For now, try on with the first item
      // In a full implementation, you might want to combine multiple items
      const clothingItemUrl = getImageUrl(outfit.items[0].imageUrl);
      
      const resultImageUrl = await falApi.generateTryOn(userPhotoUrl, clothingItemUrl);
      setTryOnImage(resultImageUrl);
    } catch (err: any) {
      setError(err.message || 'Failed to generate try-on image');
      console.error('Try-on generation error:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Virtual Try-On</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {!tryOnImage && !generating && (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Ready to see how this outfit looks on you?</p>
              <button
                onClick={generateTryOn}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Generate Try-On
              </button>
            </div>
          )}

          {generating && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Generating your virtual try-on...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
            </div>
          )}

          {tryOnImage && (
            <div>
              <img
                src={tryOnImage}
                alt="Virtual try-on result"
                className="w-full rounded-lg mb-4"
                onError={(e) => {
                  setError('Failed to load try-on image');
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="flex gap-4">
                <button
                  onClick={generateTryOn}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Regenerate
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
              <button
                onClick={generateTryOn}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                Try Again
              </button>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-medium mb-2">Outfit Details:</h3>
            <div className="space-y-2">
              {outfit.items.map((item, index) => (
                <div key={index} className="text-sm text-gray-600">
                  <span className="capitalize font-medium">{item.type}</span>
                  {' - '}
                  <span>{item.color}</span>
                  {item.brand && <span> ({item.brand})</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

