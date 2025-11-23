import axios from 'axios';
import { User, ClothingItem, Outfit } from '../types';

const API_BASE_URL = '/api';

// User API
export const userApi = {
  getUser: async (): Promise<User | null> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user`);
      return response.data;
    } catch (error: any) {
      // Return null if user doesn't exist (404) or other errors
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error fetching user:', error);
      return null;
    }
  },
  uploadPhoto: async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('photo', file);
    const response = await axios.post(`${API_BASE_URL}/user/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

// Wardrobe API
export const wardrobeApi = {
  getWardrobe: async (): Promise<ClothingItem[]> => {
    const response = await axios.get(`${API_BASE_URL}/wardrobe`);
    return response.data;
  },
  addItem: async (item: {
    file: File;
    type: ClothingItem['type'];
    color: string;
    brand?: string;
    purchaseDate?: string;
  }): Promise<ClothingItem> => {
    const formData = new FormData();
    formData.append('image', item.file);
    formData.append('type', item.type);
    formData.append('color', item.color);
    if (item.brand) formData.append('brand', item.brand);
    if (item.purchaseDate) formData.append('purchaseDate', item.purchaseDate);
    
    const response = await axios.post(`${API_BASE_URL}/wardrobe`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  getPurchaseHistory: async (): Promise<ClothingItem[]> => {
    const response = await axios.get(`${API_BASE_URL}/wardrobe/purchase-history`);
    return response.data;
  },
  addToPurchaseHistory: async (item: {
    file: File;
    type: ClothingItem['type'];
    color: string;
    brand?: string;
    purchaseDate?: string;
  }): Promise<ClothingItem> => {
    const formData = new FormData();
    formData.append('image', item.file);
    formData.append('type', item.type);
    formData.append('color', item.color);
    if (item.brand) formData.append('brand', item.brand);
    if (item.purchaseDate) formData.append('purchaseDate', item.purchaseDate);
    
    const response = await axios.post(`${API_BASE_URL}/wardrobe/purchase-history`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

// Outfits API
export const outfitsApi = {
  getSuggestions: async (count: number = 5, userPhotoUrl?: string): Promise<Outfit[]> => {
    const params: any = { count };
    if (userPhotoUrl) {
      params.userPhotoUrl = userPhotoUrl;
    }
    const response = await axios.get(`${API_BASE_URL}/outfits/suggestions`, {
      params,
    });
    return response.data;
  },
  swipe: async (outfitId: string, direction: 'left' | 'right'): Promise<void> => {
    await axios.post(`${API_BASE_URL}/outfits/swipe`, { outfitId, direction });
  },
};

// fal.ai API
export const falApi = {
  generateTryOn: async (userPhotoUrl: string, clothingItemUrl: string): Promise<string> => {
    const response = await axios.post(`${API_BASE_URL}/fal/try-on`, {
      userPhotoUrl,
      clothingItemUrl,
    });
    return response.data.imageUrl;
  },
  generateMultipleAngles: async (
    userPhotoUrl: string,
    clothingItemUrl: string,
    angles?: string[]
  ): Promise<string[]> => {
    const response = await axios.post(`${API_BASE_URL}/fal/try-on/angles`, {
      userPhotoUrl,
      clothingItemUrl,
      angles,
    });
    return response.data.imageUrls || [];
  },
  // Generate try-on from file uploads
  generateFromUpload: async (userPhotoFile: File, clothingItemFile: File): Promise<string> => {
    const formData = new FormData();
    formData.append('userPhoto', userPhotoFile);
    formData.append('clothingItem', clothingItemFile);
    
    const response = await axios.post(`${API_BASE_URL}/fal/generate-from-upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.imageUrl;
  },
};

// Dataset API
export const datasetApi = {
  getDataset: async (): Promise<ClothingItem[]> => {
    const response = await axios.get(`${API_BASE_URL}/dataset`);
    return response.data;
  },
  loadIntoWardrobe: async (): Promise<{ success: boolean; count: number; message: string }> => {
    const response = await axios.post(`${API_BASE_URL}/dataset/load-into-wardrobe`);
    return response.data;
  },
  replaceWardrobe: async (): Promise<{ success: boolean; count: number; message: string }> => {
    const response = await axios.post(`${API_BASE_URL}/dataset/replace-wardrobe`);
    return response.data;
  },
};

