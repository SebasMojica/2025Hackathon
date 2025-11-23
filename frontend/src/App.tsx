import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { PhotoUpload } from './components/PhotoUpload';
import { WardrobeUpload } from './components/WardrobeUpload';
import { OutfitSwipe } from './components/OutfitSwipe';
import { OutfitCustomizer } from './components/OutfitCustomizer';
import { TryOnPreview } from './components/TryOnPreview';
import { useOutfitSuggestions } from './hooks/useOutfitSuggestions';
import { userApi } from './services/api';
import { User, Outfit } from './types';
import './App.css';

function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await userApi.getUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
            Virtual Try-On Fashion App
          </h1>
          <p className="text-gray-600 text-lg">Discover your perfect style with AI-powered outfit suggestions</p>
        </div>

        {!user && (
          <div className="mb-8">
            <PhotoUpload onUploadComplete={(userData) => {
              setUser(userData);
              navigate('/outfits');
            }} />
          </div>
        )}

        {user && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Welcome!</h2>
            <p className="text-gray-600 mb-4">Your photo is uploaded. Ready to explore outfits?</p>
            <div className="flex gap-4">
              <Link
                to="/outfits"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Browse Outfits
              </Link>
              <Link
                to="/wardrobe"
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Manage Wardrobe
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OutfitsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | undefined>(undefined);
  
  // Get user photo URL for backend to generate try-on images
  const { outfits, loading, error, refetch } = useOutfitSuggestions(5, userPhotoUrl);
  const [customizingOutfit, setCustomizingOutfit] = useState<Outfit | null>(null);
  const [tryOnOutfit, setTryOnOutfit] = useState<{ user: User; outfit: Outfit } | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await userApi.getUser();
      setUser(userData);
      if (userData) {
        // Convert relative URL to absolute for backend
        const photoUrl = userData.photoUrl.startsWith('http') 
          ? userData.photoUrl 
          : `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${userData.photoUrl}`;
        setUserPhotoUrl(photoUrl);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setUserLoading(false);
    }
  };

  if (loading || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading outfit suggestions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (customizingOutfit) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <OutfitCustomizer
          outfit={customizingOutfit}
          onSave={(_outfit) => {
            setCustomizingOutfit(null);
            // Optionally save the customized outfit
          }}
          onCancel={() => setCustomizingOutfit(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* Header removed - using main nav instead */}

      {/* Main Swipe Area */}
      <div className="pt-16 pb-24">
        <OutfitSwipe
          outfits={outfits}
          onSwipeComplete={() => {
            // Optionally refetch when running low
            if (outfits.length < 3) {
              refetch();
            }
          }}
          onCustomize={(outfit) => setCustomizingOutfit(outfit)}
        />
      </div>

      {user && tryOnOutfit && (
        <TryOnPreview
          user={tryOnOutfit.user}
          outfit={tryOnOutfit.outfit}
          onClose={() => setTryOnOutfit(null)}
        />
      )}

      {!user && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-30 max-w-md mx-auto px-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-yellow-800 mb-2 text-sm">Upload your photo first to see virtual try-on!</p>
            <Link
              to="/"
              className="inline-block px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium text-sm"
            >
              Go to Home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function WardrobePage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Wardrobe</h1>
          <Link
            to="/"
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Home
          </Link>
        </div>

        <WardrobeUpload onUploadComplete={() => {
          // Optionally refresh wardrobe list
        }} />
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/outfits" element={<OutfitsPage />} />
        <Route path="/wardrobe" element={<WardrobePage />} />
      </Routes>
    </Router>
  );
}

export default App;
