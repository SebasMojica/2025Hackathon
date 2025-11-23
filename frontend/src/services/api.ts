import axios from 'axios';
import { User, ClothingItem, Outfit, SwipeAction } from '../types';

const API_BASE_URL = '/api';

// User API
export const userApi = {
  getUser: async (): Promise<User | null> => {
    const response = await axios.get(`${API_BASE_URL}/user`);
    return response.data;
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
  getSuggestions: async (count: number = 5): Promise<Outfit[]> => {
    const response = await axios.get(`${API_BASE_URL}/outfits/suggestions`, {
      params: { count },
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
};

