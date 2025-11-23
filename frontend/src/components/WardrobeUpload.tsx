import { useState, useRef } from 'react';
import { wardrobeApi } from '../services/api';
import { ClothingItem } from '../types';

interface WardrobeUploadProps {
  onUploadComplete?: () => void;
}

export function WardrobeUpload({ onUploadComplete }: WardrobeUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    type: 'top' as ClothingItem['type'],
    color: '',
    brand: '',
    purchaseDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    
    if (!file) {
      setError('Please select an image file');
      return;
    }

    if (!formData.color) {
      setError('Please enter a color');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setSuccess(false);
      
      await wardrobeApi.addItem({
        file,
        ...formData,
      });

      setSuccess(true);
      setFormData({
        type: 'top',
        color: '',
        brand: '',
        purchaseDate: '',
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload item');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Add to Wardrobe</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as ClothingItem['type'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
            <option value="dress">Dress</option>
            <option value="outerwear">Outerwear</option>
            <option value="shoes">Shoes</option>
            <option value="accessories">Accessories</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Color *
          </label>
          <input
            type="text"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="e.g., blue, red, black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Brand (optional)
          </label>
          <input
            type="text"
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Purchase Date (optional)
          </label>
          <input
            type="date"
            value={formData.purchaseDate}
            onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Add to Wardrobe'}
        </button>

        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}

        {success && (
          <p className="text-green-600 text-sm">Item added successfully!</p>
        )}
      </form>
    </div>
  );
}

