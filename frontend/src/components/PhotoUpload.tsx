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
    <div className="w-full max-w-md mx-auto p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 card-hover">
      <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        Upload Your Photo
      </h2>
      
      {preview && (
        <div className="mb-6 overflow-hidden rounded-xl shadow-lg border-2 border-purple-200">
          <img
            src={preview.startsWith('data:') ? preview : (preview.startsWith('http') ? preview : `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${preview}`)}
            alt="Preview"
            className="w-full h-64 object-cover"
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
        className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {uploading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Uploading...
          </span>
        ) : preview ? 'Change Photo' : 'Select Photo'}
      </button>

      {error && (
        <p className="mt-2 text-red-600 text-sm">{error}</p>
      )}
    </div>
  );
}

