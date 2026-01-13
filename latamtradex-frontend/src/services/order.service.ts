import { apiClient } from '@/lib/api-client';
import type { CreateOrderData, Order, ApiResponse } from '@/types';

export const orderService = {
  async createOrder(data: CreateOrderData): Promise<ApiResponse> {
    const response = await apiClient.post('/orders', data);
    return response.data;
  },

  async getOrders(): Promise<Order[]> {
    // Note: This endpoint doesn't exist yet in backend
    // You'll need to add it to the API Gateway
    try {
      const response = await apiClient.get('/orders');
      return response.data;
    } catch (error) {
      console.error('Get orders error:', error);
      return [];
    }
  },

  async getOrder(id: string): Promise<Order | null> {
    try {
      const response = await apiClient.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get order error:', error);
      return null;
    }
  },
};
