// Event Topics
export enum EventTopics {
  USER_REGISTERED = 'user.registered',
  ORDER_CREATED = 'order.created',
  ORDER_UPDATED = 'order.updated',
  STOCK_UPDATED = 'stock.updated',
}

// User Events
export interface UserRegisteredEvent {
  userId: string;
  email: string;
  role: string;
  createdAt: string;
}

// Order Events
export interface OrderCreatedEvent {
  orderId: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface OrderUpdatedEvent {
  orderId: string;
  status: string;
  updatedAt: string;
}

// Stock Events
export interface StockUpdatedEvent {
  productId: string;
  quantity: number;
  operation: 'increase' | 'decrease';
  updatedAt: string;
}

// Generic Event Wrapper
export interface Event<T> {
  eventId: string;
  eventType: string;
  timestamp: string;
  source: string;
  data: T;
}
