import { useState, useEffect } from 'react';
import { Outfit } from '../types';
import { outfitsApi } from '../services/api';

export function useOutfitSuggestions(count: number = 5) {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await outfitsApi.getSuggestions(count);
      setOutfits(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch outfit suggestions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [count]);

  return { outfits, loading, error, refetch: fetchSuggestions };
}

