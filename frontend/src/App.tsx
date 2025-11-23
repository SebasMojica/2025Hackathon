import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { PhotoUpload } from './components/PhotoUpload';
import { WardrobeUpload } from './components/WardrobeUpload';
import { OutfitSwipe } from './components/OutfitSwipe';
import { OutfitCustomizer } from './components/OutfitCustomizer';
import { TryOnPreview } from './components/TryOnPreview';
import { useOutfitSuggestions } from './hooks/useOutfitSuggestions';
import { userApi, datasetApi } from './services/api';
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
        <div className="text-center">
          <div className="relative">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 bg-purple-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-gray-700 font-medium text-lg">Loading outfit suggestions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-red-600 mb-6 font-medium text-lg">{error}</p>
          <button
            onClick={() => refetch()}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (customizingOutfit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 py-8">
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
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-6 text-center shadow-xl">
            <div className="text-4xl mb-3">📸</div>
            <p className="text-yellow-800 mb-4 font-medium">Upload your photo first to see virtual try-on!</p>
            <Link
              to="/"
              className="inline-block px-6 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 font-semibold text-sm transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { datasetApi } = require('./services/api');

  const handleLoadDataset = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const result = await datasetApi.loadIntoWardrobe();
      setMessage(result.message);
    } catch (err: any) {
      setError(err.message || 'Failed to load dataset into wardrobe.');
    } finally {
      setLoading(false);
    }
  };

  const handleReplaceWardrobe = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const result = await datasetApi.replaceWardrobe();
      setMessage(result.message);
    } catch (err: any) {
      setError(err.message || 'Failed to replace wardrobe with dataset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
            My Wardrobe
          </h1>
          <p className="text-gray-600 text-lg">Manage your clothing collection</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <WardrobeUpload onUploadComplete={() => {
            // Optionally refresh wardrobe list
          }} />
          
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/50 card-hover">
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Dataset Management
            </h2>
            <p className="text-gray-600 mb-6">
              Load the pre-processed Kaggle clothing dataset into your wardrobe for outfit suggestions.
            </p>
            {message && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm font-medium">{message}</p>
              </div>
            )}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleLoadDataset}
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </span>
                ) : (
                  'Load Dataset (Add New)'
                )}
              </button>
              <button
                onClick={handleReplaceWardrobe}
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Replacing...
                  </span>
                ) : (
                  'Replace Wardrobe (Clear & Load)'
                )}
              </button>
            </div>
          </div>
        </div>
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
