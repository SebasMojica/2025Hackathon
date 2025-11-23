import { useState, useRef } from 'react';
import { userApi } from '../services/api';
import { User } from '../types';

interface PhotoUploadProps {
  onUploadComplete: (user: User) => void;
  existingUser?: User | null;
}

export function PhotoUpload({ onUploadComplete, existingUser }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(existingUser?.photoUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    try {
      setUploading(true);
      setError(null);
      const user = await userApi.uploadPhoto(file);
      onUploadComplete(user);
    } catch (err: any) {
      setError(err.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Upload Your Photo</h2>
      
      {preview && (
        <div className="mb-4">
          <img
            src={preview.startsWith('data:') ? preview : (preview.startsWith('http') ? preview : `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${preview}`)}
            alt="Preview"
            className="w-full h-64 object-cover rounded-lg"
          />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? 'Uploading...' : preview ? 'Change Photo' : 'Select Photo'}
      </button>

      {error && (
        <p className="mt-2 text-red-600 text-sm">{error}</p>
      )}
    </div>
  );
}

