import { apiClient } from '@/lib/api-client';
import type { CreateProductData, Product, ApiResponse } from '@/types';

export const catalogService = {
  async createProduct(data: CreateProductData): Promise<ApiResponse> {
    const response = await apiClient.post('/catalog/products', data);
    return response.data;
  },

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    const response = await apiClient.get(`/catalog/products/${id}`);
    return response.data;
  },

  async getAllProducts(): Promise<Product[]> {
    // Note: This endpoint doesn't exist yet in backend
    // You'll need to add it to the API Gateway
    try {
      const response = await apiClient.get('/catalog/products');
      return response.data;
    } catch (error) {
      console.error('Get products error:', error);
      return [];
    }
  },
};
